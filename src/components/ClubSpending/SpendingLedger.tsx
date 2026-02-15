/**
 * Spending Ledger Component
 * ==========================
 * 
 * Table displaying all spending transactions from blockchain.
 * Every row is verifiable on AlgoExplorer.
 */

import React from 'react';
import { SpendingTransaction } from '../../types/spending';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { ExternalLink, Copy } from 'lucide-react';
import { formatAlgoAmount } from '../../services/accountingService';

interface SpendingLedgerProps {
    transactions: SpendingTransaction[];
}

export function SpendingLedger({ transactions }: SpendingLedgerProps) {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    };

    if (transactions.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">No spending transactions yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                    Expenses will appear here automatically when funds are spent
                </p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Receiver</TableHead>
                        <TableHead>Memo</TableHead>
                        <TableHead>Tx Hash</TableHead>
                        <TableHead className="text-right">Verify</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((tx) => (
                        <TableRow key={tx.txId}>
                            <TableCell className="font-medium">
                                {formatDate(tx.timestamp)}
                            </TableCell>
                            <TableCell className="font-mono">
                                {formatAlgoAmount(tx.amount)} ALGO
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm">
                                        {truncateAddress(tx.receiver)}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(tx.receiver)}
                                        className="h-6 w-6 p-0"
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                                {tx.memo || <span className="text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm">
                                        {truncateAddress(tx.txId)}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(tx.txId)}
                                        className="h-6 w-6 p-0"
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => window.open(tx.explorerUrl, '_blank')}
                                    className="gap-1"
                                >
                                    AlgoExplorer
                                    <ExternalLink className="h-3 w-3" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
