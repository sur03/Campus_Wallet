/**
 * Split Expense Utilities
 * ======================
 * 
 * Blockchain verification logic for split expenses.
 * Handles transaction notes, payment verification, and Algorand Indexer queries.
 */

import algosdk from 'algosdk';

/**
 * Generate a unique expense ID
 */
export function generateExpenseId(): string {
  return `SPLIT#${Date.now()}`;
}

/**
 * Create a transaction note for split payment
 * Format: SPLIT#timestamp|Title|CreatorWallet
 */
export function createSplitNote(
  expenseId: string, 
  title: string, 
  creatorWallet: string
): Uint8Array {
  const noteText = `${expenseId}|${title}|${creatorWallet}`;
  return new TextEncoder().encode(noteText);
}

/**
 * Parse a transaction note to extract split information
 */
export function parseSplitNote(noteBase64: string): {
  expenseId: string;
  title: string;
  creatorWallet?: string;
} | null {
  try {
    const noteBytes = Uint8Array.from(atob(noteBase64), c => c.charCodeAt(0));
    const noteText = new TextDecoder().decode(noteBytes);
    const parts = noteText.split('|');
    
    if (parts.length >= 2 && parts[0].startsWith('SPLIT#')) {
      return {
        expenseId: parts[0],
        title: parts[1],
        creatorWallet: parts[2] || undefined,
      };
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Validate Algorand address format
 */
export function isValidAlgorandAddress(address: string): boolean {
  if (address.length !== 58) return false;
  try {
    algosdk.decodeAddress(address);
    return true;
  } catch {
    return false;
  }
}
/**
 * Verify if a transaction is a valid split payment
 */
export function verifyTransactionForSplit(
  transaction: any,
  expenseId: string,
  participantAddress: string,
  creatorAddress: string,
  shareAmount: number
): boolean {
  // Check transaction type
  if (transaction['tx-type'] !== 'pay') return false;
  
  // Check sender matches participant
  if (transaction.sender !== participantAddress) return false;
  
  // Check receiver matches creator
  const receiver = transaction['payment-transaction']?.receiver;
  if (receiver !== creatorAddress) return false;
  
  // Check amount matches share (in microAlgos)
  const amount = transaction['payment-transaction']?.amount || 0;
  const expectedAmount = Math.round(shareAmount * 1_000_000);
  if (amount !== expectedAmount) return false;
  
  // Check note contains expense ID
  if (!transaction.note) return false;
  
  const parsedNote = parseSplitNote(transaction.note);
  if (!parsedNote || parsedNote.expenseId !== expenseId) return false;
  
  return true;
}

/**
 * Fetch and verify participant payments from Algorand Indexer
 */
export async function fetchParticipantPayments(
  creatorAddress: string,
  expenseId: string,
  participants: string[],
  shareAmount: number
): Promise<Map<string, { txId: string; timestamp: number }>> {
  const payments = new Map();
  
  try {
    const url = `https://testnet-idx.algonode.cloud/v2/transactions?address=${creatorAddress}&limit=200`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Indexer request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.transactions) return payments;
    
    for (const txn of data.transactions) {
      const sender = txn.sender;
      
      // Skip if sender is not a participant
      if (!participants.includes(sender)) continue;
      
      // Verify this is a valid split payment
      if (verifyTransactionForSplit(txn, expenseId, sender, creatorAddress, shareAmount)) {
        // Only record the first valid payment from each participant
        if (!payments.has(sender)) {
          payments.set(sender, {
            txId: txn.id,
            timestamp: txn['round-time'] || 0,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error fetching payments from Algorand Indexer:', error);
  }
  
  return payments;
}

/**
 * Get AlgoExplorer URL for a transaction
 */
export function getExplorerUrl(txId: string, network: 'testnet' | 'mainnet' = 'testnet'): string {
  const baseUrl = network === 'testnet' 
    ? 'https://testnet.algoexplorer.io' 
    : 'https://algoexplorer.io';
  return `${baseUrl}/tx/${txId}`;
}

/**
 * Get AlgoExplorer URL for an address
 */
export function getAddressExplorerUrl(address: string, network: 'testnet' | 'mainnet' = 'testnet'): string {
  const baseUrl = network === 'testnet' 
    ? 'https://testnet.algoexplorer.io' 
    : 'https://algoexplorer.io';
  return `${baseUrl}/address/${address}`;
}

/**
 * Format address for display (truncated)
 */
export function formatAddress(address: string, startChars: number = 8, endChars: number = 6): string {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}