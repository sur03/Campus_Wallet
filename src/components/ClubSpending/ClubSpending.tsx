/**
 * Club Spending Component
 * ========================
 * 
 * Main view for spending transparency.
 * Shows campaigns in both funding and spending phases.
 */

import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { SpendingGroup } from '../../types/spending';
import { Campaign } from '../../types/campaign';
import { getSpendingGroups } from '../../services/spendingGroupService';
import { getAllCampaigns } from '../../services/campaignService';
import { getSpendingTransactions, getTotalSpent, getWithdrawalAmount } from '../../services/indexerService';
import { calculateAccountingSummary } from '../../services/accountingService';
import { AccountingSummary } from './AccountingSummary';
import { SpendingLedger } from './SpendingLedger';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CampaignWithSpending extends Campaign {
    spendingGroup?: SpendingGroup;
    phase: 'funding' | 'spending';
}

export function ClubSpending() {
    const { activeAddress } = useWallet();
    const [campaigns, setCampaigns] = useState<CampaignWithSpending[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<CampaignWithSpending | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [accounting, setAccounting] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCampaigns();
    }, [activeAddress]);

    useEffect(() => {
        if (selectedCampaign?.spendingGroup?.spendingWalletAddress) {
            loadSpendingData(selectedCampaign);
        }
    }, [selectedCampaign]);

    async function loadCampaigns() {
        try {
            setLoading(true);
            const allCampaigns = await getAllCampaigns();
            const spendingGroups = await getSpendingGroups();

            // Filter campaigns where user is organizer
            const userCampaigns = allCampaigns.filter(
                c => c.organizerAddress === activeAddress
            );

            // Merge with spending groups
            const merged: CampaignWithSpending[] = userCampaigns.map(campaign => {
                const group = spendingGroups.find(g => g.campaignId === campaign.contractAddress);
                const phase = group?.spendingWalletAddress ? 'spending' : 'funding';

                return {
                    ...campaign,
                    spendingGroup: group,
                    phase,
                };
            });

            setCampaigns(merged);
        } catch (error) {
            console.error('Error loading campaigns:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadSpendingData(campaign: CampaignWithSpending) {
        if (!campaign.spendingGroup?.spendingWalletAddress) return;

        try {
            const walletAddress = campaign.spendingGroup.spendingWalletAddress;

            // Get spending transactions
            const txs = await getSpendingTransactions(walletAddress);
            setTransactions(txs);

            // Calculate accounting
            const withdrawn = await getWithdrawalAmount(
                campaign.contractAddress,
                walletAddress
            );
            const spent = await getTotalSpent(walletAddress);
            const summary = calculateAccountingSummary(withdrawn, spent);

            setAccounting(summary);
        } catch (error) {
            console.error('Error loading spending data:', error);
        }
    }

    if (!activeAddress) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-muted-foreground">
                            Connect your wallet to view spending transparency
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Club Spending Transparency</h1>
                <p className="text-muted-foreground mt-2">
                    Track expenses and view automatic accounting for your campaigns
                </p>
            </div>

            {/* Campaign List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map(campaign => (
                    <Card
                        key={campaign.contractAddress}
                        className={`cursor-pointer transition-all hover:shadow-md ${selectedCampaign?.contractAddress === campaign.contractAddress
                            ? 'ring-2 ring-primary'
                            : ''
                            }`}
                        onClick={() => setSelectedCampaign(campaign)}
                    >
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-lg">{campaign.clubName}</CardTitle>
                                <Badge variant={campaign.phase === 'spending' ? 'default' : 'secondary'}>
                                    {campaign.phase === 'spending' ? 'Spending Active' : 'Fundraising'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {campaign.title}
                            </p>
                            {campaign.phase === 'spending' && campaign.spendingGroup?.spendingWalletAddress && (
                                <div className="mt-3 pt-3 border-t">
                                    <p className="text-xs text-muted-foreground">Spending Wallet</p>
                                    <p className="text-xs font-mono mt-1">
                                        {campaign.spendingGroup.spendingWalletAddress.slice(0, 10)}...
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {campaigns.length === 0 && (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-muted-foreground">
                            No campaigns found. Create a campaign to get started.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Selected Campaign Details */}
            {selectedCampaign && selectedCampaign.phase === 'spending' && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold">{selectedCampaign.title}</h2>
                        <p className="text-muted-foreground">{selectedCampaign.clubName}</p>
                    </div>

                    {/* Accounting Summary */}
                    {accounting && <AccountingSummary summary={accounting} />}

                    {/* Spending Ledger */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Spending Ledger</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                All transactions from spending wallet
                            </p>
                        </CardHeader>
                        <CardContent>
                            <SpendingLedger transactions={transactions} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {selectedCampaign && selectedCampaign.phase === 'funding' && (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-muted-foreground">
                            Spending phase will activate after funds are withdrawn
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
