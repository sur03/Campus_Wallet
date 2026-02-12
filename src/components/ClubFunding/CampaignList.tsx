/**
 * Campaign List
 * ==============
 * 
 * Discovery page showing all campaigns with blockchain data.
 * All balances and state are fetched from Algorand Indexer.
 */

import { useState, useEffect } from 'react';
import { Wallet, Plus, ExternalLink, TrendingUp, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useWallet } from '@txnlab/use-wallet-react';
import { useSnackbar } from 'notistack';
import { Campaign } from '../../types/campaign';
import { getAllCampaigns } from '../../services/campaignService';
import { getClubName, isVerifiedClub } from '../../utils/clubRegistry';

interface CampaignListProps {
    onCreateCampaign: () => void;
    onViewCampaign: (contractAddress: string) => void;
}

export function CampaignList({ onCreateCampaign, onViewCampaign }: CampaignListProps) {
    const { activeAddress } = useWallet();
    const { enqueueSnackbar } = useSnackbar();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'successful' | 'failed'>('all');

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const allCampaigns = await getAllCampaigns();
            setCampaigns(allCampaigns);
            console.log(`📋 Loaded ${allCampaigns.length} campaigns`);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            enqueueSnackbar('Failed to load campaigns', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const filteredCampaigns = campaigns.filter(campaign => {
        if (filter === 'all') return true;
        return campaign.status === filter;
    });

    const formatTimeRemaining = (deadline: number) => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = deadline - now;

        if (remaining <= 0) return 'Ended';

        const days = Math.floor(remaining / 86400);
        const hours = Math.floor((remaining % 86400) / 3600);

        if (days > 0) return `${days}d ${hours}h left`;
        return `${hours}h left`;
    };

    const getStatusBadge = (status: Campaign['status']) => {
        switch (status) {
            case 'active':
                return (
                    <span className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                        <Clock className="w-3 h-3" />
                        Active
                    </span>
                );
            case 'successful':
                return (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                        <CheckCircle className="w-3 h-3" />
                        Successful
                    </span>
                );
            case 'failed':
                return (
                    <span className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                        <XCircle className="w-3 h-3" />
                        Failed
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            {/* Page Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 mb-4 shadow-lg shadow-teal-500/50">
                    <Wallet className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Club Funding</h1>
                <p className="text-purple-300">Blockchain-powered crowdfunding for campus clubs</p>

                {/* Blockchain Notice */}
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                    <span className="text-blue-300 text-sm">
                        🔗 All funds controlled by smart contracts • Verifiable on AlgoExplorer
                    </span>
                </div>
            </div>

            {/* Create Campaign Button */}
            {activeAddress && (
                <div className="mb-6 flex justify-end">
                    <button
                        onClick={onCreateCampaign}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg shadow-teal-500/50 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Create Campaign
                    </button>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="mb-6 flex gap-2 p-1 bg-slate-800/50 rounded-lg border border-purple-500/20 w-fit">
                {(['all', 'active', 'successful', 'failed'] as const).map((filterOption) => (
                    <button
                        key={filterOption}
                        onClick={() => setFilter(filterOption)}
                        className={`px-4 py-2 rounded-md font-medium transition-all capitalize ${filter === filterOption
                                ? 'bg-purple-600 text-white'
                                : 'text-purple-300 hover:text-white'
                            }`}
                    >
                        {filterOption}
                    </button>
                ))}
            </div>

            {/* Campaign Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    <p className="text-purple-300 mt-4">Loading campaigns from blockchain...</p>
                </div>
            ) : filteredCampaigns.length === 0 ? (
                <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-purple-500/20">
                    <Wallet className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No campaigns found</h3>
                    <p className="text-purple-300 mb-6">
                        {filter === 'all'
                            ? 'Be the first to create a campaign!'
                            : `No ${filter} campaigns at the moment`}
                    </p>
                    {activeAddress && filter === 'all' && (
                        <button
                            onClick={onCreateCampaign}
                            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg transition-all"
                        >
                            Create First Campaign
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCampaigns.map((campaign) => {
                        const progress = (campaign.totalCollected / campaign.goalAmount) * 100;
                        const clubName = getClubName(campaign.organizerAddress) || campaign.clubName;
                        const verified = isVerifiedClub(campaign.organizerAddress);

                        return (
                            <div
                                key={campaign.contractAddress}
                                className="group bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-all overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20"
                            >
                                {/* Card Header */}
                                <div className="p-6 border-b border-purple-500/10">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-white">{clubName}</h3>
                                            {verified && (
                                                <span className="text-blue-400" title="Verified Club">
                                                    ✓
                                                </span>
                                            )}
                                        </div>
                                        {getStatusBadge(campaign.status)}
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-2">{campaign.title}</h4>
                                    <p className="text-purple-300 text-sm line-clamp-2">{campaign.description}</p>
                                </div>

                                {/* Progress Section */}
                                <div className="p-6">
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-purple-300">Progress</span>
                                            <span className="text-white font-medium">{progress.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-900/50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-teal-500 to-blue-600 transition-all duration-500"
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-1 text-purple-400 text-xs mb-1">
                                                <TrendingUp className="w-3 h-3" />
                                                Collected
                                            </div>
                                            <div className="text-white font-bold">
                                                {campaign.totalCollected.toFixed(2)} ALGO
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1 text-purple-400 text-xs mb-1">
                                                <Users className="w-3 h-3" />
                                                Goal
                                            </div>
                                            <div className="text-white font-bold">
                                                {campaign.goalAmount.toFixed(2)} ALGO
                                            </div>
                                        </div>
                                    </div>

                                    {/* Deadline */}
                                    <div className="flex items-center gap-2 text-sm text-purple-300 mb-4">
                                        <Clock className="w-4 h-4" />
                                        {formatTimeRemaining(campaign.deadline)}
                                    </div>

                                    {/* Smart Contract Info */}
                                    <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-purple-500/10">
                                        <div className="text-xs text-purple-400 mb-1">Smart Contract</div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-white font-mono text-xs">
                                                {campaign.contractAddress.substring(0, 8)}...
                                                {campaign.contractAddress.substring(campaign.contractAddress.length - 6)}
                                            </span>
                                            <a
                                                href={`https://testnet.algoexplorer.io/address/${campaign.contractAddress}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>

                                    {/* View Campaign Button */}
                                    <button
                                        onClick={() => onViewCampaign(campaign.contractAddress)}
                                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all"
                                    >
                                        View Campaign
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Refresh Button */}
            {campaigns.length > 0 && (
                <div className="mt-6 text-center">
                    <button
                        onClick={fetchCampaigns}
                        className="px-4 py-2 text-purple-400 hover:text-purple-300 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        🔄 Refresh from Blockchain
                    </button>
                </div>
            )}
        </div>
    );
}
