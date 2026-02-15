import { useState } from 'react';
import { WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react';

import { getAlgodConfig, getNetworkName } from './utils/algorand';
import { SnackbarProvider } from 'notistack';
import { StudentDashboard } from './components/StudentDashboard';
import { SendPayment } from './components/SendPayment';
import { NetworkDiagnostic } from './components/NetworkDiagnostic';
import { ClubFunding } from './components/ClubFunding/ClubFunding';
import { ClubSpending } from './components/ClubSpending/ClubSpending';
import { TransactionHistory } from './components/TransactionHistory';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { CreateSplit } from './components/SplitExpense/CreateSplit';
import { SplitList } from './components/SplitExpense/SplitList';
import { SplitDetail } from './components/SplitExpense/SplitDetail';

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
  const [currentView, setCurrentView] = useState<'dashboard' | 'sendPayment' | 'clubFunding' | 'clubSpending' | 'history' | 'wallet' | 'splitExpense' | 'createSplit' | 'splitDetail'>('dashboard');
  const [selectedSplitId, setSelectedSplitId] = useState<string | null>(null);
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

  const handleNavigate = (view: string) => {
    setCurrentView(view as any);
  };

  const handleTransactionSuccess = () => {
    // Trigger refresh by incrementing counter
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <NetworkDiagnostic />

        {/* Professional Layout: Clean background, no gradients */}
        <div className="min-h-screen bg-background">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <Sidebar
              currentView={currentView}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
            />
          </div>

          {/* Main Content Area */}
          <main className="md:ml-60 min-h-screen pb-16 md:pb-0">
            {currentView === 'dashboard' && (
              <StudentDashboard
                onLogout={handleLogout}
                onNavigateToSendPayment={() => handleNavigate('sendPayment')}
                onNavigateToClubFunding={() => handleNavigate('clubFunding')}
                onNavigateToClubSpending={() => handleNavigate('clubSpending')}
                key={refreshTrigger}
              />
            )}

            {currentView === 'sendPayment' && (
              <SendPayment
                onBack={() => handleNavigate('dashboard')}
                onLogout={handleLogout}
                onTransactionSuccess={handleTransactionSuccess}
              />
            )}

            {currentView === 'clubFunding' && (
              <ClubFunding
                onBack={() => handleNavigate('dashboard')}
                onLogout={handleLogout}
              />
            )}

            {currentView === 'clubSpending' && (
              <ClubSpending />
            )}

            {/* Transaction History */}
            {currentView === 'history' && (
              <TransactionHistory />
            )}

            {/* Split Expense - List View */}
            {currentView === 'splitExpense' && (
              <SplitList
                onCreateNew={() => handleNavigate('createSplit')}
                onViewDetails={(expenseId) => {
                  setSelectedSplitId(expenseId);
                  handleNavigate('splitDetail');
                }}
              />
            )}

            {/* Split Expense - Create New */}
            {currentView === 'createSplit' && (
              <CreateSplit
                onBack={() => handleNavigate('splitExpense')}
                onSplitCreated={(expenseId) => {
                  setSelectedSplitId(expenseId);
                  handleNavigate('splitDetail');
                }}
              />
            )}

            {/* Split Expense - Detail View */}
            {currentView === 'splitDetail' && selectedSplitId && (
              <SplitDetail
                expenseId={selectedSplitId}
                onBack={() => handleNavigate('splitExpense')}
              />
            )}

            {/* Wallet placeholder */}
            {currentView === 'wallet' && (
              <div className="p-8">
                <h1 className="text-2xl font-semibold text-foreground">Wallet</h1>
                <p className="text-muted-foreground mt-2">Coming soon...</p>
              </div>
            )}
          </main>

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden">
            <BottomNav
              currentView={currentView}
              onNavigate={handleNavigate}
            />
          </div>
        </div>
      </WalletProvider>
    </SnackbarProvider>
  );
}


