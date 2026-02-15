/**
 * Split Storage Utilities
 * ========================
 * 
 * LocalStorage-based persistence for split expense metadata.
 * Uses a GLOBAL shared storage so all users can see all splits.
 * This enables cross-user visibility: when User A creates a split with User B,
 * User B can see it in their "Participating" section.
 * 
 * Note: This works within the same browser/device. For true multi-device sync,
 * consider implementing a backend service (Firebase, Supabase, etc.)
 * 
 * Blockchain verification queries are separate (see splitUtils.ts).
 */

import { Split } from '../types/split';

// Global shared key - all splits visible to all users
const SPLITS_KEY = 'global_blockchain_splits';

/**
 * Save a new split to localStorage
 */
export function saveSplit(split: Split): void {
    const splits = getAllSplits();
    splits.push(split);
    localStorage.setItem(SPLITS_KEY, JSON.stringify(splits));
}

/**
 * Get a split by its expense ID
 */
export function getSplitById(expenseId: string): Split | null {
    const splits = getAllSplits();
    return splits.find(s => s.expenseId === expenseId) || null;
}

/**
 * Get all splits created by a specific address
 */
export function getSplitsByCreator(creatorAddress: string): Split[] {
    const splits = getAllSplits();
    return splits.filter(s => s.createdBy === creatorAddress);
}

/**
 * Get all splits where an address is a participant
 */
export function getSplitsByParticipant(participantAddress: string): Split[] {
    const splits = getAllSplits();
    return splits.filter(s => s.participants.includes(participantAddress));
}

/**
 * Get all splits from localStorage
 */
export function getAllSplits(): Split[] {
    try {
        const data = localStorage.getItem(SPLITS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading splits from localStorage:', error);
        return [];
    }
}

/**
 * Delete a split by expense ID (optional utility)
 */
export function deleteSplit(expenseId: string): boolean {
    const splits = getAllSplits();
    const filtered = splits.filter(s => s.expenseId !== expenseId);

    if (filtered.length === splits.length) {
        return false; // Split not found
    }

    localStorage.setItem(SPLITS_KEY, JSON.stringify(filtered));
    return true;
}

/**
 * Clear all splits (for testing/debugging)
 */
export function clearAllSplits(): void {
    localStorage.removeItem(SPLITS_KEY);
}
