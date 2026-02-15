/**
 * Professional Dashboard Component
 * ==================================
 * 
 * Executive summary view: Clean, data-first, no action cards.
 * Tables > Cards for financial data.
 */

import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Copy, Check, Wallet as WalletIcon } from 'lucide-react';
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

interface DashboardProps {
  onLogout: () => void;
  onNavigateToSendPayment: () => void;
  onNavigateToClubFunding: () => void;
  onNavigateToClubSpending: () => void;
}

export function StudentDashboard({
  onLogout,
  onNavigateToSendPayment,
  onNavigateToClubFunding,
  onNavigateToClubSpending
}: DashboardProps) {
  const { activeAddress, wallets } = useWallet();
  const { enqueueSnackbar } = useSnackbar();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

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
      // Fix BigInt conversion for algosdk v3
      const algoBalance = Number(accountInfo.amount) / 1_000_000;
      setBalance(algoBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!activeAddress) return;

    try {
      setLoadingTransactions(true);
      // Use proper Indexer URL for TestNet
      const indexerUrl = 'https://testnet-idx.algonode.cloud';

      const response = await fetch(
        `${indexerUrl}/v2/accounts/${activeAddress}/transactions?limit=5`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      const txns: Transaction[] = (data.transactions || []).map((tx: any) => ({
        id: tx.id,
        type: tx.sender === activeAddress ? 'sent' : 'received',
        // Fix BigInt conversion for algosdk v3
        amount: Number(tx['payment-transaction']?.amount || 0) / 1_000_000,
        address: tx.sender === activeAddress
          ? tx['payment-transaction']?.receiver || ''
          : tx.sender,
        timestamp: tx['round-time'] || 0,
        note: tx.note ? atob(tx.note) : undefined,
      }));

      setTransactions(txns);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoadingTransactions(false);
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

  const handleDisconnect = async () => {
    try {
      const activeWallet = wallets?.find(w => w.isActive);
      if (activeWallet) {
        await activeWallet.disconnect();
        enqueueSnackbar('Wallet disconnected', { variant: 'info' });
        onLogout();
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      enqueueSnackbar('Failed to disconnect wallet', { variant: 'error' });
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getExplorerUrl = (txId: string) => {
    return `https://testnet.algoexplorer.io/tx/${txId}`;
  };

  return (
    <div className="min-h-screen">
      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <WalletConnectionModal
          onClose={() => setShowWalletModal(false)}
          onConnect={() => {
            setShowWalletModal(false);
            fetchBalance();
            fetchTransactions();
          }}
        />
      )}

      {/* Page Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Financial overview</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {!activeAddress ? (
          /* Wallet Connection Prompt */
          <div className="card-clean max-w-md mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <WalletIcon className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Connect Wallet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Connect your Algorand wallet to view your dashboard
            </p>
            <button
              onClick={() => setShowWalletModal(true)}
              className="btn-primary w-full"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Balance */}
              <div className="card-clean">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-2xl font-semibold tabular-nums text-foreground mt-1">
                      {balance !== null ? balance.toFixed(6) : '---'} ALGO
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <WalletIcon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>

              {/* Active Campaigns */}
              <div className="card-clean">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Campaigns</p>
                    <p className="text-2xl font-semibold tabular-nums text-foreground mt-1">
                      0
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Transactions */}
              <div className="card-clean">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-2xl font-semibold tabular-nums text-foreground mt-1">
                      {transactions.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Info */}
            <div className="card-clean">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <WalletIcon className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Connected Wallet</p>
                    <p className="font-mono text-sm text-foreground mt-0.5">
                      {activeAddress.substring(0, 12)}...{activeAddress.substring(activeAddress.length - 12)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-muted rounded-md transition-colors"
                    title="Copy address"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="btn-destructive text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="card-clean">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
                <button className="text-sm text-primary hover:text-primary/80">
                  View all
                </button>
              </div>

              {loadingTransactions ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading transactions...
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="table-header text-left">Date</th>
                        <th className="table-header text-left">Type</th>
                        <th className="table-header text-right">Amount</th>
                        <th className="table-header text-left">Address</th>
                        <th className="table-header text-right">Verify</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="table-row">
                          <td className="px-4 py-3 text-sm text-foreground">
                            {formatDate(tx.timestamp)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {tx.type === 'sent' ? (
                                <ArrowUpRight className="w-4 h-4 text-destructive" />
                              ) : (
                                <ArrowDownLeft className="w-4 h-4 text-success" />
                              )}
                              <span className="text-sm text-foreground capitalize">
                                {tx.type}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`amount-display text-sm ${tx.type === 'sent' ? 'text-destructive' : 'text-success'
                              }`}>
                              {tx.type === 'sent' ? '-' : '+'}{tx.amount.toFixed(6)} ALGO
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="address-display">
                              {tx.address.slice(0, 8)}...{tx.address.slice(-6)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <a
                              href={getExplorerUrl(tx.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="explorer-link"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={onNavigateToSendPayment}
                className="card-clean hover:bg-muted transition-colors text-left"
              >
                <p className="text-sm font-medium text-foreground">Send Payment</p>
                <p className="text-xs text-muted-foreground mt-1">Transfer ALGO to another wallet</p>
              </button>
              <button
                onClick={onNavigateToClubFunding}
                className="card-clean hover:bg-muted transition-colors text-left"
              >
                <p className="text-sm font-medium text-foreground">Club Funding</p>
                <p className="text-xs text-muted-foreground mt-1">Create or contribute to campaigns</p>
              </button>
              <button
                onClick={onNavigateToClubSpending}
                className="card-clean hover:bg-muted transition-colors text-left"
              >
                <p className="text-sm font-medium text-foreground">Club Spending</p>
                <p className="text-xs text-muted-foreground mt-1">Track campaign expenses</p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
