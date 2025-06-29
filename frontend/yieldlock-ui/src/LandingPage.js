import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Spinner from './Spinner';
import styles from './LandingPage.module.css';
import { FaLock } from 'react-icons/fa';
import { ethers } from 'ethers';

// Large SVG logo as background
const LogoBG = () => (
  <svg width="600" height="600" viewBox="0 0 600 600" fill="none" style={{ position: 'absolute', left: '-80px', top: '-120px', zIndex: 0, opacity: 0.13 }}>
    <rect x="60" y="60" width="480" height="480" rx="120" fill="#10b981" />
    <rect x="180" y="180" width="240" height="240" rx="60" fill="#10b981" fillOpacity="0.7" />
    <path d="M300 220v160M220 300h160" stroke="#fff" strokeWidth="18" strokeLinecap="round" />
  </svg>
);

// Animated DeFi/crypto illustration (coins, sparkles, vault)
const DeFiIllustration = () => (
  <svg width="180" height="120" viewBox="0 0 180 120" fill="none" style={{ position: 'absolute', right: '-30px', bottom: '-30px', zIndex: 1 }}>
    <g>
      <ellipse cx="90" cy="110" rx="60" ry="10" fill="#10b98122" />
      <circle cx="60" cy="70" r="18" fill="#fff" stroke="#10b981" strokeWidth="4" />
      <circle cx="120" cy="60" r="14" fill="#10b981" stroke="#fff" strokeWidth="4" />
      <rect x="80" y="40" width="28" height="28" rx="8" fill="#10b981" stroke="#fff" strokeWidth="3" />
      <circle cx="100" cy="54" r="5" fill="#fff" />
      <circle cx="75" cy="50" r="3" fill="#10b981" />
      <circle cx="135" cy="80" r="3" fill="#10b981" />
      <circle cx="110" cy="90" r="2.5" fill="#fff" />
      <circle cx="85" cy="95" r="2" fill="#10b981" />
    </g>
  </svg>
);

const heroVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.7,
      type: 'spring',
      stiffness: 60,
    },
  }),
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { delay: 0.5, duration: 0.7, type: 'spring', stiffness: 60 } },
  hover: { scale: 1.04, boxShadow: '0 12px 48px #10b98133', borderColor: '#10b981' },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.7, type: 'spring', stiffness: 60 },
  }),
};

const PLAYSTORE_URL = 'https://play.google.com/store/apps/details?id=com.yieldlock.app'; // Replace with your actual app link

const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);
  React.useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    let increment = end / 40;
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, 18);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
};

const ProgressRing = ({ radius, stroke, progress }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#e5f9f2"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#10b981"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.7s cubic-bezier(.4,0,.2,1)' }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
};

// Animated sparkles
const Sparkle = ({ x, y, delay }) => (
  <motion.svg
    initial={{ opacity: 0, scale: 0.7 }}
    animate={{ opacity: [0, 1, 0], scale: [0.7, 1.1, 0.7] }}
    transition={{ duration: 2.5, delay, repeat: Infinity, repeatType: 'loop' }}
    style={{ position: 'absolute', left: x, top: y, zIndex: 1 }}
    width="22" height="22" viewBox="0 0 22 22" fill="none"
  >
    <circle cx="11" cy="11" r="4" fill="#10b981" fillOpacity="0.18" />
    <circle cx="11" cy="11" r="2" fill="#10b981" fillOpacity="0.33" />
  </motion.svg>
);

// Animated floating coin
const FloatingCoin = ({ x, y, delay }) => (
  <motion.svg
    initial={{ y: 0 }}
    animate={{ y: [0, -18, 0] }}
    transition={{ duration: 2.8, delay, repeat: Infinity, repeatType: 'loop' }}
    style={{ position: 'absolute', left: x, top: y, zIndex: 1 }}
    width="32" height="32" viewBox="0 0 32 32" fill="none"
  >
    <circle cx="16" cy="16" r="16" fill="#fff" stroke="#10b981" strokeWidth="3" />
    <text x="50%" y="55%" textAnchor="middle" fill="#10b981" fontSize="15" fontWeight="bold" dy=".3em">$</text>
  </motion.svg>
);

// Animated DeFi vault icon
const FloatingVault = ({ x, y, delay }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: [0, -12, 0] }}
    transition={{ duration: 3.2, delay, repeat: Infinity, repeatType: 'loop' }}
    style={{ position: 'absolute', left: x, top: y, zIndex: 1 }}
  >
    <div style={{ background: '#10b981', borderRadius: 12, padding: 8, boxShadow: '0 2px 12px #10b98133' }}>
      <FaLock color="#fff" size={22} />
    </div>
  </motion.div>
);

