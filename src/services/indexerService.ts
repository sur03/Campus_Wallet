/**
 * Indexer Service
 * ================
 * 
 * Query Algorand Indexer for on-chain campaign data.
 * This is the SOURCE OF TRUTH for all campaign state.
 */

import algosdk from 'algosdk';
import { getIndexerConfig } from '../utils/algorand';
import { ContractState, Contribution } from '../types/campaign';

/**
 * Get Algorand Indexer client
 */
function getIndexerClient(): algosdk.Indexer {
    const config = getIndexerConfig();
    return new algosdk.Indexer(
        config.token || '',
        config.server,
        config.port || ''
    );
}

/**
 * Get contract account balance (total collected)
 */
export async function getContractBalance(contractAddress: string): Promise<number> {
    try {
        const indexer = getIndexerClient();
        const accountInfo = await indexer.lookupAccountByID(contractAddress).do();

        // Convert microALGOs to ALGO
        const balance = accountInfo.account.amount / 1_000_000;

        console.log(`📊 Contract ${contractAddress} balance: ${balance} ALGO`);
        return balance;
    } catch (error: any) {
        // 404 is expected for newly created contracts that haven't been indexed yet
        if (error.status === 404 || error.message?.includes('no accounts found')) {
            console.log(`ℹ️ Contract ${contractAddress} not yet indexed (this is normal for new contracts)`);
            return 0;
        }

        console.error('Error fetching contract balance:', error);
        return 0;
    }
}

/**
 * Get all payment transactions to/from contract address
 */
export async function getContractTransactions(
    contractAddress: string,
    limit: number = 100
): Promise<Contribution[]> {
    try {
        const indexer = getIndexerClient();

        // Query transactions involving this address
        const response = await indexer
            .searchForTransactions()
            .address(contractAddress)
            .txType('pay')
            .limit(limit)
            .do();

        const contributions: Contribution[] = [];

        if (response.transactions && Array.isArray(response.transactions)) {
            for (const txn of response.transactions) {
                // Only count payments TO the contract (contributions)
                if (txn['payment-transaction']?.receiver === contractAddress) {
                    const sender = txn.sender;
                    const amount = (txn['payment-transaction']?.amount || 0) / 1_000_000;
                    const timestamp = txn['round-time'] || 0;

                    // Decode note if present
                    let note: string | undefined;
                    if (txn.note) {
                        try {
                            const noteBytes = Uint8Array.from(atob(txn.note), c => c.charCodeAt(0));
                            note = new TextDecoder().decode(noteBytes);
                        } catch (e) {
                            // Ignore decode errors
                        }
                    }

                    contributions.push({
                        txId: txn.id,
                        contributorAddress: sender,
                        amount,
                        timestamp,
                        note,
                    });
                }
            }
        }

        console.log(`📜 Found ${contributions.length} contributions for ${contractAddress}`);
        return contributions;
    } catch (error) {
        console.error('Error fetching contract transactions:', error);
        return [];
    }
}

/**
 * Get contract application state (goal, deadline, etc.)
 * 
 * Note: This reads the global state of the application.
 */
export async function getContractState(appId: number): Promise<ContractState | null> {
    try {
        const indexer = getIndexerClient();
        const appInfo = await indexer.lookupApplications(appId).do();

        if (!appInfo.application) {
            console.error('Application not found:', appId);
            return null;
        }

        const globalState = appInfo.application.params['global-state'] || [];

        // Parse global state
        const state: Partial<ContractState> = {};

        for (const item of globalState) {
            const key = Buffer.from(item.key, 'base64').toString('utf-8');
            const value = item.value;

            switch (key) {
                case 'organizer':
                    state.organizerAddress = algosdk.encodeAddress(
                        Buffer.from(value.bytes, 'base64')
                    );
                    break;
                case 'goal':
                    state.goalAmount = value.uint;
                    break;
                case 'deadline':
                    state.deadline = value.uint;
                    break;
                case 'total':
                    state.totalCollected = value.uint;
                    break;
                case 'count':
                    state.contributorCount = value.uint;
                    break;
            }
        }

        console.log('📋 Contract state:', state);

        return state as ContractState;
    } catch (error) {
        console.error('Error fetching contract state:', error);
        return null;
    }
}

/**
 * Get user's contribution to a specific campaign
 */
export async function getUserContribution(
    appId: number,
    userAddress: string
): Promise<number> {
    try {
        const indexer = getIndexerClient();
        const accountInfo = await indexer
            .lookupAccountAppLocalStates(userAddress)
            .applicationID(appId)
            .do();

        if (!accountInfo['apps-local-states'] || accountInfo['apps-local-states'].length === 0) {
            return 0;
        }

        const localState = accountInfo['apps-local-states'][0]['key-value'] || [];

        for (const item of localState) {
            const key = Buffer.from(item.key, 'base64').toString('utf-8');
            if (key === 'contribution') {
                const amount = item.value.uint / 1_000_000; // Convert to ALGO
                console.log(`💰 User ${userAddress} contributed ${amount} ALGO`);
                return amount;
            }
        }

        return 0;
    } catch (error) {
        console.error('Error fetching user contribution:', error);
        return 0;
    }
}

/**
 * Check if campaign deadline has passed
 */
export function isDeadlinePassed(deadline: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    return now >= deadline;
}

/**
 * Check if campaign goal was met
 */
export function isGoalMet(totalCollected: number, goal: number): boolean {
    return totalCollected >= goal;
}

/**
 * Determine campaign status
 */
export function getCampaignStatus(
    totalCollected: number,
    goal: number,
    deadline: number
): 'active' | 'successful' | 'failed' {
    const deadlinePassed = isDeadlinePassed(deadline);

    if (!deadlinePassed) {
        return 'active';
    }

    return isGoalMet(totalCollected, goal) ? 'successful' : 'failed';
}
