# 🔧 Step-by-Step Fix for "PeraWalletConnect was not initialized correctly"

## Follow These Steps EXACTLY

### Step 1: Close Everything
```
1. Close your browser COMPLETELY (all windows)
2. Close Pera Wallet app on your phone
3. Wait 5 seconds
```

### Step 2: Clear Browser Cache
```
1. Open browser
2. Press Ctrl + Shift + Delete
3. Select "Cached images and files"
4. Select "All time"
5. Click "Clear data"
6. Close browser again
```

### Step 3: Restart Dev Server
```
In VS Code terminal:
1. Press Ctrl + C to stop server
2. Run: npm run dev
3. Wait for "ready in XXX ms"
4. Note the port (should be 3002)
```

### Step 4: Open Fresh Browser
```
1. Open NEW browser window
2. Go to: http://localhost:3002
3. Open DevTools (F12)
4. Go to Console tab
5. Clear console (right-click → Clear console)
```

### Step 5: Connect Wallet (Fresh)
```
1. Click "Connect Wallet"
2. Choose "Pera Wallet"
3. Open Pera Wallet app on phone
4. Make sure it says "TestNet" at top
5. Scan QR code
6. Click "Connect"
7. Wait for "Wallet connected successfully!"
```

### Step 6: Check Console
```
Look at browser console (F12)
Should see NO errors
If you see errors, STOP and report them
```

### Step 7: Test Transaction
```
1. Click "Send Payment"
2. Enter recipient address
3. Enter amount (e.g., 0.1)
4. Click "Send Payment"
5. Check Pera Wallet app
6. Should show transaction to approve
7. Click "Approve"
```

---

## If Still Not Working

### Check 1: Is Pera Wallet on TestNet?
```
1. Open Pera Wallet app
2. Look at top of screen
3. Should say "TestNet"
4. If it says "MainNet":
   - Settings → Developer Settings
   - Node Settings → TestNet
   - Restart app
```

### Check 2: Do You Have TestNet ALGO?
```
1. Open Pera Wallet
2. Check balance
3. If 0 ALGO:
   - Copy your address
   - Go to: https://bank.testnet.algorand.network/
   - Paste address
   - Click "Dispense"
   - Wait 10 seconds
   - Check balance again
```

### Check 3: Is Server Running?
```
In VS Code terminal, should see:
  VITE v6.3.5  ready in XXX ms
  ➜  Local:   http://localhost:3002/

If not:
1. Press Ctrl + C
2. Run: npm run dev
3. Wait for "ready"
```

### Check 4: Is .env File Present?
```
Check if file exists:
Blockchain Campus Payment UI/.env

Should contain:
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_PORT=
VITE_ALGOD_TOKEN=
VITE_ALGOD_NETWORK=testnet
```

---

## Nuclear Option (If Nothing Works)

### Complete Reset
```bash
# 1. Stop server
Ctrl + C

# 2. Delete node_modules
rmdir /s /q "node_modules"

# 3. Delete package-lock.json
del package-lock.json

# 4. Reinstall
npm install

# 5. Start server
npm run dev

# 6. Close browser completely
# 7. Reopen browser
# 8. Go to http://localhost:3002
# 9. Reconnect wallet
# 10. Try transaction
```

---

## What to Check in Console

### ✅ Good Console (No Errors)
```
VITE v6.3.5  ready in 930 ms
➜  Local:   http://localhost:3002/

(No red errors)
```

### ❌ Bad Console (Has Errors)
```
[Wallet:PERA] Error signing transactions: PeraWalletConnect was not initialized correctly.
```

If you see this, you didn't do a hard refresh!

---

## Common Mistakes

### ❌ Mistake 1: Not Closing Browser
```
Just refreshing (F5) is NOT enough!
You must CLOSE browser completely!
```

### ❌ Mistake 2: Not Clearing Cache
```
Old code is cached in browser
Must clear cache: Ctrl + Shift + Delete
```

### ❌ Mistake 3: Not Restarting Server
```
Server needs to restart to load .env file
Press Ctrl + C, then npm run dev
```

### ❌ Mistake 4: Wrong Network in Pera Wallet
```
Pera Wallet must be on TestNet
Check top of Pera Wallet app
Should say "TestNet" not "MainNet"
```

---

## Verification Checklist

Before testing transaction, verify:

- [ ] Browser cache cleared
- [ ] Browser closed and reopened
- [ ] Dev server restarted
- [ ] .env file exists
- [ ] Pera Wallet on TestNet
- [ ] Wallet connected successfully
- [ ] Balance shows in app
- [ ] No console errors
- [ ] Using http://localhost:3002

If ALL checked, transaction should work!

---

## Still Not Working?

### Report These Details:

1. **Browser Console Errors** (copy full error)
2. **Pera Wallet Network** (TestNet or MainNet?)
3. **Server Output** (what does terminal show?)
4. **Steps You Did** (which steps above did you complete?)

---

## Expected Working Flow

```
1. Open http://localhost:3002
   ↓
2. Click "Connect Wallet"
   ↓
3. Choose "Pera Wallet"
   ↓
4. Scan QR code
   ↓
5. Approve in Pera Wallet
   ↓
6. See "Wallet connected successfully!"
   ↓
7. See wallet address and balance
   ↓
8. Click "Send Payment"
   ↓
9. Fill in details
   ↓
10. Click "Send Payment"
    ↓
11. Pera Wallet opens
    ↓
12. Shows transaction details
    ↓
13. Click "Approve"
    ↓
14. See "Transaction sent!"
    ↓
15. ✅ SUCCESS!
```

---

## Quick Commands

```bash
# Stop server
Ctrl + C

# Start server
npm run dev

# Clear cache in browser
Ctrl + Shift + Delete

# Hard refresh browser
Ctrl + Shift + R

# Open DevTools
F12
```

---

**Follow these steps EXACTLY in order. Don't skip any step!**
