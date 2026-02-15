/**
 * Accounting Service
 * ===================
 * 
 * Pure calculation layer for automatic accounting.
 * No state, no API calls - just math from blockchain data.
 */

import { AccountingSummary } from '../types/spending';

/**
 * Calculate accounting summary from blockchain data
 * 
 * @param withdrawnAmount - Total withdrawn from smart contract
 * @param totalSpent - Sum of all outgoing transactions
 * @returns Accounting summary with status
 */
export function calculateAccountingSummary(
    withdrawnAmount: number,
    totalSpent: number
): AccountingSummary {
    const remainingBalance = withdrawnAmount - totalSpent;

    // Determine status (with 0.01 ALGO tolerance for rounding)
    let status: 'surplus' | 'balanced' | 'deficit';
    if (remainingBalance > 0.01) {
        status = 'surplus';
    } else if (remainingBalance < -0.01) {
        status = 'deficit';
    } else {
        status = 'balanced';
    }

    return {
        withdrawnAmount,
        totalSpent,
        remainingBalance,
        status,
    };
}

/**
 * Format ALGO amount for display
 */
export function formatAlgoAmount(amount: number): string {
    return amount.toFixed(2);
}

/**
 * Get status badge color
 */
export function getStatusColor(status: 'surplus' | 'balanced' | 'deficit'): string {
    switch (status) {
        case 'surplus':
            return 'green';
        case 'balanced':
            return 'gray';
        case 'deficit':
            return 'red';
    }
}

/**
 * Get status label
 */
export function getStatusLabel(status: 'surplus' | 'balanced' | 'deficit'): string {
    switch (status) {
        case 'surplus':
            return 'Surplus';
        case 'balanced':
            return 'Balanced';
        case 'deficit':
            return 'Deficit (Overspent)';
    }
}