const LandingPage = ({ onConnectWallet }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [walletStatus, setWalletStatus] = useState('idle');
  const [walletError, setWalletError] = useState('');
  const [progress] = useState(68);
  const [savings] = useState(1250000);

  // Real connectWallet logic
  const connectWallet = async () => {
    setLoading(true);
    setWalletStatus('connecting');
    setWalletError('');
    try {
      if (typeof window.ethereum === 'undefined') {
        setWalletStatus('error');
        setWalletError('MetaMask is not installed. Please install MetaMask and refresh.');
        setLoading(false);
        return;
      }
      // Check network (Sepolia)
      const SEPOLIA_CHAIN_ID = '0xaa36a7';
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
        } catch (switchError) {
          setWalletStatus('error');
          setWalletError('Please switch to Sepolia network in MetaMask.');
          setLoading(false);
          return;
        }
      }
      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      // (Optional) Load contract here if needed
      setAccount(accounts[0]);
      setProvider(provider);
      setContract(null); // Set contract if needed
      setWalletStatus('connected');
      setLoading(false);
      if (onConnectWallet) {
        onConnectWallet(accounts[0], provider, null);
      }
    } catch (error) {
      setWalletStatus('error');
      setWalletError(error.message || 'Failed to connect wallet.');
      setLoading(false);
    }
  };

  // Hero section handler
  const handleGetStarted = () => {
    connectWallet();
  };

  return (
    <div className={styles['landing-root']} style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', background: 'radial-gradient(circle at 60% 40%, #e0fdf4 0%, #d1fae5 100%)' }}>
      {/* Large SVG logo as background */}
      <LogoBG />
      {/* Animated DeFi illustration */}
      <DeFiIllustration />
      {/* Sparkles */}
      <Sparkle x="12%" y="18%" delay={0.2} />
      <Sparkle x="38%" y="32%" delay={0.7} />
      <Sparkle x="22%" y="60%" delay={1.3} />
      {/* Floating coins */}
      <FloatingCoin x="28%" y="12%" delay={0.5} />
      <FloatingCoin x="44%" y="48%" delay={1.1} />
      {/* Floating DeFi vault */}
      <FloatingVault x="60%" y="22%" delay={0.8} />
      {loading && (
        <div className={styles['loading-overlay']}>
          <Spinner text="Connecting Wallet..." />
        </div>
      )}
      {/* Top Bar */}
      <header className={`${styles['landing-header']} ${styles['glass']}`}> 
        <div className={styles.logo}>YieldLock<span className={styles.plus}>+</span></div>
        <nav className={styles['landing-nav']}>
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#community">Community</a>
          <a href="#docs">Docs</a>
          <button className={styles['launch-btn']} onClick={handleGetStarted} disabled={loading}>
            {loading ? <Spinner text="" /> : 'Launch App'}
          </button>
        </nav>
      </header>

      {/* Redesigned Hero Section */}
      <section className={styles['landing-hero']} style={{ alignItems: 'center', minHeight: '70vh', gap: '2.5rem', position: 'relative', zIndex: 2, justifyContent: 'center' }}>
        <div className={styles['hero-content']} style={{ justifyContent: 'center', alignItems: 'flex-start', padding: '3.5rem 2rem 3rem 2rem', minWidth: 0, maxWidth: 540, zIndex: 2 }}>
          <motion.h1
            className={styles['glass']}
            initial="hidden"
            animate="visible"
            custom={1}
            variants={heroVariants}
            style={{ fontSize: '2.9rem', fontWeight: 900, lineHeight: 1.1, background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1.2rem', padding: 0, boxShadow: 'none', letterSpacing: '-1px' }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#10b981"/><path d="M16 9v14M9 16h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
              Goal-based <span style={{ color: '#10b981', fontWeight: 900 }}>DeFi</span> Savings
            </span>
            <br />for Everyone
          </motion.h1>
          <motion.p
            className={styles['glass']}
            initial="hidden"
            animate="visible"
            custom={2}
            variants={heroVariants}
            style={{ fontSize: '1.18rem', color: '#059669', fontWeight: 500, marginBottom: '2.2rem', background: 'rgba(255,255,255,0.7)', borderRadius: '12px', padding: '1.1rem 1.5rem', boxShadow: 'none', maxWidth: 420 }}
          >
            Save, grow, and unlock your financial goals with automated, secure, and transparent DeFi vaults powered by Chainlink.
          </motion.p>
          <motion.div
            initial="hidden"
            animate="visible"
            custom={3}
            variants={heroVariants}
            style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center', marginTop: 8, background: 'rgba(255,255,255,0.7)', borderRadius: 16, boxShadow: '0 2px 16px #10b98111', padding: '0.7rem 1.2rem' }}
          >
            <button
              className={styles['cta-btn']}
              onClick={handleGetStarted}
              disabled={loading}
              style={{ minWidth: 150 }}
            >
              {loading ? <Spinner text="" /> : 'Get Started'}
            </button>
            <a
              href={PLAYSTORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px #10b98122', background: '#fff' }}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" style={{ height: 44, width: 'auto', display: 'block' }} />
            </a>
          </motion.div>
          {walletError && (
            <div style={{ color: 'red', fontSize: 12, marginTop: 10 }}>{walletError}</div>
          )}
        </div>
        <motion.div
          className={`${styles['hero-visual']} ${styles['glass']}`}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          whileHover="hover"
          style={{ minWidth: 320, maxWidth: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 48px #10b98122', position: 'relative', zIndex: 2, border: '2.5px solid #10b98133', borderRadius: 32, background: 'rgba(255,255,255,0.97)' }}
        >
          <div className={styles['hero-card']} style={{ boxShadow: '0 4px 24px #10b98122', border: '1.5px solid #10b98122', background: 'rgba(255,255,255,0.93)', padding: 32, minWidth: 260, minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ marginBottom: 18, position: 'relative', width: 88, height: 88, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ProgressRing radius={44} stroke={6} progress={progress} />
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -60%)', fontWeight: 700, color: '#059669', fontSize: 18 }}>{progress}%</div>
            </div>
            <div style={{ fontSize: 18, color: '#059669', fontWeight: 600, marginBottom: 6 }}>Total Saved</div>
            <div style={{ fontSize: 32, color: '#10b981', fontWeight: 900, marginBottom: 2 }}>
              <AnimatePresence>
                <AnimatedNumber value={savings} />
              </AnimatePresence>
              <span style={{ fontSize: 18, color: '#059669', fontWeight: 600, marginLeft: 6 }}>$</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#10b981"/><text x="50%" y="55%" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="bold" dy=".3em">U</text></svg>
              <span style={{ color: '#6b7280', fontWeight: 500, fontSize: 15 }}>You & Community</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features/Steps */}
      <motion.section
        className={styles['landing-features']}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        custom={1}
        variants={sectionVariants}
        id="features"
      >
        <h2 style={{ fontWeight: 800, color: '#059669', fontSize: '2rem', marginBottom: '1.5rem' }}>How It Works</h2>
        <div className={styles['features-grid']}>
          {[{
            icon: '🎯',
            title: 'Set a Goal',
            desc: 'Define your savings target and timeline.'
          }, {
            icon: '💸',
            title: 'Deposit',
            desc: 'Lock your stablecoins securely in the smart contract.'
          }, {
            icon: '📈',
            title: 'Earn Yield',
            desc: 'Watch your savings grow with automated DeFi strategies.'
          }, {
            icon: '🔓',
            title: 'Withdraw Anytime',
            desc: 'Access your funds and rewards whenever you need.'
          }].map((f, i) => (
            <motion.div
              key={f.title}
              className={`${styles['feature-card']} ${styles['glass']}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={i + 1}
              variants={sectionVariants}
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px #10b98122' }}
            >
              <div className={styles['feature-icon']}>{f.icon}</div>
              <div className={styles['feature-title']}>{f.title}</div>
              <div className={styles['feature-desc']}>{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Community Section */}
      <motion.section
        className={styles['landing-community']}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        custom={2}
        variants={sectionVariants}
        id="community"
      >
        <h2 style={{ fontWeight: 800, color: '#059669', fontSize: '2rem', marginBottom: '1.2rem' }}>Join Our Community</h2>
        <p style={{ color: '#444', fontWeight: 500 }}>Connect with other savers, get support, and stay updated.</p>
        <div className={styles['community-links']}>
          <a href="#" className={styles['glass']}>Discord</a>
          <a href="#" className={styles['glass']}>Telegram</a>
          <a href="#" className={styles['glass']}>Twitter</a>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className={`${styles['landing-footer']} ${styles['glass']}`}> 
        <div>© {new Date().getFullYear()} YieldLock+. All rights reserved.</div>
        <div className={styles['footer-links']}>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Docs</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 