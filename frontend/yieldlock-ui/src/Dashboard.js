/* eslint-disable no-undef */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Target, 
  TrendingUp, 
  Lock, 
  Plus, 
  BarChart3, 
  Settings,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock,
  History,
  DollarSign,
  Calendar,
  PieChart,
  Activity,
  ChevronRight,
  Star,
  Zap,
  Shield,
  User
} from 'lucide-react';
import './App.css';
import LandingPage from './LandingPage';
import { FaBullseye, FaHistory, FaChartBar, FaCog, FaUserCircle, FaAngleDoubleLeft, FaAngleDoubleRight, FaQrcode, FaSignOutAlt, FaCopy, FaArrowUp, FaArrowDown, FaSun, FaMoon } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';

// Contract ABI (simplified for demo)
const CONTRACT_ABI = [
  "function createVault(string name, uint256 targetAmount, uint256 unlockTime) external payable",
  "function getVault(uint256 vaultId) external view returns (tuple(uint256 amount, uint256 unlockTime, address user, bool withdrawn, string strategy, string name, uint256 targetAmount, uint256 currentYield, uint256 createdAt, bool isActive))",
  "function getUserVaults(address user) external view returns (uint256[])",
  "function getVaultProgress(uint256 vaultId) external view returns (uint256 progress, string status)",
  "function withdraw(uint256 vaultId) external",
  "function depositToVault(uint256 vaultId) external payable"
];

const CONTRACT_ADDRESS = "0x214B59e60Dd6DaF6E648fE1A9C32b005f01BC9E4"; // Deployed Sepolia ETH address
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex

// Dummy components for each tab (replace with your actual content)
// const GoalsScreen = ({ ...props }) => <div className="dashboard">{/* ...Goals content... */}Goals Content</div>;
// const HistoryScreen = ({ ...props }) => <div className="dashboard">{/* ...History content... */}History Content</div>;
// const AnalyticsScreen = ({ ...props }) => <div className="dashboard">{/* ...Analytics content... */}Analytics Content</div>;
// const SettingsScreen = ({ ...props }) => <div className="dashboard">{/* ...Settings content... */}Settings Content</div>;
// const ProfileScreen = ({ ...props }) => <div className="dashboard">{/* ...Profile content... */}Profile Content</div>;

const TABS = [
  { key: 'goals', label: 'Goals', icon: <FaBullseye /> },
  { key: 'history', label: 'History', icon: <FaHistory /> },
  { key: 'analytics', label: 'Analytics', icon: <FaChartBar /> },
  { key: 'settings', label: 'Settings', icon: <FaCog /> },
  { key: 'profile', label: 'Profile', icon: <FaUserCircle /> },
];

// Spinner component (move above LandingPage)
const Spinner = () => (
  <div className="spinner-container">
    <div className="spinner"></div>
    <span style={{ marginTop: '1rem', color: '#10b981', fontWeight: 500 }}>Connecting to wallet...</span>
  </div>
);

// 1. Add strategy pool for randomization
const STRATEGY_POOL = [
  "Aave 70%, Compound 30%",
  "Aave 60%, GMX 40%",
  "Compound 50%, Yearn 50%",
  "Aave 40%, Compound 30%, GMX 30%",
  "Aave 80%, Compound 20%",
  "GMX 60%, Aave 40%",
  "Yearn 100%",
  "Aave 50%, Compound 25%, Yearn 25%"
];
function getRandomStrategy() {
  const idx = Math.floor(Math.random() * STRATEGY_POOL.length);
  return `AI Recommendation: ${STRATEGY_POOL[idx]} — chosen for optimal yield and safety.`;
}

// 2. Simulate yield growth and progress
// (already handled by progress/status fields)

// 3. Animate progress bar and update status in VaultCard
// (already handled by progress/status fields)

// 4. Add to transaction history for deposits, yield, withdrawals
// (update handleSubmit and handleWithdraw)

// 5. Analytics tab: mock stats

