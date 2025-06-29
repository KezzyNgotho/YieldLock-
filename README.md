# YieldLock+ 🎯

> Smart Goal-Based DeFi Savings Platform powered by AI and Chainlink

YieldLock+ is a revolutionary DeFi savings platform that lets users create multiple smart vaults for real-life goals — like rent, school fees, or a new laptop — and automatically grows their money in the safest, AI-recommended DeFi strategies.

## 🌟 Features

### 🎯 Multiple Goals
- Create unlimited named savings goals
- Each goal has its own smart vault
- Track progress independently

### 🤖 AI Strategy Engine
- Chainlink Functions calls offchain AI
- Analyzes goal type, amount, and timeframe
- Recommends optimal DeFi strategy allocation
- Supports Aave, Compound, GMX, and more

### 📈 Automated Yield Growth
- Funds automatically invested in recommended protocols
- Chainlink Automation rebalances monthly
- Real-time yield tracking and updates

### 🔐 Smart Timelocks
- Set custom unlock dates for each goal
- Early withdrawal available with 5% penalty
- Automatic maturity detection

### 📊 Goal Progress Tracker
- Real-time progress visualization
- Status indicators: "On Track", "Low Yield", "Goal Hit!"
- Chainlink Data Streams integration

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Smart Contracts** | Solidity 0.8.20, Hardhat |
| **Chainlink Services** | Functions, Automation, Data Streams |
| **Frontend** | React 19, Ethers.js, Framer Motion |
| **Styling** | Modern CSS with Glassmorphism |
| **Testing** | Hardhat, Chai, Mocha |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask wallet
- Sepolia testnet ETH (for deployment)

### 1. Clone and Install
```bash
git clone <repository-url>
cd yieldlock-plus
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. Compile Contracts
```bash
npm run compile
```

### 4. Run Tests
```bash
npm test
```

### 5. Deploy to Sepolia
```bash
npm run deploy:sepolia
```

### 6. Start Frontend
```bash
# Install frontend dependencies
npm run frontend:install

# Start development server
npm run frontend:start
```

## 📋 User Journey

### 1. Connect Wallet
- User connects MetaMask wallet
- App detects network and prompts for Sepolia if needed

### 2. Create Goal
- Click "Create New Goal"
- Enter goal name (e.g., "Rent for September")
- Set target amount (e.g., 500 USDC)
- Choose initial deposit (e.g., 100 USDC)
- Set unlock date (e.g., 90 days from now)

### 3. AI Strategy Selection
- Chainlink Functions calls AI engine
- AI analyzes goal characteristics
- Returns optimal strategy (e.g., "Aave 60%, Compound 40%")
- Strategy is applied to vault

### 4. Automated Management
- Chainlink Automation monitors vaults
- Monthly rebalancing based on performance
- Yield updates and progress tracking

### 5. Withdrawal
- Wait for maturity or withdraw early with penalty
- Receive funds + accumulated yield
- Goal marked as complete

## 🔗 Chainlink Integration

### Functions
- **Purpose**: AI strategy recommendation
- **Input**: Goal parameters (name, amount, duration, risk profile)
- **Output**: Optimal DeFi allocation strategy
- **Frequency**: Once per vault creation

### Automation
- **Purpose**: Vault management and rebalancing
- **Triggers**: Monthly rebalancing, maturity detection
- **Actions**: Update yields, rebalance strategies, mark mature vaults

### Data Streams (Future)
- **Purpose**: Real-time yield and protocol data
- **Data**: APY rates, protocol health, market conditions
- **Usage**: Progress tracking and strategy optimization

## 📊 Smart Contract Architecture

### Core Contracts
- **YieldLockPlus.sol**: Main vault management contract
- **MockUSDC.sol**: Test USDC token for development

### Key Functions
```solidity
// Create a new savings goal
function createVault(
    string memory _name,
    uint256 _targetAmount,
    uint256 _unlockTime,
    uint256 _amount
) external

// Withdraw funds (with penalty if early)
function withdraw(uint256 vaultId) external

// Get vault progress and status
function getVaultProgress(uint256 vaultId) 
    external view returns (uint256 progress, string memory status)
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Test Coverage
- ✅ Vault creation and validation
- ✅ Withdrawal logic and penalties
- ✅ Progress tracking
- ✅ Automation triggers
- ✅ Multi-vault management
- ✅ Admin functions

### Test Networks
- **Hardhat**: Local development and testing
- **Sepolia**: Testnet deployment
- **Base**: Alternative testnet

## 🎨 Frontend Features

### Modern UI/UX
- Glassmorphism design with blur effects
- Smooth animations with Framer Motion
- Responsive design for all devices
- Real-time progress visualization

### Key Components
- **Wallet Connection**: MetaMask integration
- **Goal Creation**: Intuitive form with validation
- **Vault Dashboard**: Progress cards with status indicators
- **Modal System**: Clean goal creation interface

## 🔧 Development

### Project Structure
```
yieldlock-plus/
├── contracts/          # Smart contracts
├── functions/          # Chainlink Functions
├── frontend/           # React application
├── scripts/            # Deployment scripts
├── test/              # Test files
└── ignition/          # Deployment modules
```

### Available Scripts
```bash
npm run compile        # Compile contracts
npm run test          # Run tests
npm run deploy:sepolia # Deploy to Sepolia
npm run deploy:base   # Deploy to Base
npm run node          # Start local node
npm run frontend:start # Start frontend dev server
```

## 🌐 Deployment

### Sepolia Testnet
1. Get Sepolia ETH from faucet
2. Set up environment variables
3. Run `npm run deploy:sepolia`
4. Update frontend contract address
5. Test with real transactions

### Production Considerations
- Add access control to admin functions
- Implement proper error handling
- Add events for all state changes
- Consider gas optimization
- Add comprehensive documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the code comments and tests
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core vault functionality
- ✅ AI strategy engine
- ✅ Basic automation
- ✅ Frontend MVP

### Phase 2 (Next)
- 🔄 Advanced AI strategies
- 🔄 Cross-chain support (CCIP)
- 🔄 Mobile app
- 🔄 Social features

### Phase 3 (Future)
- 🔄 Institutional features
- 🔄 Advanced analytics
- 🔄 DAO governance
- 🔄 Protocol integrations

## 🚀 Deployment (Sepolia)

- **YieldLockPlus:** `0x0906303928AE8c93d195fe90D9c0Ae7631E7460B`
- **Functions Router:** `0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C`
- **USDC Price Feed:** `0x694AA1769357215DE4FAC081bf1f309aDC325306`
- **USDC Token:** `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`

---

**Built with ❤️ using Chainlink and AI**
