# Split Expense Feature - Universal Implementation Guide

## Overview
This guide provides a complete implementation blueprint for a blockchain-based Split Expense feature that can be adapted to any UI framework (React, Vue, Angular, etc.). The system allows users to create expense splits, track payments via blockchain transactions, and automatically verify payments without manual intervention.

## Core Concept & Logic

### What is Split Expense?
Split Expense is a feature that allows a user (creator/owner) to:
1. Create an expense that needs to be split among multiple participants
2. Calculate each person's share automatically
3. Generate payment requests with specific amounts
4. Track payments via blockchain transactions
5. Automatically verify payments using transaction notes and amounts

### Key Business Rules
1. **Owner Inclusion**: The expense creator is ALWAYS included in the split calculation (+1 to participant count)
2. **Equal Split**: Total amount is divided equally among all people (owner + participants)
3. **Blockchain Verification**: Payments are verified by checking blockchain transactions, not manual flags
4. **Auto-Detection**: System automatically detects payments every 15 seconds
5. **Exact Matching**: Payment amounts must match exactly (in microAlgos for Algorand)

## Technical Architecture

### 1. Data Storage Layer

#### Split Metadata Storage (localStorage/database)
```typescript
interface Split {
  expenseId: string;           // Unique identifier (timestamp-based)
  title: string;               // Expense description
  totalAmount: number;         // Total expense amount
  sharePerPerson: number;      // Amount each person owes
  createdBy: string;           // Creator's wallet address
  participants: string[];      // Array of participant wallet addresses
  createdAt: number;           // Creation timestamp
}
```

#### Storage Functions Required
```typescript
// Save a new split
function saveSplit(split: Split): void

// Get split by ID
function getSplitById(expenseId: string): Split | null

// Get splits created by user
function getSplitsByCreator(creatorAddress: string): Split[]

// Get splits where user is participant
function getSplitsByParticipant(participantAddress: string): Split[]
```

### 2. Blockchain Integration Layer

#### Transaction Note Format
```
SPLIT#{timestamp}|{title}|{creatorWallet}
```

Example: `SPLIT#1703123456789|Dinner at Restaurant|ABCD...XYZ`

#### Payment Verification Logic
```typescript
async function fetchParticipantPayments(
  creatorAddress: string,
  expenseId: string,
  participants: string[],
  expectedAmount: number
): Promise<Map<string, PaymentInfo>>
```

**Verification Steps:**
1. Query blockchain indexer for transactions TO the creator's address
2. Filter transactions by participants (FROM addresses)
3. Parse transaction notes to match split format
4. Verify expense ID matches
5. Verify amount matches exactly (convert to microAlgos)
6. Return map of participant → payment info

### 3. UI Components Architecture

#### Component Structure
```
SplitExpense/
├── CreateSplit.tsx/vue/component     # Create new split
├── SplitList.tsx/vue/component       # List all splits
└── SplitDetail.tsx/vue/component     # View split details & payments
```

#### Navigation Flow
```
Dashboard → SplitList → CreateSplit
                    ↓
                SplitDetail
```

## Implementation Steps

### Step 1: Create Data Storage Layer

#### For React/TypeScript:
```typescript
// utils/localStorageDB.ts
const SPLITS_KEY = 'blockchain_splits';

export function saveSplit(split: Split): void {
  const splits = getAllSplits();
  splits.push(split);
  localStorage.setItem(SPLITS_KEY, JSON.stringify(splits));
}

export function getSplitById(expenseId: string): Split | null {
  const splits = getAllSplits();
  return splits.find(s => s.expenseId === expenseId) || null;
}

function getAllSplits(): Split[] {
  const data = localStorage.getItem(SPLITS_KEY);
  return data ? JSON.parse(data) : [];
}
```

#### For Vue/JavaScript:
```javascript
// utils/splitStorage.js
const SPLITS_KEY = 'blockchain_splits';

export const splitStorage = {
  saveSplit(split) {
    const splits = this.getAllSplits();
    splits.push(split);
    localStorage.setItem(SPLITS_KEY, JSON.stringify(splits));
  },
  
  getSplitById(expenseId) {
    const splits = this.getAllSplits();
    return splits.find(s => s.expenseId === expenseId) || null;
  },
  
  getAllSplits() {
    const data = localStorage.getItem(SPLITS_KEY);
    return data ? JSON.parse(data) : [];
  }
};
```

### Step 2: Create Blockchain Utilities

#### Transaction Note Utilities
```typescript
// utils/splitUtils.ts
export function createSplitNote(expenseId: string, title: string, creatorWallet: string): string {
  return `SPLIT#${expenseId}|${title}|${creatorWallet}`;
}

