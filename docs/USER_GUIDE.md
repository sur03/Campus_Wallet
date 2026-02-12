# Club Funding - User Guide

## 🎯 Complete User Flow

### For Campaign Organizers (Creating Campaigns)

#### Step 1: Navigate to Club Funding
1. Open the Student Dashboard
2. Click the **"Club Funding"** card (teal/blue gradient with wallet icon)
3. You'll see the Club Funding home page

#### Step 2: Create a Campaign
1. Click **"Create Campaign"** button (top right)
2. Fill in the form:
   - **Campaign Title**: e.g., "Annual Tech Fest 2026"
   - **Club Name**: e.g., "Computer Science Club"
   - **Description**: Explain what the funds will be used for
   - **Goal Amount**: Enter amount in ALGO (minimum 0.1 ALGO)
   - **Deadline**: Click the date/time picker
     - **To change date**: Click the calendar icon and select date
     - **To change time**: Click the time field and type or use arrows
     - Format: YYYY-MM-DD HH:MM (24-hour format)
     - Example: 2026-02-15 18:00 (Feb 15, 2026 at 6:00 PM)
3. Review the warning: **Rules are immutable once deployed**
4. Click **"Deploy Campaign"**
5. Approve the transaction in your wallet (Pera/Defly)
6. Wait for deployment confirmation
7. Copy the smart contract address for sharing

#### Step 3: Share Your Campaign
- Share the contract address with potential contributors
- They can view it on the Club Funding page
- All transactions are verifiable on AlgoExplorer

---

### For Contributors (Supporting Campaigns)

#### Step 1: Discover Campaigns
1. Open the Student Dashboard
2. Click the **"Club Funding"** card
3. You'll see a list of all campaigns with:
   - Campaign title and club name
   - Progress bar showing funding status
   - Amount collected vs goal
   - Time remaining
   - Smart contract address

#### Step 2: Filter Campaigns (Optional)
- Use the filter tabs at the top:
  - **All**: Show all campaigns
  - **Active**: Only campaigns accepting contributions
  - **Successful**: Campaigns that met their goal
  - **Failed**: Campaigns that didn't meet their goal

#### Step 3: View Campaign Details
1. Click **"View Campaign"** on any campaign card
2. You'll see the full campaign page with:
   - Detailed description
   - Funding progress
   - Contribution form (if active)
   - Transparency ledger (all contributions)
   - Smart contract info

#### Step 4: Contribute to a Campaign
**Prerequisites:**
- Wallet connected (Pera/Defly)
- Sufficient ALGO balance
- Campaign must be active (before deadline)

**Steps:**
1. On the campaign detail page, scroll to the **"Contribute"** section
2. Enter the amount you want to contribute (in ALGO)
3. Click **"Contribute via Wallet"**
4. **First-time contributors**: Approve the opt-in transaction in your wallet
5. Approve the contribution transaction in your wallet
6. Wait for confirmation
7. Your contribution will appear in the **Transparency Ledger**

#### Step 5: Verify Your Contribution
1. Check the transparency ledger on the campaign page
2. Click the AlgoExplorer link next to your contribution
3. Verify the transaction on the blockchain

---

### After Campaign Ends

#### If Goal Was Met (Successful Campaign)
**For Organizers:**
1. View the campaign detail page
2. You'll see a **"Withdraw Funds"** button
3. Click to withdraw all collected funds
4. Approve the transaction in your wallet
5. Funds are transferred to your wallet

**For Contributors:**
- Campaign marked as "Successful"
- No refund available (funds went to organizer)

#### If Goal Was Not Met (Failed Campaign)
**For Contributors:**
1. View the campaign detail page
2. You'll see a **"Claim Refund"** button
3. Click to get your exact contribution back
4. Approve the transaction in your wallet
5. Funds are returned to your wallet

**For Organizers:**
- Campaign marked as "Failed"
- No funds can be withdrawn

---

## 🔧 Troubleshooting

### Datetime Input Issues

If you can't change the deadline time:

**Method 1: Manual Input**
1. Click in the datetime field
2. Type the date and time manually
3. Format: `YYYY-MM-DDTHH:MM`
4. Example: `2026-02-15T18:00`

**Method 2: Use Browser Controls**
1. Click the calendar icon to select date
2. Click the time portion (HH:MM)
3. Use keyboard arrows or type directly
4. Some browsers show AM/PM selector

**Method 3: Set via Code (Temporary Fix)**
```typescript
// In CreateCampaign.tsx, you can set a default deadline
deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
```

### Common Issues

**"Please connect your wallet"**
- Click "Connect Wallet" in the top right
- Select your wallet provider (Pera/Defly)
- Approve the connection

**"Insufficient balance"**
- Get test ALGO from: https://bank.testnet.algorand.network/
- Paste your wallet address
- Click "Dispense"

**"Campaign not found"**
- Refresh the page
- Check if the contract was actually deployed
- Verify the contract address on AlgoExplorer

**"Transaction failed"**
- Check wallet balance
- Ensure you're on TestNet
- Try again with a smaller amount

---

## 📱 UI Navigation Map

```
Student Dashboard
    └─ Click "Club Funding" Card
        │
        ├─ Campaign List Page (Home)
        │   ├─ Filter tabs (All/Active/Successful/Failed)
        │   ├─ Campaign cards with progress
        │   ├─ "Create Campaign" button (top right)
        │   │
        │   ├─ Click "Create Campaign"
        │   │   └─ Create Campaign Form
        │   │       └─ Deploy → Contract Address → Back to List
        │   │
        │   └─ Click "View Campaign" on any card
        │       └─ Campaign Detail Page
        │           ├─ Campaign info & progress
        │           ├─ Contribute section (if active)
        │           ├─ Withdraw/Refund buttons (if ended)
        │           └─ Transparency Ledger
```

---

## 🎓 Quick Start Guide

### For Testing (5 Minutes)

1. **Get Test ALGO**
   - Visit: https://bank.testnet.algorand.network/
   - Paste your wallet address
   - Click "Dispense"

2. **Create a Test Campaign**
   - Goal: 5 ALGO
   - Deadline: 1 hour from now
   - Deploy and copy contract address

3. **Contribute (from different wallet)**
   - View the campaign in the list
   - Click "View Campaign"
   - Contribute 2 ALGO
   - Check transparency ledger

4. **Verify on Blockchain**
   - Click AlgoExplorer link
   - Verify contract balance
   - View all transactions

---

## 💡 Tips

- **Share campaigns**: Send the contract address to potential contributors
- **Verify everything**: Use AlgoExplorer links to verify all transactions
- **Set realistic deadlines**: Remember, deadlines are immutable
- **Test first**: Try with small amounts on TestNet before MainNet
- **Refresh data**: Use the "Refresh from Blockchain" button to update balances

---

## 🔗 Important Links

- **TestNet Dispenser**: https://bank.testnet.algorand.network/
- **AlgoExplorer TestNet**: https://testnet.algoexplorer.io/
- **Pera Wallet**: https://perawallet.app/
- **Defly Wallet**: https://defly.app/
