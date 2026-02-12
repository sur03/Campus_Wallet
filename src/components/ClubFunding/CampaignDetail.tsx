/**
 * Campaign Detail
 * ================
 * 
 * Full campaign page with contribution, withdrawal, refund, and transparency features.
 * All data fetched from blockchain - UI is a viewer, not controller.
 */

import { useState, useEffect } from 'react';
import {
    ExternalLink, Wallet, TrendingUp, Users, Clock, AlertCircle,
    CheckCircle, XCircle, ArrowUpRight, Copy, Check
} from 'lucide-react';
import { useWallet } from '@txnlab/use-wallet-react';
import { useSnackbar } from 'notistack';
import { Campaign, Contribution } from '../../types/campaign';
import { getCampaignByAddress } from '../../services/campaignService';
import { getContractTransactions, getUserContribution } from '../../services/indexerService';
import { contributeToContract, withdrawFunds, claimRefund, optInToApp } from '../../services/contractService';
import { getClubName, isVerifiedClub } from '../../utils/clubRegistry';

interface CampaignDetailProps {
    contractAddress: string;
    onBack: () => void;
}

export function CampaignDetail({ contractAddress, onBack }: CampaignDetailProps) {
    const { activeAddress, transactionSigner } = useWallet();
    const { enqueueSnackbar } = useSnackbar();

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [userContribution, setUserContribution] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [contributionAmount, setContributionAmount] = useState<string>('');
    const [processing, setProcessing] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchCampaignData();
    }, [contractAddress, activeAddress]);

    const fetchCampaignData = async () => {
        setLoading(true);
        try {
            // Fetch campaign metadata and blockchain state
            const campaignData = await getCampaignByAddress(contractAddress);
            if (!campaignData) {
                enqueueSnackbar('Campaign not found', { variant: 'error' });
                onBack();
                return;
            }
            setCampaign(campaignData);

            // Fetch contributions from blockchain
            const txns = await getContractTransactions(contractAddress);
            setContributions(txns);

            // Fetch user's contribution if wallet connected
            if (activeAddress) {
                const userAmount = await getUserContribution(campaignData.appId, activeAddress);
                setUserContribution(userAmount);
            }
        } catch (error) {
            console.error('Error fetching campaign data:', error);
            enqueueSnackbar('Failed to load campaign', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleContribute = async () => {
        if (!campaign || !activeAddress || !transactionSigner) {
            enqueueSnackbar('Please connect your wallet', { variant: 'warning' });
            return;
        }

        const amount = parseFloat(contributionAmount);
        if (isNaN(amount) || amount <= 0) {
            enqueueSnackbar('Please enter a valid amount', { variant: 'error' });
            return;
        }

        setProcessing(true);
        try {
            // Opt-in if first contribution
            if (userContribution === 0) {
                console.log('🔐 Opting in to application...');
                await optInToApp({
                    appId: campaign.appId,
                    sender: activeAddress,
                    signer: transactionSigner,
                });
            }

            // Contribute
            console.log('💰 Contributing to campaign...');
            const result = await contributeToContract({
                contractAddress: campaign.contractAddress,
                appId: campaign.appId,
                amount,
                sender: activeAddress,
                signer: transactionSigner,
            });

            enqueueSnackbar(`Contribution successful! TX: ${result.txId}`, { variant: 'success' });
            setContributionAmount('');

            // Refresh data
            setTimeout(() => fetchCampaignData(), 2000);
        } catch (error) {
            console.error('❌ Contribution failed:', error);
            enqueueSnackbar(
                `Contribution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                { variant: 'error' }
            );
        } finally {
            setProcessing(false);
        }
    };

    const handleWithdraw = async () => {
        if (!campaign || !activeAddress || !transactionSigner) return;

        setProcessing(true);
        try {
            console.log('💸 Withdrawing funds...');
            const result = await withdrawFunds({
                appId: campaign.appId,
                organizer: activeAddress,
                signer: transactionSigner,
            });

            enqueueSnackbar(`Withdrawal successful! TX: ${result.txId}`, { variant: 'success' });

            // Refresh data
            setTimeout(() => fetchCampaignData(), 2000);
        } catch (error) {
            console.error('❌ Withdrawal failed:', error);
            enqueueSnackbar(
                `Withdrawal failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                { variant: 'error' }
            );
        } finally {
            setProcessing(false);
        }
    };

    const handleRefund = async () => {
        if (!campaign || !activeAddress || !transactionSigner) return;

        setProcessing(true);
        try {
            console.log('🔄 Claiming refund...');
            const result = await claimRefund({
                appId: campaign.appId,
                contributor: activeAddress,
                signer: transactionSigner,
            });

            enqueueSnackbar(`Refund successful! TX: ${result.txId}`, { variant: 'success' });

            // Refresh data
            setTimeout(() => fetchCampaignData(), 2000);
        } catch (error) {
            console.error('❌ Refund failed:', error);
            enqueueSnackbar(
                `Refund failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                { variant: 'error' }
            );
        } finally {
            setProcessing(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        enqueueSnackbar('Copied to clipboard', { variant: 'success' });
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    const formatTimeRemaining = (deadline: number) => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = deadline - now;

        if (remaining <= 0) return 'Ended';

        const days = Math.floor(remaining / 86400);
        const hours = Math.floor((remaining % 86400) / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);

        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    if (loading || !campaign) {
        return (
            <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                <p className="text-purple-300 mt-4">Loading campaign from blockchain...</p>
            </div>
        );
    }

    const progress = (campaign.totalCollected / campaign.goalAmount) * 100;
    const clubName = getClubName(campaign.organizerAddress) || campaign.clubName;
    const verified = isVerifiedClub(campaign.organizerAddress);
    const isOrganizer = activeAddress === campaign.organizerAddress;
    const deadlinePassed = Math.floor(Date.now() / 1000) >= campaign.deadline;
    const goalMet = campaign.totalCollected >= campaign.goalAmount;
    const canWithdraw = isOrganizer && deadlinePassed && goalMet;
    const canRefund = !isOrganizer && deadlinePassed && !goalMet && userContribution > 0;

    return (
        <div className="max-w-5xl mx-auto">
            {/* Campaign Header */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-8 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-2xl font-bold text-white">{clubName}</h2>
                            {verified && (
                                <span className="text-blue-400 text-xl" title="Verified Club">✓</span>
                            )}
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">{campaign.title}</h1>
                        <p className="text-purple-300 text-lg">{campaign.description}</p>
                    </div>

                    {/* Status Badge */}
                    <div>
                        {campaign.status === 'active' && (
                            <span className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full">
                                <Clock className="w-4 h-4" />
                                Active
                            </span>
                        )}
                        {campaign.status === 'successful' && (
                            <span className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full">
                                <CheckCircle className="w-4 h-4" />
                                Successful
                            </span>
                        )}
                        {campaign.status === 'failed' && (
                            <span className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-full">
                                <XCircle className="w-4 h-4" />
                                Failed
                            </span>
                        )}
                    </div>
                </div>

                {/* Blockchain Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/10">
                        <div className="text-sm text-purple-400 mb-2">Smart Contract Address</div>
                        <div className="flex items-center justify-between">
                            <span className="text-white font-mono text-sm break-all">
                                {campaign.contractAddress}
                            </span>
                            <div className="flex gap-2 ml-2">
                                <button
                                    onClick={() => copyToClipboard(campaign.contractAddress)}
                                    className="text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <a
                                    href={`https://testnet.algoexplorer.io/address/${campaign.contractAddress}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/10">
                        <div className="text-sm text-purple-400 mb-2">Organizer Wallet</div>
                        <div className="flex items-center justify-between">
                            <span className="text-white font-mono text-sm">
                                {campaign.organizerAddress.substring(0, 12)}...
                                {campaign.organizerAddress.substring(campaign.organizerAddress.length - 8)}
                            </span>
                            <a
                                href={`https://testnet.algoexplorer.io/address/${campaign.organizerAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Funding Status */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Progress */}
                    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Funding Progress</h3>

                        <div className="mb-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-purple-300">Progress</span>
                                <span className="text-white font-medium">{progress.toFixed(1)}%</span>
                            </div>
                            <div className="h-4 bg-slate-900/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-teal-500 to-blue-600 transition-all duration-500"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <div className="flex items-center gap-1 text-purple-400 text-sm mb-1">
                                    <TrendingUp className="w-4 h-4" />
                                    Collected
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    {campaign.totalCollected.toFixed(2)}
                                </div>
                                <div className="text-sm text-purple-300">ALGO</div>
                            </div>

                            <div>
                                <div className="flex items-center gap-1 text-purple-400 text-sm mb-1">
                                    <Users className="w-4 h-4" />
                                    Goal
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    {campaign.goalAmount.toFixed(2)}
                                </div>
                                <div className="text-sm text-purple-300">ALGO</div>
                            </div>

                            <div>
                                <div className="flex items-center gap-1 text-purple-400 text-sm mb-1">
                                    <Clock className="w-4 h-4" />
                                    {deadlinePassed ? 'Ended' : 'Time Left'}
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    {formatTimeRemaining(campaign.deadline)}
                                </div>
                                <div className="text-sm text-purple-300">
                                    {new Date(campaign.deadline * 1000).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contribute Section */}
                    {campaign.status === 'active' && (
                        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Contribute</h3>

                            {activeAddress ? (
                                <div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-purple-300 mb-2">
                                            Amount (ALGO)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={contributionAmount}
                                            onChange={(e) => setContributionAmount(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <button
                                        onClick={handleContribute}
                                        disabled={processing || !contributionAmount}
                                        className="w-full py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-medium rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Wallet className="w-5 h-5" />
                                                Contribute via Wallet
                                            </>
                                        )}
                                    </button>

                                    {userContribution > 0 && (
                                        <p className="text-sm text-purple-300 mt-2">
                                            Your total contribution: {userContribution.toFixed(2)} ALGO
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                                    <p className="text-yellow-300 text-center">
                                        Connect your wallet to contribute
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Post-Deadline Actions */}
                    {deadlinePassed && (
                        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Campaign Ended</h3>

                            {canWithdraw && (
                                <div>
                                    <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg mb-4">
                                        <p className="text-green-300">
                                            ✅ Goal met! You can withdraw the funds.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleWithdraw}
                                        disabled={processing}
                                        className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-medium rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Withdraw Funds ({campaign.totalCollected.toFixed(2)} ALGO)
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {canRefund && (
                                <div>
                                    <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg mb-4">
                                        <p className="text-red-300">
                                            ❌ Goal not met. You can claim your refund.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleRefund}
                                        disabled={processing}
                                        className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-medium rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Claim Refund ({userContribution.toFixed(2)} ALGO)
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {!canWithdraw && !canRefund && (
                                <div className="p-4 bg-slate-900/50 border border-purple-500/20 rounded-lg">
                                    <p className="text-purple-300 text-center">
                                        {goalMet
                                            ? 'Campaign successful! Organizer can withdraw funds.'
                                            : 'Campaign failed. Contributors can claim refunds.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Transparency Ledger */}
                    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Transparency Ledger</h3>
                            <a
                                href={`https://testnet.algoexplorer.io/address/${campaign.contractAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                                Verify on AlgoExplorer
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>

                        <p className="text-purple-300 text-sm mb-4">
                            All contributions are publicly verifiable on the Algorand blockchain
                        </p>

                        {contributions.length === 0 ? (
                            <div className="text-center py-8 text-purple-300">
                                No contributions yet
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {contributions.map((contribution) => (
                                    <div
                                        key={contribution.txId}
                                        className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-purple-500/10 hover:border-purple-500/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <ArrowUpRight className="w-4 h-4 text-green-400" />
                                            </div>
                                            <div>
                                                <div className="text-white font-mono text-sm">
                                                    {contribution.contributorAddress.substring(0, 8)}...
                                                    {contribution.contributorAddress.substring(contribution.contributorAddress.length - 6)}
                                                </div>
                                                <div className="text-xs text-purple-400">
                                                    {formatDate(contribution.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="text-white font-bold">
                                                    +{contribution.amount.toFixed(2)} ALGO
                                                </div>
                                            </div>
                                            <a
                                                href={`https://testnet.algoexplorer.io/tx/${contribution.txId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Info */}
                <div className="space-y-6">
                    {/* Campaign Stats */}
                    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Campaign Stats</h3>
                        <div className="space-y-3">
                            <div>
                                <div className="text-sm text-purple-400">Contributors</div>
                                <div className="text-xl font-bold text-white">{campaign.contributorCount}</div>
                            </div>
                            <div>
                                <div className="text-sm text-purple-400">Average Contribution</div>
                                <div className="text-xl font-bold text-white">
                                    {campaign.contributorCount > 0
                                        ? (campaign.totalCollected / campaign.contributorCount).toFixed(2)
                                        : '0.00'} ALGO
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-purple-400">Created</div>
                                <div className="text-sm text-white">
                                    {new Date(campaign.createdAt * 1000).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Blockchain Notice */}
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="text-blue-300 font-medium mb-2">🔗 Blockchain Controlled</h4>
                        <p className="text-blue-400 text-sm">
                            This campaign is controlled by a smart contract. No person or admin can move funds -
                            only the blockchain enforces the rules.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
