# Club Funding Feature

## Overview

The **Club Funding** feature is a blockchain-native crowdfunding system for campus clubs built on Algorand. Unlike traditional payment systems, this feature is fundamentally dependent on smart contracts and cannot function without blockchain technology.

## 🔑 Key Principles

### Blockchain-Native Design

1. **Funds Controlled by Smart Contracts** - Money is held in escrow contracts, not user wallets or databases
2. **Immutable Rules** - Campaign goals and deadlines are locked on-chain and cannot be changed
3. **No Admin Control** - No person or backend can approve, reject, or move funds
4. **Transparent Verification** - All transactions are publicly verifiable on AlgoExplorer
5. **Wallet-Based Identity** - No login system; wallet address is the identity

### What Makes This Different from SendPayment

| Feature | SendPayment | Club Funding |
|---------|-------------|--------------|
| **Transaction Type** | Wallet → Wallet (direct) | Wallet → Smart Contract (escrow) |
| **Rules** | None | Goal + Deadline (immutable) |
| **Outcome** | Immediate transfer | Conditional release or refund |
| **Verification** | Single transaction | Contract state + all contributions |
| **Blockchain Dependency** | Could work with any payment system | **Requires smart contracts** |

## 🏗️ Architecture

```
User Interface (React)
    ↓
Campaign Service (Off-chain metadata)
    ↓
Contract Service (Deployment & Transactions)
    ↓
Algorand Smart Contract (Escrow)
    ↓
Algorand Blockchain (Source of Truth)
    ↓
Indexer Service (Query on-chain data)
    ↓
User Interface (Display)
```

## 📁 File Structure

```
src/
├── components/
│   └── ClubFunding/
│       ├── ClubFunding.tsx          # Main container
│       ├── CampaignList.tsx         # Campaign discovery
│       ├── CreateCampaign.tsx       # Deploy new campaigns
│       └── CampaignDetail.tsx       # Campaign page with contributions
├── services/
│   ├── contractService.ts           # Smart contract interactions
│   ├── indexerService.ts            # Blockchain queries
│   └── campaignService.ts           # Off-chain metadata
├── types/
│   └── campaign.ts                  # TypeScript interfaces
└── utils/
    └── clubRegistry.ts              # Club name mapping (UX only)

contracts/
├── campaign_escrow.py               # PyTeal smart contract
├── compile_contract.py              # Compilation utility
└── README.md                        # Contract documentation
```

## 🚀 User Flows

### 1. Create Campaign

1. User clicks "Club Funding" from StudentDashboard
2. Clicks "Create Campaign"
3. Fills form:
   - Title, description, club name (off-chain)
   - Goal amount (ALGO) - **locked on blockchain**
   - Deadline (timestamp) - **locked on blockchain**
4. Wallet signs deployment transaction
5. Smart contract deployed to Algorand TestNet
6. Contract address displayed with AlgoExplorer link
7. Campaign appears in campaign list

**Blockchain Actions**:
- Deploy application with goal + deadline parameters
- Store organizer address in global state
- Initialize total_collected = 0

### 2. Contribute to Campaign

1. User views campaign detail page
2. Enters contribution amount
3. Wallet signs grouped transaction:
   - Payment to contract address
   - Application call (NoOp) to record contribution
4. Transaction confirmed on blockchain
5. Balance updates in UI (fetched from Indexer)

**Blockchain Actions**:
- Payment transaction increases contract balance
- Local state stores contributor's amount
- Global state updates total_collected

### 3. Withdraw Funds (Successful Campaign)

**Conditions**:
- Current time >= deadline
- total_collected >= goal
- Sender = organizer

**Flow**:
1. Organizer views campaign after deadline
2. Sees "Withdraw Funds" button
3. Wallet signs DeleteApplication transaction
4. Contract releases all funds to organizer
5. Application deleted from blockchain

**Blockchain Actions**:
- Inner transaction transfers funds to organizer
- Application state deleted

### 4. Claim Refund (Failed Campaign)

**Conditions**:
- Current time >= deadline
- total_collected < goal
- Sender contributed > 0

**Flow**:
1. Contributor views campaign after deadline
2. Sees "Claim Refund" button
3. Wallet signs CloseOut transaction
4. Contract refunds exact contribution amount
5. Contributor's local state cleared

**Blockchain Actions**:
- Inner transaction refunds contributor
- Local state cleared
- Global total_collected decremented

## 🔍 Blockchain Transparency

### AlgoExplorer Integration

Every campaign detail page includes:

1. **Contract Address** - Links to contract account on AlgoExplorer
2. **Organizer Address** - Links to organizer wallet
3. **Transparency Ledger** - All contributions with TX links
4. **"Verify on AlgoExplorer"** button

Users can independently verify:
- Contract balance matches UI display
- All contributions are real transactions
- Goal and deadline are in contract state
- No funds moved without transactions

### Data Sources

