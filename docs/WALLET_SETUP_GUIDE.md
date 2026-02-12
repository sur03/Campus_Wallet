# 🎯 Wallet Setup Guide - TestNet

## ✅ Error Fixed!

The "KMD connection refused" error is now gone. The app now shows only **TestNet wallets**.

---

## Current Configuration

**Network**: Algorand TestNet (Free, Public)
**Wallets Available**: 
- ✅ Pera Wallet (Recommended)
- ✅ Defly Wallet
- ✅ Exodus Wallet

**KMD Wallet**: Hidden (only for LocalNet development)

---

## How to Connect Your Wallet

### Option 1: Pera Wallet (Recommended) 📱

#### Step 1: Install Pera Wallet
- **Android**: https://play.google.com/store/apps/details?id=com.algorand.android
- **iOS**: https://apps.apple.com/app/pera-algo-wallet/id1459898525

#### Step 2: Create/Import Wallet
1. Open Pera Wallet app
2. Create new account or import existing
3. **IMPORTANT**: Write down your recovery phrase!

#### Step 3: Switch to TestNet
1. Open Pera Wallet
2. Go to **Settings** ⚙️
3. Tap **Developer Settings**
4. Tap **Node Settings**
5. Select **TestNet**
6. ✅ You're now on TestNet!

#### Step 4: Get Free TestNet ALGO
1. Copy your wallet address from Pera Wallet
2. Visit: https://bank.testnet.algorand.network/
3. Paste your address
4. Click "Dispense"
5. ✅ You'll receive 10 ALGO (free!)

#### Step 5: Connect to Your App
1. Open http://localhost:3000 in browser
2. Click "Connect Wallet"
3. Click "Pera Wallet"
4. Scan QR code with Pera Wallet app
5. Approve connection
6. ✅ Connected!

---

### Option 2: Defly Wallet 🦋

#### Install
- **Mobile**: https://defly.app/
- **Browser Extension**: https://chrome.google.com/webstore (search "Defly")

#### Setup
1. Create wallet
2. Switch to TestNet in settings
3. Get TestNet ALGO from dispenser
4. Connect at http://localhost:3000

---

### Option 3: Exodus Wallet 💎

#### Install
- **Desktop**: https://www.exodus.com/download
- **Mobile**: App Store / Play Store

#### Setup
1. Create wallet
2. Enable Algorand
3. Switch to TestNet (if available)
4. Get TestNet ALGO
5. Connect at http://localhost:3000

---

## Testing Your Connection

### 1. Check Connection
```
✅ Wallet address displayed
✅ Balance shown in ALGO
✅ No console errors
```

### 2. Test Send Payment
1. Click "Send Payment"
2. Enter recipient address (58 characters)
3. Enter amount (e.g., 0.5 ALGO)
4. Click "Send Payment"
5. Approve in wallet app
6. ✅ Transaction sent!

### 3. Verify Transaction
- Check transaction on: https://testnet.algoexplorer.io/
- Paste your wallet address
- See your transaction history

---

## Common Issues & Solutions

### ❌ "Network mismatch error"
**Problem**: Pera Wallet is on MainNet, app is on TestNet

**Solution**:
1. Open Pera Wallet
2. Settings → Developer Settings → Node Settings
3. Select **TestNet**
4. Try connecting again

---

### ❌ "Insufficient balance"
**Problem**: Not enough ALGO in wallet

**Solution**:
1. Get free TestNet ALGO: https://bank.testnet.algorand.network/
2. Enter your wallet address
3. Request 10 ALGO
4. Wait 5 seconds
5. Try transaction again

---

### ❌ "Invalid address"
**Problem**: Recipient address is wrong format

**Solution**:
- Algorand addresses are exactly **58 characters**
- Example: `AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ`
- Copy-paste to avoid typos

---

### ❌ "Failed to fetch" or "Connection refused"
**Problem**: Trying to use KMD wallet without LocalNet

**Solution**:
- **Don't use KMD wallet** (it's for LocalNet only)
- Use **Pera, Defly, or Exodus** instead
- These work with TestNet

---

### ❌ QR code won't scan
**Problem**: Camera issues or QR code not displaying

**Solution**:
1. Refresh browser (F5)
2. Try different browser
3. Check camera permissions
4. Use WalletConnect link instead of QR

---

## Want to Use LocalNet Instead?

If you want to develop with local blockchain:

### 1. Start LocalNet
```bash
algokit localnet start
```

### 2. Update Wallet Config
Edit `src/utils/walletConfig.ts`:
```typescript
export const getWalletList = (): WalletId[] => {
  return [WalletId.KMD];  // Use KMD for LocalNet
};
```

### 3. Update Network Config
Edit `src/utils/algorand.ts`:
```typescript
export const DEFAULT_NETWORK = 'localnet';  // Change from 'testnet'
```

### 4. Restart App
```bash
npm run dev
```

But for now, **TestNet is easier** - no LocalNet setup needed!

---

## Summary

✅ **Current Setup**: TestNet with browser wallets
✅ **Recommended**: Pera Wallet on mobile
✅ **Free ALGO**: https://bank.testnet.algorand.network/
✅ **No LocalNet needed**: Everything works with TestNet
✅ **No KMD errors**: KMD wallet hidden

**Ready to test!** 🚀

1. Install Pera Wallet
2. Switch to TestNet
3. Get free ALGO
4. Connect at http://localhost:3000
5. Send your first payment!
