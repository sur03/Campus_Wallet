/**
 * Campaign Service
 * =================
 * 
 * Campaign metadata management (off-chain storage).
 * This is for UX ONLY - does NOT control funds.
 */

import { Campaign, CampaignFormData } from '../types/campaign';
import { getContractBalance, getContractState, getCampaignStatus } from './indexerService';
import { createSpendingGroupForCampaign } from './spendingGroupService';

// In-memory storage for demo
// In production, use Firebase/Supabase
let campaignRegistry: Campaign[] = [];

/**
 * Save campaign metadata after deployment
 * 
 * Also auto-creates spending group for lifecycle tracking.
 */
export async function saveCampaignMetadata(campaign: {
    contractAddress: string;
    appId: number | bigint;  // Can be BigInt from algosdk
    deploymentTxId: string;
    title: string;
    description: string;
    clubName: string;
    organizerAddress: string;
    goalAmount: number;
    deadline: number;
}): Promise<void> {
    try {
        const newCampaign: Campaign = {
            contractAddress: campaign.contractAddress,
            appId: typeof campaign.appId === 'bigint' ? Number(campaign.appId) : campaign.appId,
            deploymentTxId: campaign.deploymentTxId,
            title: campaign.title,
            description: campaign.description,
            clubName: campaign.clubName,
            organizerAddress: campaign.organizerAddress,
            goalAmount: campaign.goalAmount,
            deadline: campaign.deadline,
            totalCollected: 0,
            contributorCount: 0,
            status: 'active',
            createdAt: Math.floor(Date.now() / 1000),
        };

        campaignRegistry.push(newCampaign);

        // Save to localStorage for persistence
        localStorage.setItem('campaigns', JSON.stringify(campaignRegistry));

        // Auto-create spending group (with NULL wallet address)
        await createSpendingGroupForCampaign({
            campaignId: newCampaign.contractAddress,
            clubName: newCampaign.clubName,
            fundingContractAddress: newCampaign.contractAddress,
            organizerAddress: newCampaign.organizerAddress,
        });

        console.log('✅ Campaign and spending group created:', newCampaign.title);
    } catch (error) {
        console.error('Error saving campaign metadata:', error);
        throw error;
    }
}

/**
 * Load campaigns from storage
 */
function loadCampaignsFromStorage(): void {
    try {
        const stored = localStorage.getItem('campaigns');
        if (stored) {
            campaignRegistry = JSON.parse(stored);
            console.log(`📦 Loaded ${campaignRegistry.length} campaigns from storage`);
        }
    } catch (error) {
        console.error('Error loading campaigns:', error);
        campaignRegistry = [];
    }
}

// Load on module initialization
loadCampaignsFromStorage();

/**
 * Get all campaigns with current blockchain state
 */
export async function getAllCampaigns(): Promise<Campaign[]> {
    try {
        // Update each campaign with current blockchain data
        const updatedCampaigns = await Promise.all(
            campaignRegistry.map(async (campaign) => {
                try {
                    // Fetch current balance from blockchain
                    const balance = await getContractBalance(campaign.contractAddress);

                    // Fetch contract state
                    const state = await getContractState(campaign.appId);

                    if (state) {
                        const status = getCampaignStatus(
                            state.totalCollected,
                            state.goalAmount,
                            state.deadline
                        );

                        return {
                            ...campaign,
                            totalCollected: balance,
                            contributorCount: state.contributorCount,
                            status,
                        };
                    }

                    return campaign;
                } catch (error) {
                    console.error(`Error updating campaign ${campaign.contractAddress}:`, error);
                    return campaign;
                }
            })
        );

        return updatedCampaigns;
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return campaignRegistry;
    }
}

/**
 * Get campaign by contract address
 */
export async function getCampaignByAddress(contractAddress: string): Promise<Campaign | null> {
    try {
        const campaign = campaignRegistry.find(c => c.contractAddress === contractAddress);

        if (!campaign) {
            console.error('Campaign not found:', contractAddress);
            return null;
        }

        // Update with current blockchain data
        const balance = await getContractBalance(contractAddress);
        const state = await getContractState(campaign.appId);

        if (state) {
            const status = getCampaignStatus(
                state.totalCollected,
                state.goalAmount,
                state.deadline
            );

            return {
                ...campaign,
                totalCollected: balance,
                contributorCount: state.contributorCount,
                status,
            };
        }

        return campaign;
    } catch (error) {
        console.error('Error fetching campaign:', error);
        return null;
    }
}

/**
 * Get campaigns by organizer address
 */
export async function getCampaignsByOrganizer(organizerAddress: string): Promise<Campaign[]> {
    const allCampaigns = await getAllCampaigns();
    return allCampaigns.filter(c => c.organizerAddress === organizerAddress);
}

/**
 * Get active campaigns only
 */
export async function getActiveCampaigns(): Promise<Campaign[]> {
    const allCampaigns = await getAllCampaigns();
    return allCampaigns.filter(c => c.status === 'active');
}

/**
 * Delete campaign metadata (admin only, for cleanup)
 */
export function deleteCampaign(contractAddress: string): void {
    campaignRegistry = campaignRegistry.filter(c => c.contractAddress !== contractAddress);
    localStorage.setItem('campaigns', JSON.stringify(campaignRegistry));
    console.log('🗑️ Campaign deleted:', contractAddress);
}

/**
 * Clear all campaigns (for testing)
 */
export function clearAllCampaigns(): void {
    campaignRegistry = [];
    localStorage.removeItem('campaigns');
    console.log('🗑️ All campaigns cleared');
}
