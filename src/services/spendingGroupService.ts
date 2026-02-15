/**
 * Spending Group Service
 * =======================
 * 
 * Manages spending group metadata (off-chain storage).
 * Spending groups are metadata-only - they do NOT control funds.
 */

import { SpendingGroup } from '../types/spending';

const STORAGE_KEY = 'spending_groups';

/**
 * Auto-create spending group during campaign creation
 * 
 * Called automatically when a campaign is deployed.
 * Wallet address is NULL until withdrawal.
 */
export async function createSpendingGroupForCampaign(data: {
    campaignId: string;
    clubName: string;
    fundingContractAddress: string;
    organizerAddress: string;
}): Promise<SpendingGroup> {
    try {
        const group: SpendingGroup = {
            id: generateId(),
            clubName: data.clubName,
            campaignId: data.campaignId,
            fundingContractAddress: data.fundingContractAddress,
            spendingWalletAddress: undefined,  // NULL until withdrawal
            memberAddresses: [data.organizerAddress],
            createdAt: Math.floor(Date.now() / 1000),
        };

        // Save to storage
        const groups = await getSpendingGroups();
        groups.push(group);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));

        console.log('✅ Spending group auto-created for campaign:', data.campaignId);
        return group;
    } catch (error) {
        console.error('❌ Error creating spending group:', error);
        throw error;
    }
}

/**
 * Update spending wallet address after withdrawal
 * 
 * Called when organizer withdraws funds from contract.
 * This activates the spending phase.
 */
export async function updateSpendingWallet(
    campaignId: string,
    walletAddress: string
): Promise<void> {
    try {
        const groups = await getSpendingGroups();
        const group = groups.find(g => g.campaignId === campaignId);

        if (!group) {
            throw new Error(`Spending group not found for campaign: ${campaignId}`);
        }

        group.spendingWalletAddress = walletAddress;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));

        console.log('✅ Spending wallet updated:', walletAddress);
        console.log('🎯 Spending phase activated for:', group.clubName);
    } catch (error) {
        console.error('❌ Error updating spending wallet:', error);
        throw error;
    }
}

/**
 * Get all spending groups
 */
export async function getSpendingGroups(): Promise<SpendingGroup[]> {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('❌ Error loading spending groups:', error);
        return [];
    }
}

/**
 * Get spending group by campaign ID
 */
export async function getSpendingGroupByCampaign(
    campaignId: string
): Promise<SpendingGroup | null> {
    const groups = await getSpendingGroups();
    return groups.find(g => g.campaignId === campaignId) || null;
}

/**
 * Get spending group by spending wallet address
 */
export async function getSpendingGroupByWallet(
    walletAddress: string
): Promise<SpendingGroup | null> {
    const groups = await getSpendingGroups();
    return groups.find(g => g.spendingWalletAddress === walletAddress) || null;
}

/**
 * Add member to spending group (for view access)
 */
export async function addMemberToGroup(
    groupId: string,
    memberAddress: string
): Promise<void> {
    try {
        const groups = await getSpendingGroups();
        const group = groups.find(g => g.id === groupId);

        if (!group) {
            throw new Error(`Spending group not found: ${groupId}`);
        }

        if (!group.memberAddresses.includes(memberAddress)) {
            group.memberAddresses.push(memberAddress);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
            console.log('✅ Member added to group:', memberAddress);
        }
    } catch (error) {
        console.error('❌ Error adding member:', error);
        throw error;
    }
}

/**
 * Clear all spending groups (for testing)
 */
export function clearAllSpendingGroups(): void {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ All spending groups cleared');
}

/**
 * Generate unique ID
 */
function generateId(): string {
    return `sg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
