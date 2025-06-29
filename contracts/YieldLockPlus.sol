// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract YieldLockPlus is AutomationCompatibleInterface, FunctionsClient, ReentrancyGuard {
    struct GoalVault {
        uint256 amount;
        uint256 unlockTime;
        address user;
        bool withdrawn;
        string strategy;
        string name;
        uint256 targetAmount;
        uint256 currentYield;
        uint256 createdAt;
        bool isActive;
    }

    struct Strategy {
        string name;
        uint256 aaveAllocation;
        uint256 compoundAllocation;
        uint256 gmxAllocation;
        uint256 riskLevel; // 1-5 scale
    }

    uint256 public vaultIdCounter;
    mapping(uint256 => GoalVault) public vaults;
    mapping(address => uint256[]) public userVaults;
    mapping(uint256 => Strategy) public strategies;
    
    // Configuration
    uint256 public earlyWithdrawalPenalty = 5; // 5% penalty
    uint256 public minLockDuration = 7 days;
    uint256 public maxLockDuration = 365 days;
    
    // Chainlink Price Feeds
    address public usdcPriceFeed;
    address public usdcToken;
    
    // Events
    event VaultCreated(uint256 vaultId, address indexed user, string name, uint256 amount, uint256 targetAmount, uint256 unlockTime);
    event StrategySet(uint256 vaultId, string strategy);
    event Withdrawn(uint256 vaultId, uint256 amount, bool earlyWithdrawal);
    event YieldUpdated(uint256 vaultId, uint256 newYield);
    event VaultRebalanced(uint256 vaultId, string newStrategy);

    constructor(address router, address _usdcPriceFeed, address _usdcToken) FunctionsClient(router) {
        usdcPriceFeed = _usdcPriceFeed;
        usdcToken = _usdcToken;
    }

    modifier onlyVaultOwner(uint256 vaultId) {
        require(vaults[vaultId].user == msg.sender, "Not vault owner");
        _;
    }

    function createVault(
        string memory _name, 
        uint256 _targetAmount, 
        uint256 _unlockTime,
        uint256 _amount
    ) external nonReentrant {
        require(_amount > 0, "No funds sent");
        require(_unlockTime > block.timestamp + minLockDuration, "Lock time too short");
        require(_unlockTime <= block.timestamp + maxLockDuration, "Lock time too long");
        require(_targetAmount >= _amount, "Target must be >= initial amount");

        // Transfer USDC from user
        IERC20(usdcToken).transferFrom(msg.sender, address(this), _amount);

        vaults[vaultIdCounter] = GoalVault({
            amount: _amount,
            unlockTime: _unlockTime,
            user: msg.sender,
            withdrawn: false,
            strategy: "",
            name: _name,
            targetAmount: _targetAmount,
            currentYield: 0,
            createdAt: block.timestamp,
            isActive: true
        });

        userVaults[msg.sender].push(vaultIdCounter);

        emit VaultCreated(vaultIdCounter, msg.sender, _name, _amount, _targetAmount, _unlockTime);
        vaultIdCounter++;
    }

    // Chainlink Functions callback - AI sets strategy
    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
        require(response.length > 0, "Empty AI response");
        
        // Parse AI response to get vault ID and strategy
        (uint256 vaultId, string memory strategy) = abi.decode(response, (uint256, string));
        require(vaultId < vaultIdCounter, "Invalid vault ID");
        
        vaults[vaultId].strategy = strategy;
        emit StrategySet(vaultId, strategy);
    }

    function withdraw(uint256 vaultId) external nonReentrant onlyVaultOwner(vaultId) {
        GoalVault storage vault = vaults[vaultId];
        require(!vault.withdrawn, "Already withdrawn");
        require(vault.isActive, "Vault not active");

        uint256 withdrawAmount = vault.amount + vault.currentYield;
        bool isEarlyWithdrawal = block.timestamp < vault.unlockTime;
        
        if (isEarlyWithdrawal) {
            uint256 penalty = (withdrawAmount * earlyWithdrawalPenalty) / 100;
            withdrawAmount -= penalty;
        }

        vault.withdrawn = true;
        vault.isActive = false;

        IERC20(usdcToken).transfer(msg.sender, withdrawAmount);

        emit Withdrawn(vaultId, withdrawAmount, isEarlyWithdrawal);
    }

    // Automation - Check for vaults that need attention
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory) {
        for (uint256 i = 0; i < vaultIdCounter; i++) {
            GoalVault storage vault = vaults[i];
            
            // Check if vault is mature
            if (vault.isActive && !vault.withdrawn && block.timestamp >= vault.unlockTime) {
                return (true, abi.encode("mature", i));
            }
            
            // Check if vault needs rebalancing (every 30 days)
            if (vault.isActive && !vault.withdrawn && 
                (block.timestamp - vault.createdAt) % 30 days == 0) {
                return (true, abi.encode("rebalance", i));
            }
        }
        return (false, "");
    }

    function performUpkeep(bytes calldata performData) external override {
        (string memory action, uint256 vaultId) = abi.decode(performData, (string, uint256));
        
        if (keccak256(bytes(action)) == keccak256(bytes("mature"))) {
            _handleMatureVault(vaultId);
        } else if (keccak256(bytes(action)) == keccak256(bytes("rebalance"))) {
            _handleRebalanceVault(vaultId);
        }
    }

    function _handleMatureVault(uint256 vaultId) internal {
        GoalVault storage vault = vaults[vaultId];
        require(vault.isActive && !vault.withdrawn && block.timestamp >= vault.unlockTime, "Not ready");
        
        // Calculate final yield (simplified - in real implementation would check actual DeFi yields)
        uint256 timeLocked = block.timestamp - vault.createdAt;
        uint256 annualYield = 800; // 8% APY (simplified)
        vault.currentYield = (vault.amount * annualYield * timeLocked) / (365 days * 10000);
        
        emit YieldUpdated(vaultId, vault.currentYield);
    }

    function _handleRebalanceVault(uint256 vaultId) internal {
        GoalVault storage vault = vaults[vaultId];
        require(vault.isActive && !vault.withdrawn, "Vault not active");
        
        // Update yield based on current strategy performance
        uint256 timeSinceLastUpdate = block.timestamp - vault.createdAt;
        uint256 annualYield = 800; // 8% APY (simplified)
        vault.currentYield = (vault.amount * annualYield * timeSinceLastUpdate) / (365 days * 10000);
        
        emit YieldUpdated(vaultId, vault.currentYield);
    }

    // View functions
    function getVault(uint256 vaultId) external view returns (GoalVault memory) {
        return vaults[vaultId];
    }

    function getUserVaults(address user) external view returns (uint256[] memory) {
        return userVaults[user];
    }

    function getVaultProgress(uint256 vaultId) external view returns (uint256 progress, string memory status) {
        GoalVault storage vault = vaults[vaultId];
        uint256 totalValue = vault.amount + vault.currentYield;
        
        if (totalValue >= vault.targetAmount) {
            return (100, "Goal Hit!");
        } else if (totalValue >= (vault.targetAmount * 80) / 100) {
            return ((totalValue * 100) / vault.targetAmount, "On Track");
        } else if (totalValue >= (vault.targetAmount * 60) / 100) {
            return ((totalValue * 100) / vault.targetAmount, "Low Yield");
        } else {
            return ((totalValue * 100) / vault.targetAmount, "Behind Schedule");
        }
    }

    // Admin functions
    function setEarlyWithdrawalPenalty(uint256 _penalty) external {
        // In production, add access control
        earlyWithdrawalPenalty = _penalty;
    }

    function setLockDurationLimits(uint256 _min, uint256 _max) external {
        // In production, add access control
        minLockDuration = _min;
        maxLockDuration = _max;
    }
}
