const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("YieldLockPlus", function () {
  let yieldLockPlus;
  let mockUSDC;
  let owner;
  let user1;
  let user2;
  let functionsRouter;
  let usdcPriceFeed;
  let usdcToken;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock contracts
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();

    // Mock addresses for Chainlink services
    functionsRouter = "0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C";
    usdcPriceFeed = "0x1cDc4F51831F4eE8A0B6Aa61Db0Ff6487555Bc6d";
    usdcToken = await mockUSDC.getAddress();

    // Deploy YieldLockPlus
    const YieldLockPlus = await ethers.getContractFactory("YieldLockPlus");
    yieldLockPlus = await YieldLockPlus.deploy(
      functionsRouter,
      usdcPriceFeed,
      usdcToken
    );

    // Mint USDC to users for testing
    const mintAmount = ethers.parseUnits("10000", 6); // 10,000 USDC
    await mockUSDC.mint(user1.address, mintAmount);
    await mockUSDC.mint(user2.address, mintAmount);
  });

  describe("Deployment", function () {
    it("Should set the correct initial values", async function () {
      expect(await yieldLockPlus.vaultIdCounter()).to.equal(0);
      expect(await yieldLockPlus.earlyWithdrawalPenalty()).to.equal(5);
      expect(await yieldLockPlus.minLockDuration()).to.equal(7 * 24 * 60 * 60); // 7 days
      expect(await yieldLockPlus.maxLockDuration()).to.equal(365 * 24 * 60 * 60); // 365 days
      expect(await yieldLockPlus.usdcToken()).to.equal(usdcToken);
      expect(await yieldLockPlus.usdcPriceFeed()).to.equal(usdcPriceFeed);
    });
  });

  describe("Vault Creation", function () {
    it("Should create a vault successfully", async function () {
      const vaultName = "Rent for September";
      const targetAmount = ethers.parseUnits("500", 6); // 500 USDC
      const initialAmount = ethers.parseUnits("100", 6); // 100 USDC
      const unlockTime = (await time.latest()) + 90 * 24 * 60 * 60; // 90 days from now

      // Approve USDC spending
      await mockUSDC.connect(user1).approve(await yieldLockPlus.getAddress(), initialAmount);

      // Create vault
      await expect(
        yieldLockPlus.connect(user1).createVault(
          vaultName,
          targetAmount,
          unlockTime,
          initialAmount
        )
      ).to.emit(yieldLockPlus, "VaultCreated")
        .withArgs(0, user1.address, vaultName, initialAmount, targetAmount, unlockTime);

      // Check vault data
      const vault = await yieldLockPlus.getVault(0);
      expect(vault.name).to.equal(vaultName);
      expect(vault.amount).to.equal(initialAmount);
      expect(vault.targetAmount).to.equal(targetAmount);
      expect(vault.user).to.equal(user1.address);
      expect(vault.withdrawn).to.be.false;
      expect(vault.isActive).to.be.true;

      // Check user vaults mapping
      const userVaults = await yieldLockPlus.getUserVaults(user1.address);
      expect(userVaults).to.deep.equal([0n]);
    });

    it("Should fail if no funds are sent", async function () {
      const unlockTime = (await time.latest()) + 90 * 24 * 60 * 60;
      
      await expect(
        yieldLockPlus.connect(user1).createVault(
          "Test Goal",
          ethers.parseUnits("500", 6),
          unlockTime,
          0
        )
      ).to.be.revertedWith("No funds sent");
    });

    it("Should fail if lock time is too short", async function () {
      const unlockTime = (await time.latest()) + 6 * 24 * 60 * 60; // 6 days (less than 7)
      
      await mockUSDC.connect(user1).approve(await yieldLockPlus.getAddress(), ethers.parseUnits("100", 6));
      
      await expect(
        yieldLockPlus.connect(user1).createVault(
          "Test Goal",
          ethers.parseUnits("500", 6),
          unlockTime,
          ethers.parseUnits("100", 6)
        )
      ).to.be.revertedWith("Lock time too short");
    });

    it("Should fail if lock time is too long", async function () {
      const unlockTime = (await time.latest()) + 400 * 24 * 60 * 60; // 400 days (more than 365)
      
      await mockUSDC.connect(user1).approve(await yieldLockPlus.getAddress(), ethers.parseUnits("100", 6));
      
      await expect(
        yieldLockPlus.connect(user1).createVault(
          "Test Goal",
          ethers.parseUnits("500", 6),
          unlockTime,
          ethers.parseUnits("100", 6)
        )
      ).to.be.revertedWith("Lock time too long");
    });

    it("Should fail if target amount is less than initial amount", async function () {
      const unlockTime = (await time.latest()) + 90 * 24 * 60 * 60;
      
      await mockUSDC.connect(user1).approve(await yieldLockPlus.getAddress(), ethers.parseUnits("100", 6));
      
      await expect(
        yieldLockPlus.connect(user1).createVault(
          "Test Goal",
          ethers.parseUnits("50", 6), // Target less than initial
          unlockTime,
          ethers.parseUnits("100", 6)
        )
      ).to.be.revertedWith("Target must be >= initial amount");
    });
  });

  describe("Withdrawal", function () {
    let vaultId;
    let unlockTime;

    beforeEach(async function () {
      // Create a vault for testing
      unlockTime = (await time.latest()) + 90 * 24 * 60 * 60;
      const initialAmount = ethers.parseUnits("100", 6);
      
      await mockUSDC.connect(user1).approve(await yieldLockPlus.getAddress(), initialAmount);
      
      await yieldLockPlus.connect(user1).createVault(
        "Test Goal",
        ethers.parseUnits("500", 6),
        unlockTime,
        initialAmount
      );
      
      vaultId = 0;
    });

    it("Should allow withdrawal after unlock time", async function () {
      // Fast forward time
      await time.increaseTo(unlockTime + 1);

      const initialBalance = await mockUSDC.balanceOf(user1.address);
      
      await expect(
        yieldLockPlus.connect(user1).withdraw(vaultId)
      ).to.emit(yieldLockPlus, "Withdrawn")
        .withArgs(vaultId, ethers.parseUnits("100", 6), false);

      const finalBalance = await mockUSDC.balanceOf(user1.address);
      expect(finalBalance).to.be.gt(initialBalance);

      // Check vault is marked as withdrawn
      const vault = await yieldLockPlus.getVault(vaultId);
      expect(vault.withdrawn).to.be.true;
      expect(vault.isActive).to.be.false;
    });

    it("Should apply penalty for early withdrawal", async function () {
      const initialBalance = await mockUSDC.balanceOf(user1.address);
      
      await expect(
        yieldLockPlus.connect(user1).withdraw(vaultId)
      ).to.emit(yieldLockPlus, "Withdrawn")
        .withArgs(vaultId, ethers.parseUnits("95", 6), true); // 5% penalty

      const finalBalance = await mockUSDC.balanceOf(user1.address);
      expect(finalBalance).to.be.lt(initialBalance);
    });

    it("Should fail if vault is already withdrawn", async function () {
      await time.increaseTo(unlockTime + 1);
      await yieldLockPlus.connect(user1).withdraw(vaultId);
      
      await expect(
        yieldLockPlus.connect(user1).withdraw(vaultId)
      ).to.be.revertedWith("Already withdrawn");
    });

    it("Should fail if caller is not vault owner", async function () {
      await expect(
        yieldLockPlus.connect(user2).withdraw(vaultId)
      ).to.be.revertedWith("Not vault owner");
    });
  });

  describe("Vault Progress", function () {
    it("Should calculate progress correctly", async function () {
      const initialAmount = ethers.parseUnits("100", 6);
      const targetAmount = ethers.parseUnits("500", 6);
      
      await mockUSDC.connect(user1).approve(await yieldLockPlus.getAddress(), initialAmount);
      
      await yieldLockPlus.connect(user1).createVault(
        "Test Goal",
        targetAmount,
        (await time.latest()) + 90 * 24 * 60 * 60,
        initialAmount
      );

      const [progress, status] = await yieldLockPlus.getVaultProgress(0);
      expect(progress).to.equal(20); // 100/500 = 20%
      expect(status).to.equal("Behind Schedule");
    });
  });

  describe("Automation", function () {
    it("Should detect mature vaults", async function () {
      const unlockTime = (await time.latest()) + 90 * 24 * 60 * 60;
      const initialAmount = ethers.parseUnits("100", 6);
      
      await mockUSDC.connect(user1).approve(await yieldLockPlus.getAddress(), initialAmount);
      
      await yieldLockPlus.connect(user1).createVault(
        "Test Goal",
        ethers.parseUnits("500", 6),
        unlockTime,
        initialAmount
      );

      // Check upkeep before maturity
      let [upkeepNeeded, performData] = await yieldLockPlus.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.false;

      // Fast forward to maturity
      await time.increaseTo(unlockTime + 1);

      // Check upkeep after maturity
      [upkeepNeeded, performData] = await yieldLockPlus.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.true;
    });

    it("Should perform upkeep for mature vaults", async function () {
      const unlockTime = (await time.latest()) + 90 * 24 * 60 * 60;
      const initialAmount = ethers.parseUnits("100", 6);
      
      await mockUSDC.connect(user1).approve(await yieldLockPlus.getAddress(), initialAmount);
      
      await yieldLockPlus.connect(user1).createVault(
        "Test Goal",
        ethers.parseUnits("500", 6),
        unlockTime,
        initialAmount
      );

      // Fast forward to maturity
      await time.increaseTo(unlockTime + 1);

      // Perform upkeep
      await expect(
        yieldLockPlus.performUpkeep(ethers.AbiCoder.defaultAbiCoder().encode(["string", "uint256"], ["mature", 0]))
      ).to.emit(yieldLockPlus, "YieldUpdated");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow setting early withdrawal penalty", async function () {
      await yieldLockPlus.setEarlyWithdrawalPenalty(10);
      expect(await yieldLockPlus.earlyWithdrawalPenalty()).to.equal(10);
    });

    it("Should allow setting lock duration limits", async function () {
      const newMin = 14 * 24 * 60 * 60; // 14 days
      const newMax = 730 * 24 * 60 * 60; // 730 days
      
      await yieldLockPlus.setLockDurationLimits(newMin, newMax);
      expect(await yieldLockPlus.minLockDuration()).to.equal(newMin);
      expect(await yieldLockPlus.maxLockDuration()).to.equal(newMax);
    });
  });

  describe("Multiple Vaults", function () {
    it("Should handle multiple vaults per user", async function () {
      const unlockTime1 = (await time.latest()) + 90 * 24 * 60 * 60;
      const unlockTime2 = (await time.latest()) + 180 * 24 * 60 * 60;
      
      await mockUSDC.connect(user1).approve(await yieldLockPlus.getAddress(), ethers.parseUnits("200", 6));
      
      // Create first vault
      await yieldLockPlus.connect(user1).createVault(
        "Rent Goal",
        ethers.parseUnits("500", 6),
        unlockTime1,
        ethers.parseUnits("100", 6)
      );

      // Create second vault
      await yieldLockPlus.connect(user1).createVault(
        "Vacation Goal",
        ethers.parseUnits("1000", 6),
        unlockTime2,
        ethers.parseUnits("100", 6)
      );

      const userVaults = await yieldLockPlus.getUserVaults(user1.address);
      expect(userVaults).to.deep.equal([0n, 1n]);

      // Check vault counter
      expect(await yieldLockPlus.vaultIdCounter()).to.equal(2);
    });
  });
});
