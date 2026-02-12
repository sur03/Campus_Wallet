/**
 * Create Campaign
 * ================
 * 
 * Deploy new campaign escrow contract to Algorand.
 * Rules are IMMUTABLE once deployed.
 */

import { useState } from 'react';
import { AlertCircle, Rocket, ExternalLink, CheckCircle } from 'lucide-react';
import { useWallet } from '@txnlab/use-wallet-react';
import { useSnackbar } from 'notistack';
import { deployCampaignContract } from '../../services/contractService';
import { saveCampaignMetadata } from '../../services/campaignService';
import { CampaignFormData } from '../../types/campaign';

interface CreateCampaignProps {
    onBack: () => void;
    onCampaignCreated: (contractAddress: string) => void;
}

export function CreateCampaign({ onBack, onCampaignCreated }: CreateCampaignProps) {
    const { activeAddress, transactionSigner } = useWallet();
    const { enqueueSnackbar } = useSnackbar();

    const [formData, setFormData] = useState<CampaignFormData>({
        title: '',
        description: '',
        clubName: '',
        goalAmount: 0,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default: 7 days from now
    });

    const [deploying, setDeploying] = useState(false);
    const [deploymentResult, setDeploymentResult] = useState<{
        contractAddress: string;
        appId: number;
        txId: string;
    } | null>(null);

    // Helper to format date for datetime-local input
    const formatDateTimeLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeAddress || !transactionSigner) {
            enqueueSnackbar('Please connect your wallet', { variant: 'warning' });
            return;
        }

        if (formData.goalAmount <= 0) {
            enqueueSnackbar('Goal amount must be greater than 0', { variant: 'error' });
            return;
        }

        if (formData.deadline <= new Date()) {
            enqueueSnackbar('Deadline must be in the future', { variant: 'error' });
            return;
        }

        setDeploying(true);

        try {
            // Debug logging
            console.log('🔍 Debug - Deployment Parameters:', {
                activeAddress,
                transactionSigner: !!transactionSigner,
                goalAmount: formData.goalAmount,
                deadline: formData.deadline,
                deadlineUnix: Math.floor(formData.deadline.getTime() / 1000),
            });

            console.log('🚀 Deploying campaign contract...');

            // Deploy smart contract
            const result = await deployCampaignContract({
                organizer: activeAddress,
                goalAmount: formData.goalAmount,
                deadline: Math.floor(formData.deadline.getTime() / 1000),
                signer: transactionSigner,
            });

            console.log('✅ Contract deployed:', result);

            // Save metadata
            await saveCampaignMetadata({
                contractAddress: result.contractAddress,
                appId: result.appId,
                deploymentTxId: result.txId,
                title: formData.title,
                description: formData.description,
                clubName: formData.clubName,
                organizerAddress: activeAddress,
                goalAmount: formData.goalAmount,
                deadline: Math.floor(formData.deadline.getTime() / 1000),
            });

            setDeploymentResult(result);
            enqueueSnackbar('Campaign created successfully!', { variant: 'success' });

            // Navigate to campaign detail after 3 seconds
            setTimeout(() => {
                onCampaignCreated(result.contractAddress);
            }, 3000);

        } catch (error) {
            console.error('❌ Deployment failed:', error);
            enqueueSnackbar(
                `Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                { variant: 'error' }
            );
        } finally {
            setDeploying(false);
        }
    };

    if (deploymentResult) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-green-500/30 p-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Campaign Deployed!</h2>
                        <p className="text-green-300">Your campaign is now live on the Algorand blockchain</p>
                    </div>

                    {/* Contract Info */}
                    <div className="space-y-4 mb-6">
                        <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/20">
                            <div className="text-sm text-purple-400 mb-1">Smart Contract Address</div>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-mono text-sm break-all">
                                    {deploymentResult.contractAddress}
                                </span>
                                <a
                                    href={`https://testnet.algoexplorer.io/address/${deploymentResult.contractAddress}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/20">
                            <div className="text-sm text-purple-400 mb-1">Application ID</div>
                            <div className="text-white font-mono">{deploymentResult.appId}</div>
                        </div>

                        <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/20">
                            <div className="text-sm text-purple-400 mb-1">Deployment Transaction</div>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-mono text-sm">
                                    {deploymentResult.txId.substring(0, 16)}...
                                </span>
                                <a
                                    href={`https://testnet.algoexplorer.io/tx/${deploymentResult.txId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg mb-6">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-yellow-300 font-medium mb-1">Campaign Rules Are Locked</p>
                                <p className="text-yellow-400 text-sm">
                                    The goal amount and deadline are now immutable on the blockchain.
                                    They cannot be changed by anyone, including you.
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-purple-300 text-sm">
                        Redirecting to campaign page...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 mb-4 shadow-lg shadow-teal-500/50">
                    <Rocket className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Create Campaign</h1>
                <p className="text-purple-300">Deploy a new crowdfunding campaign on Algorand</p>
            </div>

            {/* Warning Banner */}
            <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-yellow-300 font-medium mb-1">⚠️ Campaign Rules Are Immutable</p>
                        <p className="text-yellow-400 text-sm">
                            Once deployed, the goal amount and deadline are locked on the blockchain and cannot be changed.
                            Make sure all details are correct before deploying.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-8">
                <form onSubmit={handleSubmit}>
                    {/* Campaign Title */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-purple-300 mb-2">
                            Campaign Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                            placeholder="e.g., Annual Tech Fest 2026"
                            required
                        />
                    </div>

                    {/* Club Name */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-purple-300 mb-2">
                            Club Name *
                        </label>
                        <input
                            type="text"
                            value={formData.clubName}
                            onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                            placeholder="e.g., Computer Science Club"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-purple-300 mb-2">
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                            placeholder="Describe your campaign and how the funds will be used..."
                            required
                        />
                    </div>

                    {/* Goal Amount */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-purple-300 mb-2">
                            Goal Amount (ALGO) * 🔒 Locked on blockchain
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.1"
                            value={formData.goalAmount || ''}
                            onChange={(e) => setFormData({ ...formData, goalAmount: parseFloat(e.target.value) })}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                            placeholder="0.00"
                            required
                        />
                        <p className="text-xs text-purple-400 mt-1">
                            Minimum: 0.1 ALGO
                        </p>
                    </div>

                    {/* Deadline */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-purple-300 mb-2">
                            Deadline * 🔒 Locked on blockchain
                        </label>
                        <input
                            type="datetime-local"
                            value={formatDateTimeLocal(formData.deadline)}
                            onChange={(e) => {
                                const newDate = new Date(e.target.value);
                                if (!isNaN(newDate.getTime())) {
                                    setFormData({ ...formData, deadline: newDate });
                                }
                            }}
                            min={formatDateTimeLocal(new Date())}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                            required
                        />
                        <p className="text-xs text-purple-400 mt-1">
                            After this time, funds will be released (if goal met) or refundable (if goal not met)
                        </p>
                    </div>

                    {/* Organizer Address */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-purple-300 mb-2">
                            Organizer Wallet (You)
                        </label>
                        <div className="px-4 py-3 bg-slate-900/50 border border-purple-500/20 rounded-lg text-purple-300 font-mono text-sm">
                            {activeAddress ? (
                                `${activeAddress.substring(0, 12)}...${activeAddress.substring(activeAddress.length - 12)}`
                            ) : (
                                'Not connected'
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={deploying || !activeAddress}
                        className="w-full py-4 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-medium rounded-lg shadow-lg shadow-teal-500/50 hover:shadow-teal-500/70 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        {deploying ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Deploying Contract...
                            </>
                        ) : (
                            <>
                                <Rocket className="w-5 h-5" />
                                Deploy Campaign
                            </>
                        )}
                    </button>

                    {/* Cost Notice */}
                    <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <p className="text-sm text-blue-300 text-center">
                            💡 Deployment cost: ~0.1 ALGO (minimum balance) + 0.001 ALGO (transaction fee)
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
