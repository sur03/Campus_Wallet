/**
 * Accounting Summary Component
 * ==============================
 * 
 * Displays auto-calculated financial summary.
 * All values derived from blockchain data.
 */

import React from 'react';
import { AccountingSummary as AccountingSummaryType } from '../../types/spending';
import { formatAlgoAmount, getStatusColor, getStatusLabel } from '../../services/accountingService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface AccountingSummaryProps {
    summary: AccountingSummaryType;
}

export function AccountingSummary({ summary }: AccountingSummaryProps) {
    const statusColor = getStatusColor(summary.status);
    const statusLabel = getStatusLabel(summary.status);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Accounting Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Withdrawn */}
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Withdrawn</p>
                        <p className="text-2xl font-semibold">
                            {formatAlgoAmount(summary.withdrawnAmount)} ALGO
                        </p>
                    </div>

                    {/* Total Spent */}
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                        <p className="text-2xl font-semibold">
                            {formatAlgoAmount(summary.totalSpent)} ALGO
                        </p>
                    </div>

                    {/* Remaining Balance */}
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Remaining</p>
                        <div className="flex items-center gap-2">
                            <p className="text-2xl font-semibold">
                                {formatAlgoAmount(summary.remainingBalance)} ALGO
                            </p>
                            <Badge
                                variant={
                                    statusColor === 'green' ? 'default' :
                                        statusColor === 'red' ? 'destructive' :
                                            'secondary'
                                }
                            >
                                {statusLabel}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Blockchain Source Notice */}
                <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                        All values derived directly from Algorand blockchain
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
