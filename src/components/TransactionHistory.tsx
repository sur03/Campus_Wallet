/**
 * Transaction History Component
 * ==============================
 * 
 * Full transaction history with filters and search.
 * Professional table view with blockchain verification.
 */

import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Search } from 'lucide-react';
import { useWallet } from '@txnlab/use-wallet-react';

interface Transaction {
    id: string;
    type: 'sent' | 'received' | 'funding' | 'spending';
    amount: number;
    address: string;
    timestamp: number;
    note?: string;
}

export function TransactionHistory() {
    const { activeAddress } = useWallet();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'sent' | 'received' | 'funding' | 'spending'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (activeAddress) {
            fetchTransactions();
        }
    }, [activeAddress]);

    const fetchTransactions = async () => {
        if (!activeAddress) return;

        try {
            setLoading(true);
            const indexerUrl = 'https://testnet-idx.algonode.cloud';

            const response = await fetch(
                `${indexerUrl}/v2/accounts/${activeAddress}/transactions?limit=50`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }

            const data = await response.json();
            const txns: Transaction[] = (data.transactions || []).map((tx: any) => ({
                id: tx.id,
                type: tx.sender === activeAddress ? 'sent' : 'received',
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
            setLoading(false);
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getExplorerUrl = (txId: string) => {
        return `https://testnet.algoexplorer.io/tx/${txId}`;
    };

    const filteredTransactions = transactions.filter(tx => {
        // Filter by type
        if (filter !== 'all' && tx.type !== filter) return false;

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                tx.id.toLowerCase().includes(query) ||
                tx.address.toLowerCase().includes(query) ||
                tx.note?.toLowerCase().includes(query)
            );
        }

        return true;
    });

    return (
        <div className="min-h-screen">
            {/* Page Header */}
            <div className="border-b border-border bg-card">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <h1 className="text-2xl font-semibold text-foreground">Transaction History</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        All transactions from your connected wallet
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {!activeAddress ? (
                    <div className="card-clean text-center py-12">
                        <p className="text-muted-foreground">Connect your wallet to view transaction history</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Filters and Search */}
                        <div className="card-clean">
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Search */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search by address, transaction ID, or memo..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="input-clean w-full pl-10"
                                    />
                                </div>

                                {/* Filter Buttons */}
                                <div className="flex gap-2">
                                    {(['all', 'sent', 'received', 'funding', 'spending'] as const).map((filterType) => (
                                        <button
                                            key={filterType}
                                            onClick={() => setFilter(filterType)}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === filterType
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                }`}
                                        >
                                            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Transaction Table */}
                        <div className="card-clean">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-foreground">
                                    {filteredTransactions.length} Transaction{filteredTransactions.length !== 1 ? 's' : ''}
                                </h2>
                                {loading && (
                                    <div className="text-sm text-muted-foreground">Loading...</div>
                                )}
                            </div>

                            {loading ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    Loading transactions...
                                </div>
                            ) : filteredTransactions.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    {searchQuery || filter !== 'all'
                                        ? 'No transactions match your filters'
                                        : 'No transactions yet'
                                    }
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b-2 border-border">
                                                <th className="table-header text-left">Date & Time</th>
                                                <th className="table-header text-left">Type</th>
                                                <th className="table-header text-right">Amount</th>
                                                <th className="table-header text-left">Address</th>
                                                <th className="table-header text-left">Memo</th>
                                                <th className="table-header text-right">Verify</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTransactions.map((tx) => (
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
                                                            {tx.address.slice(0, 12)}...{tx.address.slice(-8)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                                        {tx.note || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <a
                                                            href={getExplorerUrl(tx.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="explorer-link inline-block"
                                                            title="View on AlgoExplorer"
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

                            {/* Blockchain Verification Notice */}
                            {filteredTransactions.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-border">
                                    <div className="blockchain-verified">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        All transactions verified on Algorand blockchain
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
