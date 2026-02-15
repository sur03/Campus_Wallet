/**
 * Split Expense Types
 * ====================
 * 
 * Type definitions for Split Expense feature.
 * Blockchain-verified payment tracking for expense splits.
 */

/**
 * Split - Expense split metadata
 * 
 * Stored in localStorage, contains split configuration.
 * Payment verification happens via blockchain queries.
 */
export interface Split {
    expenseId: string;           // Unique identifier (e.g., SPLIT#1234567890)
    title: string;               // Expense description
    totalAmount: number;         // Total expense amount in ALGO
    sharePerPerson: number;      // Amount each person owes in ALGO
    createdBy: string;           // Creator's wallet address
    participants: string[];      // Array of participant wallet addresses
    createdAt: number;           // Creation timestamp (Unix time)
}

/**
 * ParticipantStatus - Payment status for a participant
 * 
 * Derived from blockchain verification, not stored.
 */
export interface ParticipantStatus {
    address: string;             // Participant wallet address
    paid: boolean;               // Payment verified on blockchain
    transactionId?: string;      // Transaction hash if paid
    paidAt?: number;             // Payment timestamp if paid
}

/**
 * PaymentInfo - Transaction details from blockchain
 * 
 * Returned by payment verification utilities.
 */
export interface PaymentInfo {
    txId: string;                // Transaction hash
    amount: number;              // Payment amount in ALGO
    timestamp: number;           // Transaction timestamp
}
