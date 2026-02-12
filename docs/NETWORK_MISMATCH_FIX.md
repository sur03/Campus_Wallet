# 🚨 Network Mismatch - The Real Problem

## If Incognito Mode Also Fails

If the error happens even in incognito mode, it means **Pera Wallet on your phone is on a different network than the app**.

---

## The Problem

```
Your App:     TestNet  ✅
Pera Wallet:  MainNet  ❌  ← MISMATCH!
```

When networks don't match, PeraWalletConnect cannot initialize properly.

---

## Solution: Switch Pera Wallet to TestNet

### Step 1: Open Pera Wallet App
Open the Pera Wallet app on your phone

### Step 2: Check Current Network
Look at the **top of the screen**:
- If it says **"MainNet"** → You need to switch!
- If it says **"TestNet"** → Already correct

### Step 3: Switch to TestNet
1. Tap **Settings** (⚙️ icon)
2. Tap **Developer Settings**
3. Tap **Node Settings**
4. Select **TestNet**
5. Go back to main screen

### Step 4: Verify Network Changed
- Top of screen should now say **"TestNet"**
- Your balance might show 0 (that's normal)

### Step 5: Get TestNet ALGO
1. Copy your wallet address from Pera Wallet
2. Visit: https://bank.testnet.algorand.network/
3. Paste your address
4. Click "Dispense"
5. Wait 10 seconds
6. Check balance in Pera Wallet (should show ~10 ALGO)

### Step 6: Reconnect in App
1. Go back to http://localhost:3000
2. If already connected, click "Logout"
3. Click "Connect Wallet"
4. Choose "Pera Wallet"
5. Scan QR code
6. Approve connection

### Step 7: Try Transaction
1. Click "Send Payment"
2. Enter recipient address
3. Enter amount
4. Click "Send Payment"
5. ✅ Should work now!

---

## How to Verify Network Match

### Check 1: In Browser Console
1. Open http://localhost:3000
2. Press F12 (DevTools)
3. Go to Console tab
4. Look for: `🔍 Environment Check:`
5. Should show: `network: "testnet"`

### Check 2: In Pera Wallet
1. Open Pera Wallet app
2. Look at top of screen
3. Should say: **"TestNet"**

### Check 3: Both Must Match!
```
✅ CORRECT:
App:         testnet
Pera Wallet: TestNet

❌ WRONG:
App:         testnet
Pera Wallet: MainNet  ← This causes the error!
```

---

## Visual Guide

### Pera Wallet Settings Path:
```
Pera Wallet App
    ↓
Settings (⚙️)
    ↓
Developer Settings
    ↓
Node Settings
    ↓
Select "TestNet"
    ↓
✅ Done!
```

### What You'll See:
```
Before:
┌─────────────────┐
│ MainNet      ▼  │  ← Top of Pera Wallet
└─────────────────┘

After:
┌─────────────────┐
│ TestNet      ▼  │  ← Top of Pera Wallet
└─────────────────┘
```

---

## Why This Happens

Pera Wallet defaults to **MainNet** (real money network).

Your app is configured for **TestNet** (free test network).

When they don't match:
1. Pera Wallet connects to MainNet nodes
2. App tries to use TestNet nodes
3. PeraWalletConnect gets confused
4. Transaction fails with "not initialized correctly"

---

## After Switching to TestNet

### What Changes:
- ✅ Your balance might show 0 (get free ALGO from dispenser)
- ✅ Top of Pera Wallet says "TestNet"
- ✅ Transactions work in the app
- ✅ No more "PeraWalletConnect" errors

### What Doesn't Change:
- ❌ Your wallet address (stays the same)
- ❌ Your recovery phrase (stays the same)
- ❌ Your MainNet balance (still there, just not visible on TestNet)

You can switch back to MainNet anytime!

---

## Alternative: Use MainNet (Not Recommended for Testing)

If you want to use MainNet instead:

### Option A: Switch App to MainNet
1. Edit `.env` file:
   ```env
   VITE_ALGOD_SERVER=https://mainnet-api.algonode.cloud
   VITE_ALGOD_NETWORK=mainnet
   ```
2. Restart server: `Ctrl + C`, then `npm run dev`
3. Keep Pera Wallet on MainNet
4. Use real ALGO (costs real money!)

### Option B: Keep TestNet (Recommended)
- Free ALGO from dispenser
- Safe for testing
- No risk of losing real money
- Perfect for development

---

## Troubleshooting

### "I switched to TestNet but still get error"
1. Close Pera Wallet app completely
2. Reopen Pera Wallet
3. Verify top says "TestNet"
4. In browser, click "Logout"
5. Click "Connect Wallet" again
6. Scan QR code
7. Try transaction

### "I don't see Developer Settings"
1. Update Pera Wallet to latest version
2. Or look for "Node Settings" directly in Settings
3. Some versions have it in different places

### "Balance shows 0 on TestNet"
1. That's normal! TestNet is separate from MainNet
2. Get free ALGO: https://bank.testnet.algorand.network/
3. Enter your address
4. Click "Dispense"
5. Wait 10 seconds

---

## Quick Checklist

Before testing transaction:

- [ ] Pera Wallet shows "TestNet" at top
- [ ] Have TestNet ALGO in wallet (get from dispenser)
- [ ] Browser console shows `network: "testnet"`
- [ ] Wallet reconnected after switching network
- [ ] No yellow warning on Send Payment page

If ALL checked, transaction will work! ✅

---

## Summary

**The error happens because Pera Wallet is on MainNet but your app is on TestNet.**

**Solution:**
1. Open Pera Wallet app
2. Settings → Developer Settings → Node Settings
3. Select **TestNet**
4. Get free ALGO from dispenser
5. Reconnect wallet in app
6. Try transaction

**This will fix the "PeraWalletConnect was not initialized correctly" error!** 🎯