| Data | Source | Why |
|------|--------|-----|
| Campaign title/description | localStorage | UX only, not critical |
| Goal amount | Contract global state | **Immutable, on-chain** |
| Deadline | Contract global state | **Immutable, on-chain** |
| Total collected | Contract account balance | **Real-time, on-chain** |
| Contributions | Indexer transaction query | **Verifiable, on-chain** |
| User contribution | Contract local state | **Exact amount, on-chain** |

## 🛡️ Security Features

### Smart Contract Guarantees

✅ **No Early Withdrawal** - Organizer cannot withdraw before deadline, even if goal met

✅ **No Rule Changes** - Goal and deadline are immutable after deployment

✅ **Exact Refunds** - Contributors get back exactly what they put in

✅ **No Admin Override** - Only wallet signatures can trigger fund movements

✅ **Automatic Enforcement** - Contract logic enforces all rules, no human intervention

### Anti-Patterns Prevented

❌ **No Backend Approval** - No API endpoint can approve/reject campaigns

❌ **No Centralized Balance** - Balance is always fetched from blockchain

❌ **No Editable Rules** - UI cannot modify goal or deadline

❌ **No Login System** - Wallet address is the only identity

## 🧪 Testing Guide

### Local Testing

1. **Connect Wallet** - Use Pera/Defly on TestNet
2. **Get Test ALGO** - Use [TestNet Dispenser](https://bank.testnet.algorand.network/)
3. **Create Campaign**:
   - Goal: 5 ALGO
   - Deadline: 1 hour from now
4. **Contribute** - From different wallet
5. **Verify on AlgoExplorer**:
   - Check contract balance
   - View contribution transactions
   - Inspect contract state
6. **Test Withdrawal** (after deadline, goal met)
7. **Test Refund** (after deadline, goal not met)

### Verification Checklist

- [ ] Campaign deployed to TestNet
- [ ] Contract address visible in UI
- [ ] AlgoExplorer shows contract account
- [ ] Contributions appear in contract balance
- [ ] Indexer returns correct transaction list
- [ ] Withdrawal only works for organizer after deadline
- [ ] Refund only works for contributors if goal not met
- [ ] All transactions verifiable on AlgoExplorer

## 🎓 Judge-Ready Demo Flow

**5-Minute Demonstration**:

1. **Show Dashboard** (0:30)
   - Point out "Club Funding" card
   - Explain blockchain-native design

2. **Create Campaign** (1:30)
   - Fill form with 5 ALGO goal, 1-hour deadline
   - Show deployment transaction
   - **Highlight**: "Rules are locked on blockchain"
   - Show contract address on AlgoExplorer

3. **Contribute** (1:30)
   - Switch to different wallet
   - Contribute 2 ALGO
   - Show transaction on AlgoExplorer
   - Show transparency ledger

4. **Verify Blockchain** (1:00)
   - Open AlgoExplorer in new tab
   - Show contract balance = 2 ALGO
   - Show contribution transaction
   - Show contract state (goal, deadline)

5. **Explain Smart Contract Logic** (0:30)
   - If goal met → organizer withdraws
   - If goal not met → contributors refund
   - No admin can intervene

**Key Talking Points**:
- "This is NOT just a payment app with blockchain branding"
- "Funds are held in smart contracts, not wallets"
- "Rules are immutable - I can't change them even if I wanted to"
- "Everything is verifiable on the public blockchain"
- "Without smart contracts, this feature completely breaks"

## 🔧 Technical Details

### Smart Contract

- **Language**: PyTeal (compiles to TEAL)
- **Type**: Stateful application
- **Global State**: 4 uints, 1 bytes (goal, deadline, total, count, organizer)
- **Local State**: 1 uint per user (contribution amount)
- **Minimum Balance**: ~0.1 ALGO per contract

### Transaction Costs

- **Deploy Contract**: 0.001 ALGO (tx fee) + 0.1 ALGO (min balance)
- **Contribute**: 0.001 ALGO (tx fee)
- **Withdraw**: 0.001 ALGO (tx fee)
- **Refund**: 0.001 ALGO (tx fee)

### API Endpoints Used

- **Algod**: Contract deployment, transaction submission
- **Indexer**: Transaction queries, account lookups, application state

## 📚 Resources

- [Algorand Developer Docs](https://developer.algorand.org/)
- [PyTeal Documentation](https://pyteal.readthedocs.io/)
- [AlgoExplorer TestNet](https://testnet.algoexplorer.io/)
- [TestNet Dispenser](https://bank.testnet.algorand.network/)

## 🚨 Important Notes

⚠️ **Campaign rules are immutable** - Double-check goal and deadline before deploying

⚠️ **TestNet only** - This is for demonstration; use MainNet for production

⚠️ **Manual refunds** - Contributors must claim refunds themselves if campaign fails

⚠️ **Wallet required** - No login system; wallet connection is mandatory

## 🎯 Success Criteria

✅ **Blockchain-Native**: Feature cannot function without smart contracts

✅ **Transparent**: All transactions verifiable on AlgoExplorer

✅ **Immutable**: Rules locked on-chain, no admin control

✅ **User-Friendly**: Clear UI showing blockchain interactions

✅ **Judge-Ready**: 5-minute demo proves blockchain dependency
