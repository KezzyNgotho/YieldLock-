"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var _require = require("hardhat"),
    ethers = _require.ethers;

function main() {
  var _ref, _ref2, deployer, CHAINLINK_CONFIG, network, networkName, config, YieldLockPlus, yieldLockPlus, yieldLockPlusAddress, MockUSDC, mockUSDC, mockUSDCAddress, mintAmount, vaultCounter, earlyPenalty, minDuration, deploymentInfo;

  return regeneratorRuntime.async(function main$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log("🚀 Deploying YieldLock+ contracts..."); // Get deployer account

          _context.next = 3;
          return regeneratorRuntime.awrap(ethers.getSigners());

        case 3:
          _ref = _context.sent;
          _ref2 = _slicedToArray(_ref, 1);
          deployer = _ref2[0];
          console.log("Deploying contracts with account:", deployer.address); // Chainlink configuration for Sepolia testnet

          CHAINLINK_CONFIG = {
            sepolia: {
              functionsRouter: "0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C",
              automationRegistry: "0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2",
              usdcPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
              // ETH/USD price feed
              usdcToken: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" // Sepolia USDC

            },
            base: {
              functionsRouter: "0x192E9329bDa3622331824D4F4f5C5e2F75C3e6C0",
              automationRegistry: "0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2",
              usdcPriceFeed: "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
              usdcToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" // Base USDC

            }
          }; // Get network

          _context.next = 10;
          return regeneratorRuntime.awrap(ethers.provider.getNetwork());

        case 10:
          network = _context.sent;
          networkName = network.name === "unknown" ? "sepolia" : network.name;
          console.log("\uD83D\uDCE1 Network: ".concat(networkName));
          config = CHAINLINK_CONFIG[networkName];

          if (config) {
            _context.next = 16;
            break;
          }

          throw new Error("Unsupported network: ".concat(networkName));

        case 16:
          // Deploy YieldLockPlus contract
          console.log("📦 Deploying YieldLockPlus...");
          _context.next = 19;
          return regeneratorRuntime.awrap(ethers.getContractFactory("YieldLockPlus"));

        case 19:
          YieldLockPlus = _context.sent;
          _context.next = 22;
          return regeneratorRuntime.awrap(YieldLockPlus.deploy(config.functionsRouter, deployer.address // initialOwner for Ownable
          ));

        case 22:
          yieldLockPlus = _context.sent;
          _context.next = 25;
          return regeneratorRuntime.awrap(yieldLockPlus.waitForDeployment());

        case 25:
          _context.next = 27;
          return regeneratorRuntime.awrap(yieldLockPlus.getAddress());

        case 27:
          yieldLockPlusAddress = _context.sent;
          console.log("✅ YieldLockPlus deployed to:", yieldLockPlusAddress); // Deploy mock USDC for testing (if not on mainnet/testnet with real USDC)

          if (!(networkName === "hardhat" || networkName === "localhost")) {
            _context.next = 47;
            break;
          }

          console.log("🪙 Deploying Mock USDC...");
          _context.next = 33;
          return regeneratorRuntime.awrap(ethers.getContractFactory("MockUSDC"));

        case 33:
          MockUSDC = _context.sent;
          _context.next = 36;
          return regeneratorRuntime.awrap(MockUSDC.deploy());

        case 36:
          mockUSDC = _context.sent;
          _context.next = 39;
          return regeneratorRuntime.awrap(mockUSDC.waitForDeployment());

        case 39:
          _context.next = 41;
          return regeneratorRuntime.awrap(mockUSDC.getAddress());

        case 41:
          mockUSDCAddress = _context.sent;
          console.log("✅ Mock USDC deployed to:", mockUSDCAddress); // Mint some USDC to deployer for testing

          mintAmount = ethers.parseUnits("10000", 6); // 10,000 USDC

          _context.next = 46;
          return regeneratorRuntime.awrap(mockUSDC.mint(deployer.address, mintAmount));

        case 46:
          console.log("💰 Minted 10,000 USDC to deployer");

        case 47:
          // Verify deployment
          console.log("\n🔍 Verifying deployment...");
          console.log("Contract addresses:");
          console.log("- YieldLockPlus:", yieldLockPlusAddress);
          console.log("- Functions Router:", config.functionsRouter); // Test basic functionality

          console.log("\n🧪 Testing basic functionality...");
          _context.prev = 52;
          _context.next = 55;
          return regeneratorRuntime.awrap(yieldLockPlus.vaultIdCounter());

        case 55:
          vaultCounter = _context.sent;
          console.log("✅ Vault counter initialized:", vaultCounter.toString());
          _context.next = 59;
          return regeneratorRuntime.awrap(yieldLockPlus.earlyWithdrawalPenalty());

        case 59:
          earlyPenalty = _context.sent;
          console.log("✅ Early withdrawal penalty set:", earlyPenalty.toString(), "%");
          _context.next = 63;
          return regeneratorRuntime.awrap(yieldLockPlus.minLockDuration());

        case 63:
          minDuration = _context.sent;
          console.log("✅ Min lock duration:", minDuration.toString(), "seconds");
          _context.next = 70;
          break;

        case 67:
          _context.prev = 67;
          _context.t0 = _context["catch"](52);
          console.log("⚠️ Basic tests failed:", _context.t0.message);

        case 70:
          // Save deployment info
          deploymentInfo = {
            network: networkName,
            deployer: deployer.address,
            contracts: {
              yieldLockPlus: yieldLockPlusAddress,
              functionsRouter: config.functionsRouter
            },
            timestamp: new Date().toISOString()
          };
          console.log("\n📋 Deployment Summary:");
          console.log(JSON.stringify(deploymentInfo, null, 2)); // Instructions for next steps

          console.log("\n🎯 Next Steps:");
          console.log("1. Update CONTRACT_ADDRESS in frontend/src/App.js");
          console.log("2. Set up Chainlink Functions subscription");
          console.log("3. Register automation upkeep");
          console.log("4. Test the frontend application");
          return _context.abrupt("return", deploymentInfo);

        case 79:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[52, 67]]);
} // Mock USDC contract for local testing


function deployMockUSDC() {
  var MockUSDC, mockUSDC;
  return regeneratorRuntime.async(function deployMockUSDC$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(ethers.getContractFactory("MockUSDC"));

        case 2:
          MockUSDC = _context2.sent;
          _context2.next = 5;
          return regeneratorRuntime.awrap(MockUSDC.deploy());

        case 5:
          mockUSDC = _context2.sent;
          _context2.next = 8;
          return regeneratorRuntime.awrap(mockUSDC.waitForDeployment());

        case 8:
          _context2.next = 10;
          return regeneratorRuntime.awrap(mockUSDC.getAddress());

        case 10:
          return _context2.abrupt("return", _context2.sent);

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  });
}

main().then(function () {
  return process.exit(0);
})["catch"](function (error) {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});