export function parseSplitNote(note: string): {
  expenseId: string;
  title: string;
  creatorWallet: string;
} | null {
  const match = note.match(/^SPLIT#(\d+)\|(.+)\|(.+)$/);
  if (!match) return null;
  
  return {
    expenseId: match[1],
    title: match[2],
    creatorWallet: match[3]
  };
}

export function generateExpenseId(): string {
  return Date.now().toString();
}
```

#### Payment Verification (Algorand Example)
```typescript
export async function fetchParticipantPayments(
  creatorAddress: string,
  expenseId: string,
  participants: string[],
  expectedAmount: number
): Promise<Map<string, PaymentInfo>> {
  const payments = new Map();
  const expectedMicroAlgos = Math.round(expectedAmount * 1_000_000);
  
  try {
    // Query Algorand Indexer
    const url = `https://testnet-idx.algonode.cloud/v2/transactions?address=${creatorAddress}&tx-type=pay&limit=200`;
    const response = await fetch(url);
    const data = await response.json();
    
    for (const txn of data.transactions || []) {
      const sender = txn.sender;
      const amount = txn['payment-transaction']?.amount || 0;
      const note = txn.note ? atob(txn.note) : '';
      
      // Check if sender is a participant
      if (!participants.includes(sender)) continue;
      
      // Check if amount matches exactly
      if (amount !== expectedMicroAlgos) continue;
      
      // Parse and verify note
      const noteData = parseSplitNote(note);
      if (!noteData || noteData.expenseId !== expenseId) continue;
      
      // Valid payment found
      payments.set(sender, {
        txId: txn.id,
        amount: amount / 1_000_000,
        timestamp: txn['round-time'] || 0
      });
    }
  } catch (error) {
    console.error('Error fetching payments:', error);
  }
  
  return payments;
}
```

### Step 3: Create Split Components

#### CreateSplit Component Logic
```typescript
// Key validation rules:
const validateForm = () => {
  // 1. Title is required
  if (!title.trim()) return "Title is required";
  
  // 2. Amount must be positive
  if (totalAmount <= 0) return "Amount must be greater than 0";
  
  // 3. At least one participant
  if (validParticipants.length === 0) return "Add at least one participant";
  
  // 4. No duplicate addresses
  const unique = new Set(validParticipants);
  if (unique.size !== validParticipants.length) return "Duplicate addresses found";
  
  // 5. Creator cannot be participant
  if (validParticipants.includes(creatorAddress)) return "Cannot add yourself";
  
  // 6. Valid Algorand addresses (58 characters)
  for (const addr of validParticipants) {
    if (addr.length !== 58) return "Invalid address length";
  }
  
  return null;
};

// Calculate split (IMPORTANT: +1 for owner)
const calculateSplit = () => {
  const totalPeople = validParticipants.length + 1; // +1 for owner
  const sharePerPerson = totalAmount / totalPeople;
  return { totalPeople, sharePerPerson };
};
```

#### SplitDetail Component Logic
```typescript
// Auto-refresh payment status every 15 seconds
useEffect(() => {
  if (!splitData) return;
  
  const interval = setInterval(() => {
    fetchPaymentStatus(splitData);
  }, 15000);
  
  return () => clearInterval(interval);
}, [splitData]);

// Payment status fetching
const fetchPaymentStatus = async (split: Split) => {
  const payments = await fetchParticipantPayments(
    split.createdBy,
    split.expenseId,
    split.participants,
    split.sharePerPerson
  );
  
  const statuses = split.participants.map(addr => ({
    address: addr,
    paid: payments.has(addr),
    transactionId: payments.get(addr)?.txId,
    paidAt: payments.get(addr)?.timestamp
  }));
  
  setParticipantStatuses(statuses);
};
```

## UI Implementation Guidelines

### CreateSplit UI Requirements
1. **Title Input**: Text field for expense description
2. **Amount Input**: Number field with decimal support
3. **Participant List**: Dynamic list with add/remove functionality
4. **Address Validation**: Real-time validation with error messages
5. **Split Preview**: Show calculation before creation
6. **Duplicate Detection**: Warn about duplicate addresses
7. **Submit Button**: Create split and navigate to detail view

### SplitList UI Requirements
1. **Filter Tabs**: All, Created by Me, Participating
2. **Split Cards**: Show title, amount, participant count, creation date
3. **Status Indicators**: Creator vs Participant badges
4. **Search/Sort**: Optional filtering capabilities
5. **Empty States**: Handle no splits scenario
6. **Navigation**: Click to view split details

### SplitDetail UI Requirements
1. **Split Summary**: Title, total amount, per-person amount
2. **Participant List**: Show all participants with payment status
3. **Payment Status**: Paid/Pending with visual indicators
4. **Transaction Links**: Link to blockchain explorer
5. **Auto-Refresh**: Visual indicator of refresh status
6. **Payment Instructions**: How to pay with exact amount and note
7. **QR Code**: Optional QR code for payment details

## Payment Flow for Users

### For Participants (Payers):
1. Receive split details from creator
2. See exact amount to pay: `{sharePerPerson} ALGO`
3. See payment note format: `SPLIT#{expenseId}|{title}|{creatorWallet}`
4. Send payment to creator's wallet with exact amount and note
5. Payment automatically detected within 15 seconds

### For Creator (Receiver):
1. Create split with title and participant addresses
2. Share split details with participants
3. Monitor payment status in real-time
4. See automatic updates as payments are received
5. View transaction proofs on blockchain explorer

## Error Handling & Edge Cases

### Validation Errors
- Invalid wallet addresses (not 58 characters for Algorand)
- Duplicate participant addresses
- Creator adding themselves as participant
- Empty title or zero amount
- Network connectivity issues

### Payment Verification Issues
- Incorrect payment amount (even 1 microAlgo difference)
- Missing or malformed transaction note
- Payment to wrong address
- Network delays in transaction indexing

### UI Error States
- Loading states during blockchain queries
- Network error messages
- Empty states for no splits/payments
- Validation error messages with clear instructions

## Blockchain Network Considerations

### Algorand Specific
- Use microAlgos for exact amount matching
- Transaction notes are base64 encoded
- Indexer API for transaction queries
- TestNet vs MainNet endpoints

### Ethereum/Other Networks
- Use Wei for exact amount matching
- Transaction data field for notes
- Etherscan/block explorer APIs
- Gas fee considerations

## Security Considerations

1. **Address Validation**: Always validate wallet addresses
2. **Amount Precision**: Use exact amount matching to prevent fraud
3. **Note Verification**: Verify transaction notes match expected format
4. **Creator Verification**: Ensure payments go to correct creator address
5. **Replay Protection**: Use unique expense IDs to prevent reuse

## Testing Scenarios

### Unit Tests
- Split calculation logic (+1 for owner)
- Address validation functions
- Transaction note parsing
- Payment verification logic

### Integration Tests
- Create split end-to-end flow
- Payment detection and verification
- Auto-refresh functionality
- Error handling scenarios

### User Acceptance Tests
- Complete split creation and payment flow
- Multiple participants paying simultaneously
- Edge cases (wrong amounts, missing notes)
- UI responsiveness and error states

## Deployment Checklist

1. **Environment Configuration**
   - Blockchain network endpoints (TestNet/MainNet)
   - Indexer API URLs
   - Error tracking setup

2. **Data Migration**
   - localStorage schema versioning
   - Backup/restore functionality
   - Data cleanup procedures

3. **Performance Optimization**
   - Caching strategies for blockchain queries
   - Debounced auto-refresh
   - Lazy loading for large split lists

4. **Monitoring & Analytics**
   - Split creation metrics
   - Payment success rates
   - Error tracking and alerting

## Example Implementation Prompt for Different UI

When implementing this in a different project, use this prompt:

---

**SPLIT EXPENSE FEATURE IMPLEMENTATION REQUEST**

Please implement a blockchain-based Split Expense feature with the following requirements:

**Core Functionality:**
1. Create expense splits with automatic equal division (creator + participants)
2. Track payments via blockchain transaction verification
3. Auto-detect payments every 15 seconds using transaction notes
4. No manual payment confirmation - fully automated via blockchain

**Technical Requirements:**
- Split calculation: `totalAmount / (participants.length + 1)` (owner always included)
- Transaction note format: `SPLIT#{timestamp}|{title}|{creatorWallet}`
- Exact amount matching in blockchain's smallest unit (microAlgos/Wei)
- localStorage for split metadata storage
- Blockchain indexer integration for payment verification

**Components Needed:**
1. CreateSplit: Form with title, amount, participant addresses, validation
2. SplitList: Display all splits with filters (created/participating)
3. SplitDetail: Show split info, payment status, auto-refresh

**Key Features:**
- Real-time duplicate address detection
- Wallet address validation (58 chars for Algorand)
- Payment status indicators (paid/pending)
- Blockchain explorer links
- Auto-refresh every 15 seconds
- Split calculation preview

**Data Structure:**
```typescript
interface Split {
  expenseId: string;      // timestamp-based ID
  title: string;          // expense description
  totalAmount: number;    // total expense
  sharePerPerson: number; // calculated share
  createdBy: string;      // creator wallet
  participants: string[]; // participant wallets
  createdAt: number;      // creation time
}
```

Please implement this feature following the exact logic described above, adapting the UI components to match your existing design system while maintaining all the core functionality and business rules.

---

This implementation guide provides everything needed to recreate the Split Expense feature in any UI framework while maintaining the exact same logic and functionality.