// 7. Add footer with social links, docs, Chainlink badge (already in AppFooter, expand it)
const AppFooter = () => (
  <footer className="app-footer">
    <div>YieldLock+ &mdash; Save with purpose. Grow with DeFi. Powered by <a href="https://chain.link/" target="_blank" rel="noopener noreferrer" style={{color:'#10b981',fontWeight:600}}>Chainlink</a>.</div>
    <div style={{ fontSize: '0.95rem', color: '#059669', marginTop: 4 }}>Thank you for using YieldLock+! &nbsp; 
      <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">Twitter</a> &bull; 
      <a href="https://t.me/" target="_blank" rel="noopener noreferrer">Telegram</a> &bull; 
      <a href="/docs" target="_blank" rel="noopener noreferrer">Docs</a>
    </div>
  </footer>
);

// Dashboard Component
const Dashboard = ({ 
  account, 
  vaults, 
  showCreateVault, 
  setShowCreateVault, 
  activeTab, 
  setActiveTab, 
  sidebarCollapsed, 
  setSidebarCollapsed,
  isDarkTheme,
  toggleTheme,
  showQR,
  setShowQR,
  qrTab,
  setQrTab,
  sendForm,
  setSendForm,
  sendStatus,
  setSendStatus,
  showUserMenu,
  setShowUserMenu,
  handleCopyAddress,
  handleSend,
  handleLogout,
  renderTabContent,
  CreateVaultModal
}) => {
  return (
    <div className={`App${isDarkTheme ? ' dark-theme' : ''}`}>
      {/* Sidebar Navigation (desktop only) */}
      <nav className={`sidebar-nav${sidebarCollapsed ? ' collapsed' : ''}`} aria-label="Sidebar Navigation">
        <div className="sidebar-logo">
          <FaBullseye className="logo-icon" />
          {!sidebarCollapsed && <span className="sidebar-title">YieldLock+</span>}
        </div>
        <ul className="sidebar-tabs">
          {TABS.map(tab => (
            <li key={tab.key}>
              <button
                className={`sidebar-tab${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
                aria-label={tab.label}
              >
                {tab.icon}
                {!sidebarCollapsed && <span>{tab.label}</span>}
              </button>
            </li>
          ))}
        </ul>
        <button
          className="sidebar-collapse-btn"
          onClick={() => setSidebarCollapsed(c => !c)}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
        </button>
      </nav>

      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Target className="logo-icon" />
            <h1>YieldLock+</h1>
          </div>
          <div className="wallet-actions">
            <div className="wallet-info">
              <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
              {showQR && (
                <div className="qr-dropdown">
                  <div className="qr-tabs">
                    <button 
                      className={qrTab === 'receive' ? 'active' : ''} 
                      onClick={() => setQrTab('receive')}
                    >
                      <FaArrowDown /> Receive
                    </button>
                    <button 
                      className={qrTab === 'send' ? 'active' : ''} 
                      onClick={() => setQrTab('send')}
                    >
                      <FaArrowUp /> Send
                    </button>
                  </div>
                  
                  {qrTab === 'receive' && (
                    <div className="qr-receive">
                      <QRCodeSVG value={account} size={120} bgColor="#fff" fgColor="#10b981" />
                      <div className="qr-address">{account}</div>
                      <button className="btn-outline" onClick={handleCopyAddress}>
                        <FaCopy /> Copy Address
                      </button>
                      {sendStatus && <div className="qr-status">{sendStatus}</div>}
                    </div>
                  )}
                  
                  {qrTab === 'send' && (
                    <form className="qr-send-form" onSubmit={handleSend}>
                      <div className="form-group">
                        <label>To Address</label>
                        <input 
                          type="text" 
                          value={sendForm.to} 
                          onChange={e => setSendForm({ ...sendForm, to: e.target.value })} 
                          placeholder="0x..." 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label>Amount (ETH)</label>
                        <input 
                          type="number" 
                          value={sendForm.amount} 
                          onChange={e => setSendForm({ ...sendForm, amount: e.target.value })} 
                          placeholder="0.00" 
                          required 
                          min="0.01" 
                          step="0.01" 
                        />
                      </div>
                      <button className="btn-primary" type="submit">
                        Send
                      </button>
                      {sendStatus && <div className="qr-status">{sendStatus}</div>}
                    </form>
                  )}
                </div>
              )}
            </div>
            <div className="header-buttons">
              <button className="icon-btn" onClick={() => setShowQR(!showQR)} title="Show QR">
                <FaQrcode size={18} />
              </button>
              <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
                {isDarkTheme ? <FaSun size={18} /> : <FaMoon size={18} />}
              </button>
              <button className="icon-btn avatar-btn" onClick={() => setShowUserMenu(!showUserMenu)} title="User Menu">
                <FaUserCircle size={20} />
              </button>
              {showUserMenu && (
                <div className="user-menu">
                  <button onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={`main dashboard-main${sidebarCollapsed ? ' collapsed' : ''}`}>
        {renderTabContent()}
      </main>

      {/* Bottom Navigation (mobile only) */}
      <nav className="bottom-nav">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`nav-tab${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            aria-label={tab.label}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {showCreateVault && <CreateVaultModal />}
    </div>
  );
};

function App() {
  // State declarations
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [vaults, setVaults] = useState([]);
  const [showCreateVault, setShowCreateVault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [walletStatus, setWalletStatus] = useState('idle');
  const [walletError, setWalletError] = useState('');
  const [network, setNetwork] = useState(null);
  const [activeTab, setActiveTab] = useState('goals');
  const [transactionHistory, setTransactionHistory] = useState([
    {
      id: 1,
      type: 'deposit',
      vaultName: 'Rent for September',
      amount: '100',
      timestamp: Date.now() - 86400000, // 1 day ago
      status: 'completed'
    },
    {
      id: 2,
      type: 'withdrawal',
      vaultName: 'Vacation Fund',
      amount: '250',
      timestamp: Date.now() - 172800000, // 2 days ago
      status: 'completed'
    },
    {
      id: 3,
      type: 'yield',
      vaultName: 'Emergency Fund',
      amount: '15.50',
      timestamp: Date.now() - 259200000, // 3 days ago
      status: 'completed'
    }
  ]);
  const [showCongrats, setShowCongrats] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Analytics Data
  const [analyticsData] = useState({
    monthlyGrowth: 12.5,
    totalDeposits: 2500,
    totalWithdrawals: 800,
    averageAPY: 8.5,
    topStrategies: [
      { name: 'Aave', usage: 45, apy: 9.2 },
      { name: 'Compound', usage: 30, apy: 8.1 },
      { name: 'GMX', usage: 25, apy: 12.5 }
    ],
    monthlyChart: [
      { month: 'Jan', value: 1200 },
      { month: 'Feb', value: 1350 },
      { month: 'Mar', value: 1420 },
      { month: 'Apr', value: 1580 },
      { month: 'May', value: 1650 },
      { month: 'Jun', value: 1800 }
    ]
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrTab, setQrTab] = useState('receive');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sendForm, setSendForm] = useState({ to: '', amount: '' });
  const [sendStatus, setSendStatus] = useState('');
  const [showStrategy, setShowStrategy] = useState(false);
  const [strategyText, setStrategyText] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositVaultId, setDepositVaultId] = useState(null);

  // Set up provider, signer, contract when account changes
  useEffect(() => {
    if (window.ethereum && account) {
      const p = new ethers.BrowserProvider(window.ethereum);
      p.getSigner().then(s => {
        setProvider(p);
        setSigner(s);
        setContract(new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, s));
      });
    }
  }, [account]);

  // Load vaults from contract
  const loadVaults = async () => {
    if (!contract || !account) return;
    const vaultIds = await contract.getUserVaults(account);
    const vaultsOnChain = await Promise.all(vaultIds.map(async (id) => {
      const v = await contract.getVault(id);
      return {
        id: id.toString(),
        name: v.name,
        amount: v.amount,
        targetAmount: v.targetAmount,
        unlockTime: v.unlockTime,
        currentYield: v.currentYield,
        strategy: v.strategy,
        progress: 0, // will be calculated
        status: v.isActive ? 'On Track' : 'Completed',
        isActive: v.isActive,
        withdrawn: v.withdrawn,
        user: v.user,
        createdAt: v.createdAt
      };
    }));
    setVaults(vaultsOnChain);
    console.log('Fetched vaults for user', account, vaultsOnChain);
  };

  useEffect(() => {
    if (contract && account) {
      loadVaults();
    }
  }, [contract, account]);

  // Update handleCreateVault to send ETH as value
  const handleCreateVault = async (formData) => {
    try {
      setLoading(true);
      console.log('handleCreateVault: started', formData);
      const amount = ethers.parseEther(formData.amount);
      const targetAmount = ethers.parseEther(formData.targetAmount);
      const unlockTime = Math.floor(new Date(formData.unlockTime).getTime() / 1000);
      console.log('handleCreateVault: sending data', {
        name: formData.name,
        targetAmount: targetAmount.toString(),
        unlockTime: unlockTime,
        amount: amount.toString()
      });
      const tx = await contract.createVault(
        formData.name,
        targetAmount,
        unlockTime,
        { value: amount }
      );
      showToast('Transaction sent! Waiting for confirmation...', 'info');
      console.log('createVault tx sent:', tx.hash);
      await tx.wait();
      showToast('Vault created successfully!', 'success');
      console.log('Vault created and confirmed');
      loadVaults();
    } catch (error) {
      showToast('Error creating vault: ' + (error.reason || error.message), 'error');
      console.error('handleCreateVault error:', error);
    } finally {
      setLoading(false);
      console.log('handleCreateVault: finished');
    }
  };

  // Withdraw (real transaction)
  const handleWithdraw = async (vaultId) => {
    try {
      setLoading(true);
      const tx = await contract.withdraw(vaultId);
      showToast('Transaction sent! Waiting for confirmation...', 'info');
      await tx.wait();
      showToast('Withdrawal successful!', 'success');
      loadVaults();
    } catch (error) {
      showToast('Error withdrawing: ' + (error.reason || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Connect wallet with feedback and network check
  const connectWallet = async () => {
    setWalletStatus('connecting');
    setWalletError('');
    try {
      if (typeof window.ethereum === 'undefined') {
        setWalletStatus('error');
        setWalletError('MetaMask is not installed. Please install MetaMask and refresh.');
        return;
      }
      
      // Check network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setNetwork(chainId);
      if (chainId !== SEPOLIA_CHAIN_ID) {
        // Prompt user to switch to Sepolia
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            setWalletError('Sepolia network not found in MetaMask. Please add it manually.');
          } else {
            setWalletError('Please switch to Sepolia network in MetaMask.');
          }
          setWalletStatus('error');
          return;
        }
      }
      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setAccount(accounts[0]);
      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setWalletStatus('connected');
      // Load user vaults
      loadUserVaults(accounts[0], contract);
    } catch (error) {
      setWalletStatus('error');
      if (error.code === 4001) {
        setWalletError('Connection request was rejected.');
      } else {
        setWalletError(error.message || 'Failed to connect wallet.');
      }
    }
  };

  // Listen for account/network changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (contract) loadUserVaults(accounts[0], contract);
        } else {
          setAccount(null);
        }
      });
      window.ethereum.on('chainChanged', (_chainId) => {
        window.location.reload();
      });
    }
    // eslint-disable-next-line
  }, []);

  // Load user's vaults
  const loadUserVaults = async (userAddress, contractInstance) => {
    try {
      const vaultIds = await contractInstance.getUserVaults(userAddress);
      const vaultData = await Promise.all(
        vaultIds.map(async (id) => {
          const vault = await contractInstance.getVault(id);
          const progress = await contractInstance.getVaultProgress(id);
          return {
            id: id.toString(),
            ...vault,
            progress: progress[0].toString(),
            status: progress[1]
          };
        })
      );
      setVaults(vaultData);
    } catch (error) {
      console.error('Error loading vaults:', error);
    }
  };

  // Enhanced Vault Card component
  const VaultCard = ({ vault, openDepositModal, account }) => {
    const formatAmount = (amount) => {
      return safeFormatUnits(amount, 18);
    };

    // Only skip rendering if both are undefined
    if (vault.amount === undefined && vault.targetAmount === undefined) {
      return null;
    }

    console.log('VaultCard:', {
      amount: vault.amount,
      targetAmount: vault.targetAmount,
      formattedAmount: formatAmount(vault.amount),
      formattedTarget: formatAmount(vault.targetAmount)
    });

    const getStatusIcon = (status) => {
      switch (status) {
        case 'Goal Hit!': return <CheckCircle className="status-icon success" />;
        case 'On Track': return <TrendingUp className="status-icon success" />;
        case 'Low Yield': return <AlertCircle className="status-icon warning" />;
        default: return <Clock className="status-icon warning" />;
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'Goal Hit!': return '#10b981';
        case 'On Track': return '#10b981';
        case 'Low Yield': return '#f59e0b';
        default: return '#6b7280';
      }
    };

    const formatDate = (timestamp) => {
      return new Date(timestamp * 1000).toLocaleDateString();
    };

    const daysUntilUnlock = () => {
      const now = Math.floor(Date.now() / 1000);
      const unlockTime = typeof vault.unlockTime === 'bigint' ? Number(vault.unlockTime) : vault.unlockTime;
      const days = Math.ceil((unlockTime - now) / (24 * 60 * 60));
      return days > 0 ? days : 0;
    };

    return (
      <motion.div 
        className="vault-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="vault-header">
          <div className="vault-title">
            <h3>{vault.name}</h3>
            <span className="vault-id">#{vault.id}</span>
          </div>
          {getStatusIcon(vault.status)}
        </div>
        
        <div className="vault-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${Math.min(vault.progress, 100)}%`,
                backgroundColor: getStatusColor(vault.status)
              }}
            ></div>
          </div>
          <div className="progress-info">
            <span className="progress-text">{vault.progress}% Complete</span>
            <span className="progress-status" style={{ color: getStatusColor(vault.status) }}>
              {vault.status}
            </span>
          </div>
        </div>
        
        <div className="vault-stats">
          <div className="stat-item">
            <DollarSign size={16} />
            <div>
              <span className="stat-label">Current</span>
              <span className="stat-value">{formatAmount(vault.amount)} ETH</span>
            </div>
          </div>
          <div className="stat-item">
            <Target size={16} />
            <div>
              <span className="stat-label">Target</span>
              <span className="stat-value">{formatAmount(vault.targetAmount)} ETH</span>
            </div>
          </div>
          <div className="stat-item">
            <TrendingUp size={16} />
            <div>
              <span className="stat-label">Yield</span>
              <span className="stat-value success">+{formatAmount(vault.currentYield)} ETH</span>
            </div>
          </div>
          <div className="stat-item">
            <Calendar size={16} />
            <div>
              <span className="stat-label">Unlocks in</span>
              <span className="stat-value">{daysUntilUnlock()} days</span>
            </div>
          </div>
        </div>
        
        <div className="vault-strategy">
          <BarChart3 size={16} />
          <span>{vault.strategy || 'AI Strategy Pending...'}</span>
        </div>
        
        <div className="vault-actions">
          {vault.isActive && !vault.withdrawn && vault.user && account && vault.user.toLowerCase() === account.toLowerCase() && (
            <button className="btn-secondary" onClick={() => openDepositModal(vault.id)}>
              Deposit
            </button>
          )}
          {vault.user && account && vault.user.toLowerCase() === account.toLowerCase() && (
            <button className="btn-secondary" onClick={() => handleWithdraw(vault.id)}>
              Withdraw
            </button>
          )}
          {vault.user && account && vault.user.toLowerCase() !== account.toLowerCase() && (
            <div className="not-owner-msg">You are not the owner of this vault.</div>
          )}
          <button className="btn-outline">
            <ChevronRight size={16} />
            Details
          </button>
        </div>
      </motion.div>
    );
  };

  // Statistics component
  const safeFormatUnits = (value, decimals = 18) => {
    if (value === null || value === undefined) return "0";
    try {
      return ethers.formatUnits(value, decimals);
    } catch (e) {
      return "0";
    }
  };

  const Statistics = () => {
    const totalValue = vaults.reduce((sum, vault) => sum + parseFloat(safeFormatUnits(vault.amount, 18)), 0);
    const totalYield = vaults.reduce((sum, vault) => sum + parseFloat(safeFormatUnits(vault.currentYield, 18)), 0);
    const activeVaults = vaults.filter(vault => vault.isActive).length;

    return (
      <div className="stats-grid">
        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Value</h3>
            <p>{totalValue.toFixed(2)} ETH</p>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Yield</h3>
            <p>+{totalYield.toFixed(2)} ETH</p>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <h3>Active Goals</h3>
            <p>{activeVaults}</p>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="stat-icon">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <h3>Avg. APY</h3>
            <p>8.5%</p>
          </div>
        </motion.div>
      </div>
    );
  };

  // Transaction History component
  const TransactionHistory = () => {
    const getTransactionIcon = (type) => {
      switch (type) {
        case 'deposit': return <Plus size={16} />;
        case 'withdrawal': return <ArrowRight size={16} />;
        case 'yield': return <TrendingUp size={16} />;
        default: return <Activity size={16} />;
      }
    };

    const getTransactionColor = (type) => {
      switch (type) {
        case 'deposit': return '#10b981';
        case 'withdrawal': return '#ef4444';
        case 'yield': return '#f59e0b';
        default: return '#6b7280';
      }
    };

    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return (
      <div className="history-section">
        <div className="section-header">
          <h2>Transaction History</h2>
          <button className="btn-outline">View All</button>
        </div>
        
        <div className="transaction-list">
          {transactionHistory.map((tx) => (
            <motion.div 
              key={tx.id}
              className="transaction-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="transaction-icon" style={{ backgroundColor: getTransactionColor(tx.type) + '20' }}>
                <div style={{ color: getTransactionColor(tx.type) }}>
                  {getTransactionIcon(tx.type)}
                </div>
              </div>
              
              <div className="transaction-details">
                <div className="transaction-info">
                  <h4>{tx.vaultName}</h4>
                  <span className="transaction-type">{tx.type}</span>
                </div>
                <div className="transaction-amount">
                  <span className="amount">{tx.type === 'withdrawal' ? '-' : '+'}{tx.amount} ETH</span>
                  <span className="timestamp">{formatDate(tx.timestamp)}</span>
                </div>
              </div>
              
              <div className="transaction-status">
                <span className={`status-badge ${tx.status}`}>{tx.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // Settings Screen Component
  const SettingsScreenComponent = () => {
    const [settings, setSettings] = useState({
      notifications: true,
      autoReinvest: false,
      riskLevel: 'medium',
      theme: 'light'
    });

    const handleSettingChange = (key, value) => {
      setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
      <div className="settings-screen">
        <div className="section-header">
          <h2>Settings</h2>
          <p>Customize your YieldLock+ experience</p>
        </div>

        <div className="settings-sections">
          {/* Notifications */}
          <div className="settings-section">
            <h3>Notifications</h3>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Push Notifications</h4>
                <p>Get alerts for yield updates and goal milestones</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {/* Investment Preferences */}
          <div className="settings-section">
            <h3>Investment Preferences</h3>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Auto-Reinvest Yield</h4>
                <p>Automatically reinvest earned yield into your goals</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.autoReinvest}
                  onChange={(e) => handleSettingChange('autoReinvest', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Risk Level</h4>
                <p>Choose your preferred risk tolerance for AI strategies</p>
              </div>
              <select 
                value={settings.riskLevel}
                onChange={(e) => handleSettingChange('riskLevel', e.target.value)}
                className="setting-select"
              >
                <option value="low">Conservative</option>
                <option value="medium">Balanced</option>
                <option value="high">Aggressive</option>
              </select>
            </div>
          </div>

          {/* Appearance */}
          <div className="settings-section">
            <h3>Appearance</h3>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Theme</h4>
                <p>Choose your preferred color scheme</p>
              </div>
              <select 
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="setting-select"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>

          {/* Account Actions */}
          <div className="settings-section">
            <h3>Account</h3>
            <div className="account-actions">
              <button className="btn-outline">
                <Shield size={16} />
                Export Data
              </button>
              <button className="btn-outline">
                <Settings size={16} />
                Advanced Settings
              </button>
              <button className="btn-outline danger">
                <AlertCircle size={16} />
                Disconnect Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Profile Screen Component
  const ProfileScreenComponent = () => {
    return (
      <div className="profile-screen">
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {account ? account.slice(2, 4).toUpperCase() : 'YL'}
            </div>
          </div>
          <div className="profile-info">
            <h2>YieldLock+ User</h2>
            <p className="wallet-address">{account || 'Not connected'}</p>
            <span className="member-since">Member since June 2024</span>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-number">{vaults.length}</span>
            <span className="stat-label">Active Goals</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{transactionHistory.length}</span>
            <span className="stat-label">Transactions</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">30</span>
            <span className="stat-label">Days Active</span>
          </div>
        </div>

        <div className="profile-achievements">
          <h3>Achievements</h3>
          <div className="achievements-grid">
            <div className="achievement-item">
              <div className="achievement-icon">
                <Target size={24} />
              </div>
              <div className="achievement-info">
                <h4>Goal Setter</h4>
                <p>Created your first savings goal</p>
              </div>
              <CheckCircle size={20} className="achievement-check" />
            </div>
            <div className="achievement-item">
              <div className="achievement-icon">
                <TrendingUp size={24} />
              </div>
              <div className="achievement-info">
                <h4>Yield Hunter</h4>
                <p>Earned your first yield</p>
              </div>
              <CheckCircle size={20} className="achievement-check" />
            </div>
            <div className="achievement-item locked">
              <div className="achievement-icon">
                <Star size={24} />
              </div>
              <div className="achievement-info">
                <h4>DeFi Master</h4>
                <p>Reach $10,000 in total value</p>
              </div>
              <Lock size={20} className="achievement-lock" />
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-primary">
            <Settings size={16} />
            Edit Profile
          </button>
          <button className="btn-outline">
            <Shield size={16} />
            Security Settings
          </button>
        </div>
      </div>
    );
  };

  // Hybrid navigation: sidebar (desktop), bottom nav (mobile)
  // Only show dashboard for 'goals' tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'goals':
        return (
          <div className="dashboard">
            <div className="dashboard-header">
              <div className="dashboard-title">
                <h2>Your Savings Dashboard</h2>
                <p>Track your goals and watch your money grow</p>
              </div>
              <button 
                className="btn-primary" 
                onClick={() => setShowCreateVault(true)}
              >
                <Plus size={20} />
                Create New Goal
              </button>
            </div>
            <Statistics />
            <div className="vaults-section">
              <div className="section-header">
                <h3>Your Savings Goals</h3>
                <span className="vault-count">{vaults.length} active goals</span>
              </div>
              <div className="vaults-grid">
                {vaults.length === 0 ? (
                  <div className="empty-state">
                    <Target size={48} />
                    <h3>No goals yet</h3>
                    <p>Create your first savings goal to get started!</p>
                    <button 
                      className="btn-primary" 
                      onClick={() => setShowCreateVault(true)}
                    >
                      Create Your First Goal
                    </button>
                  </div>
                ) : (
                  vaults
                    .filter(vault => vault && vault.amount !== undefined && vault.targetAmount !== undefined)
                    .map((vault) => (
                      <VaultCard key={vault.id} vault={vault} openDepositModal={openDepositModal} account={account} />
                    ))
                )}
              </div>
            </div>
          </div>
        );
      case 'history':
        return <TransactionHistory />;
      case 'analytics':
        return <AnalyticsScreenComponent />;
      case 'settings':
        return <SettingsScreenComponent />;
      case 'profile':
        return <ProfileScreenComponent />;
      default:
        return null;
    }
  };

  // Copy address to clipboard
  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setSendStatus('Address copied!');
      setTimeout(() => setSendStatus(''), 1200);
    }
  };

  // Demo send (no real transaction)
  const handleSend = (e) => {
    e.preventDefault();
    setSendStatus('Sending...');
    setTimeout(() => {
      setSendStatus('Sent!');
      setSendForm({ to: '', amount: '' });
      setTimeout(() => setSendStatus(''), 1200);
    }, 1200);
  };

  // Logout (demo: just disconnect)
  const handleLogout = () => {
    setAccount(null);
    setShowUserMenu(false);
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    document.body.classList.toggle('dark-theme');
  };

  // Create new vault
  const CreateVaultModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      targetAmount: '',
      unlockTime: '',
      amount: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      await handleCreateVault(formData);
      setShowCreateVault(false);
      setFormData({ name: '', targetAmount: '', unlockTime: '', amount: '' });
    };

    return (
      <motion.div 
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <div className="modal-header">
            <h2>Create New Goal</h2>
            <button onClick={() => setShowCreateVault(false)}>×</button>
          </div>
          
          <form onSubmit={handleSubmit} className="vault-form">
            <div className="form-group">
              <label>Goal Name</label>
              <input
                type="text"
                placeholder="e.g., Rent for September"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Target Amount (ETH)</label>
              <input
                type="number"
                placeholder="500"
                value={formData.targetAmount}
                onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Initial Deposit (ETH)</label>
              <input
                type="number"
                placeholder="100"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Unlock Date</label>
              <input
                type="datetime-local"
                value={formData.unlockTime}
                onChange={(e) => setFormData({...formData, unlockTime: e.target.value})}
                required
              />
            </div>
            
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Goal'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  // Strategy Modal
  const StrategyModal = () => (
    showStrategy && (
      <div className="modal-overlay" onClick={() => setShowStrategy(false)}>
        <motion.div className="modal" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
          <div className="modal-header">
            <h2>AI Strategy Recommendation</h2>
            <button onClick={() => setShowStrategy(false)}>×</button>
          </div>
          <div className="modal-body">
            <BarChart3 size={32} style={{ color: '#10b981', marginBottom: 12 }} />
            <p>{strategyText}</p>
            <p style={{ color: '#059669', fontWeight: 500 }}>Powered by Chainlink Functions + AI</p>
          </div>
          <button className="btn-primary" onClick={() => setShowStrategy(false)}>OK</button>
        </motion.div>
      </div>
    )
  );

  function AnalyticsScreenComponent() {
    const totalSaved = vaults.reduce((sum, v) => sum + parseFloat(safeFormatUnits(v.amount, 18)), 0);
    const totalYield = vaults.reduce((sum, v) => sum + parseFloat(safeFormatUnits(v.currentYield, 18)), 0);
    const avgAPY = 8.5; // mock
    return (
      <div className="analytics">
        <h2>Analytics</h2>
        <div className="analytics-stats">
          <div className="stat-card">
            <DollarSign size={28} />
            <div>
              <div className="stat-label">Total Saved</div>
              <div className="stat-value">{totalSaved.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} ETH</div>
            </div>
          </div>
          <div className="stat-card">
            <TrendingUp size={28} />
            <div>
              <div className="stat-label">Total Yield</div>
              <div className="stat-value success">+{totalYield.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} ETH</div>
            </div>
          </div>
          <div className="stat-card">
            <PieChart size={28} />
            <div>
              <div className="stat-label">Average APY</div>
              <div className="stat-value">{avgAPY}%</div>
            </div>
          </div>
        </div>
        <div className="analytics-chart">
          {/* Mock chart: could use a library or SVG for demo */}
          <div style={{height:180, background:'#e0fdf4', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:'#10b981', fontWeight:600}}>
            [Yield Growth Chart Placeholder]
          </div>
        </div>
      </div>
    );
  }

  // Function to open deposit modal
  const openDepositModal = (vaultId) => {
    setDepositVaultId(vaultId);
    setShowDepositModal(true);
  };

  // Update DepositModal to send ETH as value
  const DepositModal = ({ showToast }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDeposit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const depositAmount = ethers.parseEther(amount);
        const tx = await contract.depositToVault(depositVaultId, { value: depositAmount });
        showToast('Transaction sent! Waiting for confirmation...', 'info');
        await tx.wait();
        showToast('Deposit successful!', 'success');
        setShowDepositModal(false);
        setAmount('');
        loadVaults();
      } catch (error) {
        showToast('Error depositing: ' + (error.reason || error.message), 'error');
      } finally {
        setLoading(false);
      }
    };

    return showDepositModal ? (
      <div className="modal-overlay" onClick={() => setShowDepositModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Deposit to Vault</h2>
            <button onClick={() => setShowDepositModal(false)}>×</button>
          </div>
          <form onSubmit={handleDeposit} className="vault-form">
            <div className="form-group">
              <label>Amount (ETH)</label>
              <input
                type="number"
                placeholder="100"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                min="0.01"
                step="0.01"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Depositing...' : 'Deposit'}
            </button>
          </form>
        </div>
      </div>
    ) : null;
  };

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 2500);
  };

  return (
    <>
      {!account ? (
        <LandingPage 
          onConnectWallet={connectWallet}
          walletStatus={walletStatus}
          walletError={walletError}
        />
      ) : (
        <Dashboard 
          account={account}
          vaults={vaults}
          showCreateVault={showCreateVault}
          setShowCreateVault={setShowCreateVault}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          isDarkTheme={isDarkTheme}
          toggleTheme={toggleTheme}
          showQR={showQR}
          setShowQR={setShowQR}
          qrTab={qrTab}
          setQrTab={setQrTab}
          sendForm={sendForm}
          setSendForm={setSendForm}
          sendStatus={sendStatus}
          setSendStatus={setSendStatus}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
          handleCopyAddress={handleCopyAddress}
          handleSend={handleSend}
          handleLogout={handleLogout}
          renderTabContent={renderTabContent}
          CreateVaultModal={CreateVaultModal}
        />
      )}
      <StrategyModal />
      <AppFooter />
      <DepositModal showToast={showToast} />
    </>
  );
}

export default App;