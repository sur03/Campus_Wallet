# ✅ LocalNet vs TestNet - Complete Solution

## The Problem Explained

### Why "PeraWalletConnect was not initialized correctly" Happens

**Pera Wallet ONLY works on TestNet and MainNet. It does NOT support LocalNet.**

```
LocalNet (AlgoKit)     →  ❌ Pera Wallet NOT supported
                       →  ✅ KMD Wallet ONLY

TestNet (Public)       →  ✅ Pera Wallet supported
                       →  ✅ Defly Wallet supported
                       →  ✅ Exodus Wallet supported
                       →  ❌ KMD Wallet NOT available

MainNet (Production)   →  ✅ Pera Wallet supported
                       →  ✅ Defly Wallet supported
                       →  ✅ Exodus Wallet supported
```

### Your Current Setup

**Your app is configured for TestNet** (which is correct for Pera Wallet!)

Check your `.env` file:
```env
VITE_ALGOD_NETWORK=testnet  ← You're on TestNet, not LocalNet!
```

This means:
- ✅ Pera Wallet SHOULD work
- ✅ You're using public TestNet nodes
- ✅ No LocalNet needed

---

## Solution: Your App is Already Configured Correctly!

Your `.env` file shows you're on **TestNet**, which means Pera Wallet should work.

The error is happening because of **browser cache** - your browser is running old code.

---

## Step-by-Step Fix

### Step 1: Verify You're on TestNet (Not LocalNet)

Check your `.env` file:
```env
# Should say "testnet" NOT "localnet"
VITE_ALGOD_NETWORK=testnet
```

✅ **Your file is correct!**

### Step 2: Make Sure Pera Wallet is on TestNet

1. Open Pera Wallet app on your phone
2. Look at the top - should say **"TestNet"**
3. If it says "MainNet":
   - Settings → Developer Settings
   - Node Settings → **TestNet**
   - Restart app

### Step 3: Clear Browser Cache (CRITICAL!)

```
1. Close browser completely
2. Reopen browser
3. Press Ctrl + Shift + Delete
4. Select "Cached images and files"
5. Select "All time"
6. Click "Clear data"
7. Close browser again
```

### Step 4: Restart Dev Server

```bash
# In terminal
Ctrl + C  # Stop server
npm run dev  # Start server
```

### Step 5: Test in Incognito Mode First

```
1. Open browser in Incognito/Private mode (Ctrl + Shift + N)
2. Go to http://localhost:3002
3. Connect Pera Wallet
4. Try transaction
```

If it works in incognito, the problem is definitely browser cache!

### Step 6: Get TestNet ALGO

```
1. Copy your wallet address from Pera Wallet
2. Visit: https://bank.testnet.algorand.network/
3. Paste your address
4. Click "Dispense"
5. Get 10 ALGO (free!)
```

### Step 7: Test Transaction

```
1. Open http://localhost:3002
2. Connect Pera Wallet
3. Click "Send Payment"
4. Enter recipient address
5. Enter amount (e.g., 0.5)
6. Click "Send Payment"
7. Approve in Pera Wallet
8. ✅ Should work!
```

---

## If You Want to Use LocalNet Instead

If you actually want to use LocalNet (for local development), here's how:

### Option A: Switch to LocalNet + KMD Wallet

#### 1. Update `.env` file:
```env
# LocalNet Configuration
VITE_ALGOD_SERVER=http://localhost
VITE_ALGOD_PORT=4001
VITE_ALGOD_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
VITE_ALGOD_NETWORK=localnet

VITE_KMD_SERVER=http://localhost
VITE_KMD_PORT=4002
VITE_KMD_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

#### 2. Update `App.tsx` to use KMD for LocalNet:
```typescript
import { WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react';

const algodNetwork = import.meta.env.VITE_ALGOD_NETWORK || 'testnet';
const isLocalNet = algodNetwork === 'localnet';

// Configure wallets based on network
const wallets = isLocalNet
  ? [
      {
        id: WalletId.KMD,
        options: {
          baseServer: import.meta.env.VITE_KMD_SERVER,
          token: import.meta.env.VITE_KMD_TOKEN,
          port: import.meta.env.VITE_KMD_PORT,
        },
      },
    ]
  : [
      { id: WalletId.PERA },
      { id: WalletId.DEFLY },
      { id: WalletId.EXODUS },
    ];

const walletManager = new WalletManager({
  wallets,
  defaultNetwork: algodNetwork,
  networks: {
    [algodNetwork]: {
      algod: {
        baseServer: import.meta.env.VITE_ALGOD_SERVER,
        port: import.meta.env.VITE_ALGOD_PORT,
        token: import.meta.env.VITE_ALGOD_TOKEN,
      },
    },
  },
});
```

#### 3. Start LocalNet:
```bash
algokit localnet start
```

#### 4. Use KMD wallet in your app

---

## Recommended: Stay on TestNet

**For your hackathon demo, I recommend staying on TestNet because:**

✅ **Advantages of TestNet:**
- Works with Pera Wallet (real wallet experience)
- No need to run LocalNet
- Free TestNet ALGO from dispenser
- More realistic demo
- Works on any device
- No local setup needed

❌ **Disadvantages of LocalNet:**
- Only KMD wallet (not user-friendly)
- Requires running AlgoKit LocalNet
- Requires Docker
- Can't demo on other computers easily
- More complex setup

---

## Current Status Check

### ✅ What's Correct:
- `.env` configured for TestNet
- `App.tsx` configured for TestNet
- Pera Wallet should work

### ❌ What's Wrong:
- Browser cache has old code
- Need to clear cache and reconnect wallet

---

## Quick Verification Commands

### Check if LocalNet is running:
```bash
algokit localnet status
```

If it says "running", you can stop it:
```bash
algokit localnet stop
```

You don't need LocalNet for TestNet!

### Check your network in code:
```bash
# In your project folder
type .env
```

Should show:
```
VITE_ALGOD_NETWORK=testnet
```

---

## Summary

**Your Issue**: Browser cache is serving old code

**Your Network**: TestNet (correct for Pera Wallet!)

**Solution**:
1. Clear browser cache
2. Restart dev server
3. Reconnect Pera Wallet (make sure it's on TestNet)
4. Get TestNet ALGO from dispenser
5. Try transaction again

**You don't need LocalNet!** Your app is already configured for TestNet, which is perfect for Pera Wallet.

---

## Final Checklist

Before testing:
- [ ] `.env` says `VITE_ALGOD_NETWORK=testnet`
- [ ] Browser cache cleared
- [ ] Browser closed and reopened
- [ ] Dev server restarted
- [ ] Pera Wallet on TestNet (check app)
- [ ] Have TestNet ALGO in wallet
- [ ] Using http://localhost:3002

If all checked, transaction will work! ✅

---

**The fix is simple: Clear your browser cache. Your configuration is already correct for TestNet + Pera Wallet!**
