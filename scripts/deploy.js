const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying YieldLock+ contracts...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Chainlink configuration for Sepolia testnet
  const CHAINLINK_CONFIG = {
    sepolia: {
      functionsRouter: "0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C",
      automationRegistry: "0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2",
      usdcPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306", // ETH/USD price feed
      usdcToken: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" // Sepolia USDC
    },
    base: {
      functionsRouter: "0x192E9329bDa3622331824D4F4f5C5e2F75C3e6C0",
      automationRegistry: "0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2",
      usdcPriceFeed: "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
      usdcToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" // Base USDC
    }
  };

  // Get network
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "sepolia" : network.name;
  
  console.log(`📡 Network: ${networkName}`);
  
  const config = CHAINLINK_CONFIG[networkName];
  if (!config) {
    throw new Error(`Unsupported network: ${networkName}`);
  }

  // Deploy YieldLockPlus contract
  console.log("📦 Deploying YieldLockPlus...");
  const YieldLockPlus = await ethers.getContractFactory("YieldLockPlus");
  const yieldLockPlus = await YieldLockPlus.deploy(
    config.functionsRouter,
    config.usdcPriceFeed,
    config.usdcToken
  );

  await yieldLockPlus.waitForDeployment();
  const yieldLockPlusAddress = await yieldLockPlus.getAddress();

  console.log("✅ YieldLockPlus deployed to:", yieldLockPlusAddress);

  // Deploy mock USDC for testing (if not on mainnet/testnet with real USDC)
  if (networkName === "hardhat" || networkName === "localhost") {
    console.log("🪙 Deploying Mock USDC...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();
    const mockUSDCAddress = await mockUSDC.getAddress();
    
    console.log("✅ Mock USDC deployed to:", mockUSDCAddress);
    
    // Mint some USDC to deployer for testing
    const mintAmount = ethers.parseUnits("10000", 6); // 10,000 USDC
    await mockUSDC.mint(deployer.address, mintAmount);
    console.log("💰 Minted 10,000 USDC to deployer");
  }

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  console.log("Contract addresses:");
  console.log("- YieldLockPlus:", yieldLockPlusAddress);
  console.log("- Functions Router:", config.functionsRouter);
  console.log("- USDC Price Feed:", config.usdcPriceFeed);
  console.log("- USDC Token:", config.usdcToken);

  // Test basic functionality
  console.log("\n🧪 Testing basic functionality...");
  
  try {
    const vaultCounter = await yieldLockPlus.vaultIdCounter();
    console.log("✅ Vault counter initialized:", vaultCounter.toString());
    
    const earlyPenalty = await yieldLockPlus.earlyWithdrawalPenalty();
    console.log("✅ Early withdrawal penalty set:", earlyPenalty.toString(), "%");
    
    const minDuration = await yieldLockPlus.minLockDuration();
    console.log("✅ Min lock duration:", minDuration.toString(), "seconds");
    
  } catch (error) {
    console.log("⚠️ Basic tests failed:", error.message);
  }

  // Save deployment info
  const deploymentInfo = {
    network: networkName,
    deployer: deployer.address,
    contracts: {
      yieldLockPlus: yieldLockPlusAddress,
      functionsRouter: config.functionsRouter,
      usdcPriceFeed: config.usdcPriceFeed,
      usdcToken: config.usdcToken
    },
    timestamp: new Date().toISOString()
  };

  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Instructions for next steps
  console.log("\n🎯 Next Steps:");
  console.log("1. Update CONTRACT_ADDRESS in frontend/src/App.js");
  console.log("2. Set up Chainlink Functions subscription");
  console.log("3. Register automation upkeep");
  console.log("4. Test the frontend application");

  return deploymentInfo;
}

// Mock USDC contract for local testing
async function deployMockUSDC() {
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  return await mockUSDC.getAddress();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
});
