import { useState } from 'react';
import { WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react';

import { getAlgodConfig, getNetworkName } from './utils/algorand';
import { SnackbarProvider } from 'notistack';
import { StudentDashboard } from './components/StudentDashboard';
import { SendPayment } from './components/SendPayment';
import { NetworkDiagnostic } from './components/NetworkDiagnostic';
import { ClubFunding } from './components/ClubFunding/ClubFunding';

export type UserRole = 'student' | 'admin' | null;

// Get algod configuration from utils
const algodConfig = getAlgodConfig();
const networkName = getNetworkName();

// Wallet manager configuration for TestNet
const walletManager = new WalletManager({
  wallets: [
    WalletId.PERA,
    WalletId.DEFLY,
    WalletId.EXODUS
  ],
  networks: {
    [networkName]: {
      algod: {
        baseServer: algodConfig.baseServer,
        port: algodConfig.port || '',
        token: algodConfig.token || '',
      },
    },
  },
});
console.log('✅ WalletManager created for network:', networkName);


export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'sendPayment' | 'clubFunding'>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Debug: Log environment variables
  console.log('🔍 Network Config:', {
    server: algodConfig.baseServer,
    network: networkName,
    port: algodConfig.port,
  });

  const handleLogout = () => {
    setCurrentView('dashboard');
  };

  const navigateToSendPayment = () => {
    setCurrentView('sendPayment');
  };

  const navigateToClubFunding = () => {
    setCurrentView('clubFunding');
  };

  const navigateToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleTransactionSuccess = () => {
    // Trigger refresh by incrementing counter
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <NetworkDiagnostic />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          {currentView === 'dashboard' && (
            <StudentDashboard
              onLogout={handleLogout}
              onNavigateToSendPayment={navigateToSendPayment}
              onNavigateToClubFunding={navigateToClubFunding}
              key={refreshTrigger}
            />
          )}

          {currentView === 'sendPayment' && (
            <SendPayment
              onBack={navigateToDashboard}
              onLogout={handleLogout}
              onTransactionSuccess={handleTransactionSuccess}
            />
          )}

          {currentView === 'clubFunding' && (
            <ClubFunding
              onBack={navigateToDashboard}
              onLogout={handleLogout}
            />
          )}
        </div>
      </WalletProvider>
    </SnackbarProvider>
  );
}

