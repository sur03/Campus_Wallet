/**
 * Campaign Type Definitions
 * =========================
 * 
 * TypeScript interfaces for Club Funding feature.
 */

export interface Campaign {
  // On-chain identifiers
  contractAddress: string;
  appId: number;
  deploymentTxId: string;
  
  // Campaign metadata (off-chain)
  title: string;
  description: string;
  clubName: string;
  organizerAddress: string;
  
  // Contract parameters (on-chain)
  goalAmount: number; // ALGO
  deadline: number; // Unix timestamp
  
  // Current state (from blockchain)
  totalCollected: number; // ALGO
  contributorCount: number;
  status: CampaignStatus;
  
  // Timestamps
  createdAt: number;
}

export type CampaignStatus = 'active' | 'successful' | 'failed' | 'pending';

export interface Contribution {
  txId: string;
  contributorAddress: string;
  amount: number; // ALGO
  timestamp: number;
  note?: string;
}

export interface ContractState {
  organizerAddress: string;
  goalAmount: number; // microALGOs
  deadline: number; // Unix timestamp
  totalCollected: number; // microALGOs
  contributorCount: number;
}

export interface UserContribution {
  campaignAddress: string;
  amount: number; // ALGO
  canRefund: boolean;
}

export interface DeploymentResult {
  contractAddress: string;
  appId: number;
  txId: string;
}

export interface TransactionResult {
  txId: string;
  confirmedRound?: number;
}

export interface CampaignFormData {
  title: string;
  description: string;
  clubName: string;
  goalAmount: number; // ALGO
  deadline: Date;
}
