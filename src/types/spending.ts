/**
 * Spending Transparency Types
 * ============================
 * 
 * Type definitions for Club Spending feature.
 * All financial data is derived from blockchain, not user input.
 */

/**
 * Spending Group - Metadata container for expense tracking
 * 
 * Auto-created when campaign is deployed.
 * Links funding phase to spending phase.
 */
export interface SpendingGroup {
    id: string;
    clubName: string;
    campaignId: string;              // Links to campaign contract address
    fundingContractAddress: string;  // Smart contract that held funds
    spendingWalletAddress?: string;  // NULL until withdrawal, then populated
    memberAddresses: string[];       // View-only access list
    createdAt: number;               // Unix timestamp
}

/**
 * Spending Transaction - On-chain expense record
 * 
 * Derived from Algorand Indexer API.
 * Represents outgoing payment from spending wallet.
 */
export interface SpendingTransaction {
    txId: string;                    // Transaction hash
    amount: number;                  // Amount in ALGO (not microALGOs)
    receiver: string;                // Vendor/recipient wallet address
    memo?: string;                   // Optional purpose (decoded from note field)
    timestamp: number;               // Unix timestamp from round-time
    explorerUrl: string;             // AlgoExplorer verification link
}

/**
 * Accounting Summary - Auto-calculated financial state
 * 
 * All values computed from blockchain data.
 * No manual overrides allowed.
 */
export interface AccountingSummary {
    withdrawnAmount: number;         // Total withdrawn from contract
    totalSpent: number;              // Sum of all outgoing transactions
    remainingBalance: number;        // withdrawnAmount - totalSpent
    status: 'surplus' | 'balanced' | 'deficit';
}

/**
 * Campaign Phase - Lifecycle state indicator
 */
export type CampaignPhase = 'funding' | 'spending' | 'completed';
