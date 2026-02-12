# Campaign Escrow Smart Contracts

This directory contains the PyTeal smart contracts for the Club Funding feature.

## Files

- **campaign_escrow.py** - Main escrow contract logic (PyTeal)
- **compile_contract.py** - Compilation utility
- **campaign_escrow_approval.teal** - Compiled approval program (generated)
- **campaign_escrow_clear.teal** - Compiled clear state program (generated)

## Setup

### Install PyTeal

```bash
pip install pyteal
```

### Compile Contracts

```bash
cd contracts
python compile_contract.py
```

This generates:
- `campaign_escrow_approval.teal`
- `campaign_escrow_clear.teal`

## Contract Logic

### Deployment Parameters

When deploying a new campaign, you must provide:

1. **organizer_address** (bytes) - Campaign creator's wallet
2. **goal_amount** (uint64) - Target amount in microALGOs
3. **deadline** (uint64) - Unix timestamp

### Transaction Flows

#### 1. Contribute (Before Deadline)

```
User → Payment Transaction → Contract Address
User → ApplicationCall (NoOp) → Contract
```

**Requirements**:
- Current time < deadline
- Payment amount > 0
- Payment receiver = contract address

**Effects**:
- Updates contributor's local state
- Updates global total_collected
- Increments contributor_count (if first contribution)

#### 2. Withdraw (After Deadline, Goal Met)

```
Organizer → ApplicationCall (DeleteApplication) → Contract
Contract → Payment Transaction → Organizer
```

**Requirements**:
- Current time >= deadline
- total_collected >= goal_amount
- Sender = organizer_address

**Effects**:
- Transfers all funds to organizer
- Deletes application

#### 3. Refund (After Deadline, Goal Not Met)

```
Contributor → ApplicationCall (CloseOut) → Contract
Contract → Payment Transaction → Contributor
```

**Requirements**:
- Current time >= deadline
- total_collected < goal_amount
- Sender has contribution > 0

**Effects**:
- Transfers contributor's exact amount back
- Clears contributor's local state
- Updates global total_collected

## State Schema

### Global State (5 keys)

| Key | Type | Description |
|-----|------|-------------|
| organizer | bytes | Campaign creator address |
| goal | uint64 | Target amount (microALGOs) |
| deadline | uint64 | Unix timestamp |
| total | uint64 | Total collected (microALGOs) |
| count | uint64 | Number of contributors |

### Local State (1 key per user)

| Key | Type | Description |
|-----|------|-------------|
| contribution | uint64 | User's total contribution (microALGOs) |

## Security Features

✅ **Immutable Rules**: Goal and deadline cannot be changed after deployment

✅ **No Admin Override**: Only wallet signatures can move funds

✅ **Automatic Enforcement**: Contract logic enforces all rules on-chain

✅ **Transparent State**: All state is publicly readable via Indexer

✅ **Exact Refunds**: Contributors get back exactly what they put in

## Testing

### Local Testing (Algorand Sandbox)

```bash
# Start sandbox
./sandbox up testnet

# Deploy contract
# (Use contractService.ts from frontend)

# Test contribution
# Test withdrawal
# Test refund
```

### TestNet Deployment

Use the frontend `contractService.ts` to deploy to TestNet.

All transactions are verifiable on [AlgoExplorer](https://testnet.algoexplorer.io/).

## Cost Estimates

- **Contract Deployment**: ~0.1 ALGO (minimum balance)
- **Transaction Fee**: 0.001 ALGO per transaction
- **Opt-In**: 0.1 ALGO per contributor (minimum balance)

## Important Notes

⚠️ **Campaign rules are immutable once deployed**

⚠️ **Failed campaigns require manual refund claims**

⚠️ **Contract must have sufficient balance for inner transactions**

⚠️ **Always verify contract address before contributing**
