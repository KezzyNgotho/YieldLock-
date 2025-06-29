import React, { useState } from 'react';
import Dashboard from './Dashboard';
import LandingPage from './LandingPage';

const App = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  // Handler to be passed to LandingPage for wallet connection
  const handleConnectWallet = (account, provider, contract) => {
    setAccount(account);
    setProvider(provider);
    setContract(contract);
  };

  if (account) {
    return <Dashboard account={account} provider={provider} contract={contract} />;
  }

  return <LandingPage onConnectWallet={handleConnectWallet} />;
};

export default App; 