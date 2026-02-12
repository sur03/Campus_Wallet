import { useState, useEffect } from 'react';
import { Wallet, Send, Users, History, LogOut, Copy, Check, ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react';
import { useWallet } from '@txnlab/use-wallet-react';
import { useSnackbar } from 'notistack';
import algosdk from 'algosdk';
import { WalletConnectionModal } from './WalletConnectionModal';
import { getAlgodConfig } from '../utils/algorand';

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  address: string;
  timestamp: number;
  note?: string;
}

interface StudentDashboardProps {
  onLogout: () => void;
  onNavigateToSendPayment: () => void;
  onNavigateToClubFunding: () => void;
}

export function StudentDashboard({ onLogout, onNavigateToSendPayment, onNavigateToClubFunding }: StudentDashboardProps) {
  const { activeAddress, wallets } = useWallet();
  const { enqueueSnackbar } = useSnackbar();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // Fetch balance and transactions when wallet is connected
  useEffect(() => {
    if (activeAddress) {
      fetchBalance();
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [activeAddress]);

  const fetchBalance = async () => {
    if (!activeAddress) return;

    try {
      const config = getAlgodConfig();
      const algodClient = new algosdk.Algodv2(
        config.token || '',
        config.baseServer,
        config.port || ''
      );

      const accountInfo = await algodClient.accountInformation(activeAddress).do();
      const algoBalance = Number(accountInfo.amount) / 1_000_000;
      setBalance(algoBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(0);
    }
  };

  const fetchTransactions = async () => {
    if (!activeAddress) return;

    console.log('🔍 Fetching transactions for:', activeAddress);
    setLoadingTransactions(true);
    try {
      // Direct API call to Algorand Indexer
      const url = `https://testnet-idx.algonode.cloud/v2/transactions?address=${activeAddress}&limit=50`;

      console.log('📡 Calling API:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('📦 Raw API response:', data);
      console.log('📊 Number of transactions:', data.transactions?.length || 0);

      const txnList: Transaction[] = [];

      if (data.transactions && Array.isArray(data.transactions)) {
        for (const txn of data.transactions) {
          const txType = txn['tx-type'];

          console.log('🔎 Transaction:', txn.id, '| Type:', txType);

          // Process payment transactions
          if (txType === 'pay') {
            const sender = txn.sender;
            const paymentTxn = txn['payment-transaction'];
            const receiver = paymentTxn?.receiver;
            const amount = (paymentTxn?.amount || 0) / 1_000_000;
            const roundTime = txn['round-time'] || 0;

            // Determine if sent or received
            const isSent = sender === activeAddress;
            const otherAddress = isSent ? receiver : sender;

            console.log('💰', isSent ? 'SENT' : 'RECEIVED', amount, 'ALGO', isSent ? 'to' : 'from', otherAddress);

            if (!otherAddress) {
              console.log('⚠️ Skipping - no address');
              continue;
            }

            // Decode note if present
            let decodedNote: string | undefined;
            if (txn.note) {
              try {
                const noteBytes = Uint8Array.from(atob(txn.note), c => c.charCodeAt(0));
                decodedNote = new TextDecoder().decode(noteBytes);
              } catch (e) {
                // Ignore
              }
            }

            txnList.push({
              id: txn.id,
              type: isSent ? 'sent' : 'received',
              amount: amount,
              address: otherAddress,
              timestamp: roundTime,
              note: decodedNote,
            });
          }
        }
      }

      console.log('✅ Processed:', txnList.length, 'transactions');
      setTransactions(txnList);

      if (txnList.length > 0) {
        enqueueSnackbar(`Loaded ${txnList.length} transactions`, { variant: 'success' });
      }
    } catch (error) {
      console.error('❌ Error:', error);
      enqueueSnackbar('Failed to load transactions', { variant: 'error' });
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleConnectWallet = (walletAddress: string) => {
    setShowWalletModal(false);
    enqueueSnackbar(`Wallet connected: ${walletAddress.substring(0, 8)}...`, { variant: 'success' });
  };

  const handleDisconnect = async () => {
    try {
      const connectedWallet = wallets?.find(w => w.isActive);
      if (connectedWallet) {
        await connectedWallet.disconnect();
        enqueueSnackbar('Wallet disconnected', { variant: 'info' });
        onLogout();
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const copyToClipboard = () => {
    if (activeAddress) {
      navigator.clipboard.writeText(activeAddress);
      setCopied(true);
      enqueueSnackbar('Address copied to clipboard', { variant: 'success' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const actionCards = [
    {
      icon: Send,
      title: 'Send Payment',
      description: 'Transfer ALGO to peers',
      color: 'from-blue-500 to-purple-600',
      onClick: onNavigateToSendPayment,
    },
    {
      icon: Users,
      title: 'Split Expenses',
      description: 'Divide costs with friends',
      color: 'from-purple-500 to-pink-600',
      onClick: () => enqueueSnackbar('Split Expenses coming soon!', { variant: 'info' }),
    },
    {
      icon: Wallet,
      title: 'Club Funding',
      description: 'Blockchain-powered crowdfunding',
      color: 'from-teal-500 to-blue-600',
      onClick: onNavigateToClubFunding,
    },
    {
      icon: History,
      title: 'Transaction History',
      description: 'View past transactions',
      color: 'from-indigo-500 to-purple-600',
      onClick: () => setShowAllTransactions(!showAllTransactions),
    },
  ];

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  // Show top 3 for recent activity, all for transaction history
  const displayedTransactions = showAllTransactions ? transactions : transactions.slice(0, 3);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Student Dashboard</h1>
            <p className="text-purple-300">Manage your campus payments</p>
          </div>
          {activeAddress && (
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-6 py-3 bg-red-600/80 hover:bg-red-600 text-white font-medium rounded-lg border border-red-500/50 hover:border-red-500 transition-all shadow-lg hover:shadow-red-500/50"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          )}
        </div>

        {/* Wallet Connection Card */}
        {!activeAddress ? (
          <div className="mb-8 p-8 bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-lg rounded-2xl border border-purple-500/30 shadow-2xl">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 mb-4 shadow-lg shadow-purple-500/50">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
              <p className="text-purple-300 mb-6">Connect your wallet to start making transactions</p>
              <button
                onClick={() => setShowWalletModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-200"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-6 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center shadow-lg shadow-green-500/50">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-purple-300 mb-1">Connected Wallet</div>
                  <div className="font-mono text-white text-sm">
                    {activeAddress.substring(0, 8)}...{activeAddress.substring(activeAddress.length - 8)}
                  </div>
                  {balance !== null && (
                    <div className="text-sm text-green-400 mt-1">
                      Balance: {balance.toFixed(6)} ALGO
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-all"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-purple-400" />
                  )}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-all"
                  title="Disconnect wallet"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {actionCards.map((card, index) => (
            <button
              key={index}
              onClick={card.onClick}
              disabled={!activeAddress}
              className={`group relative p-6 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 overflow-hidden ${!activeAddress ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-2xl hover:scale-105'
                }`}
            >
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${card.color} mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <card.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-purple-300">{card.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8 p-6 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              {showAllTransactions ? 'Transaction History' : 'Recent Activity'}
            </h2>
            <div className="flex items-center gap-2">
              {activeAddress && (
                <button
                  onClick={() => {
                    fetchBalance();
                    fetchTransactions();
                  }}
                  className="px-3 py-1 text-sm text-purple-400 hover:text-purple-300 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Refresh transactions"
                >
                  🔄 Refresh
                </button>
              )}
              {transactions.length > 3 && (
                <button
                  onClick={() => setShowAllTransactions(!showAllTransactions)}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {showAllTransactions ? 'Show Less' : 'View All'}
                </button>
              )}
            </div>
          </div>

          {!activeAddress ? (
            <div className="text-center py-8 text-purple-300">
              Connect your wallet to view activity
            </div>
          ) : loadingTransactions ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <p className="text-purple-300 mt-2">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-purple-300">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-3">
              {displayedTransactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-purple-500/10 hover:border-purple-500/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === 'sent'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                        }`}
                    >
                      {txn.type === 'sent' ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                          {txn.type === 'sent' ? 'Sent to' : 'Received from'}
                        </span>
                        <span className="text-purple-300 font-mono text-sm">
                          {txn.address.substring(0, 6)}...{txn.address.substring(txn.address.length - 4)}
                        </span>
                      </div>
                      <div className="text-sm text-purple-400 mt-1">
                        {formatDate(txn.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div
                        className={`font-bold ${txn.type === 'sent' ? 'text-red-400' : 'text-green-400'
                          }`}
                      >
                        {txn.type === 'sent' ? '-' : '+'}{txn.amount.toFixed(6)} ALGO
                      </div>
                    </div>
                    <a
                      href={`https://testnet.algoexplorer.io/tx/${txn.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-slate-800 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="View on AlgoExplorer"
                    >
                      <ExternalLink className="w-4 h-4 text-purple-400" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <WalletConnectionModal
          onClose={() => setShowWalletModal(false)}
          onConnect={handleConnectWallet}
        />
      )}
    </div>
  );
}
