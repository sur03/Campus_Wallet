/**
 * Club Funding - Main Container
 * ==============================
 * 
 * Blockchain-native crowdfunding for campus clubs.
 * Funds are controlled by smart contracts, not people.
 */

import { useState } from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useWallet } from '@txnlab/use-wallet-react';
import { CampaignList } from './CampaignList';
import { CreateCampaign } from './CreateCampaign';
import { CampaignDetail } from './CampaignDetail';

interface ClubFundingProps {
    onBack: () => void;
    onLogout: () => void;
}

type View = 'list' | 'create' | 'detail';

export function ClubFunding({ onBack, onLogout }: ClubFundingProps) {
    const { activeAddress, wallets } = useWallet();
    const [currentView, setCurrentView] = useState<View>('list');
    const [selectedCampaignAddress, setSelectedCampaignAddress] = useState<string | null>(null);

    const handleDisconnect = async () => {
        try {
            const connectedWallet = wallets?.find(w => w.isActive);
            if (connectedWallet) {
                await connectedWallet.disconnect();
                onLogout();
            }
        } catch (error) {
            console.error('Disconnect error:', error);
        }
    };

    const navigateToList = () => {
        setCurrentView('list');
        setSelectedCampaignAddress(null);
    };

    const navigateToCreate = () => {
        setCurrentView('create');
    };

    const navigateToDetail = (contractAddress: string) => {
        setSelectedCampaignAddress(contractAddress);
        setCurrentView('detail');
    };

    const handleCampaignCreated = (contractAddress: string) => {
        // Navigate to the newly created campaign
        navigateToDetail(contractAddress);
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={currentView === 'list' ? onBack : navigateToList}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-white rounded-lg border border-purple-500/20 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {currentView === 'list' ? 'Back to Dashboard' : 'Back to Campaigns'}
                    </button>
                    {activeAddress && (
                        <button
                            onClick={handleDisconnect}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg border border-red-500/50 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    )}
                </div>

                {/* Content */}
                {currentView === 'list' && (
                    <CampaignList
                        onCreateCampaign={navigateToCreate}
                        onViewCampaign={navigateToDetail}
                    />
                )}

                {currentView === 'create' && (
                    <CreateCampaign
                        onBack={navigateToList}
                        onCampaignCreated={handleCampaignCreated}
                    />
                )}

                {currentView === 'detail' && selectedCampaignAddress && (
                    <CampaignDetail
                        contractAddress={selectedCampaignAddress}
                        onBack={navigateToList}
                    />
                )}
            </div>
        </div>
    );
}
