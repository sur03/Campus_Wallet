# Troubleshooting: "Address must not be null or undefined" Error

## Problem
When trying to create a campaign, you get the error:
```
Deployment failed: Contract deployment failed: Address must not be null or undefined
```

## Root Cause
This error occurs when the wallet is not properly connected or the wallet address is not available when trying to deploy the smart contract.

## Solutions

### Solution 1: Ensure Wallet is Connected

**Step-by-step:**

1. **Check Wallet Connection Status**
   - Look at the top-right corner of the application
   - You should see a "Connect Wallet" button OR your wallet address

2. **If you see "Connect Wallet":**
   - Click the "Connect Wallet" button
   - Select your wallet provider (Pera Wallet or Defly Wallet)
   - Approve the connection in your wallet app
   - Wait for the connection to complete
   - You should now see your wallet address displayed

3. **If you see your wallet address:**
   - The wallet is connected
   - Try refreshing the page and reconnecting

### Solution 2: Verify Wallet App is Running

**For Pera Wallet:**
- Open the Pera Wallet mobile app
- Ensure it's on TestNet (Settings → Node Settings → TestNet)
- Keep the app open while using the web application

**For Defly Wallet:**
- Open the Defly Wallet browser extension or mobile app
- Ensure it's on TestNet
- Keep the wallet unlocked

### Solution 3: Check Browser Console

1. Open browser developer tools (F12 or Right-click → Inspect)
2. Go to the "Console" tab
3. Look for error messages related to wallet connection
4. Common issues:
   - `Wallet not connected`
   - `Transaction signer not available`
   - `Active address is undefined`

### Solution 4: Reconnect Wallet

1. **Disconnect:**
   - Click on your wallet address (top-right)
   - Click "Disconnect" or "Logout"

2. **Reconnect:**
   - Click "Connect Wallet"
   - Select your wallet provider
   - Approve the connection
   - Wait for confirmation

3. **Try Again:**
   - Navigate to Club Funding
   - Click "Create Campaign"
   - Fill in the form
   - Submit

### Solution 5: Clear Browser Cache

1. Clear browser cache and local storage
2. Refresh the page
3. Reconnect your wallet
4. Try creating a campaign again

## Debugging Steps

### Check Wallet Connection in Console

Open browser console and run:
```javascript
// Check if wallet is connected
console.log('Active Address:', window.localStorage.getItem('walletconnect'));
```

### Verify TestNet Connection

1. Open your wallet app
2. Go to Settings
3. Check Network: Should be "TestNet"
4. If on MainNet, switch to TestNet

### Test with Different Wallet

If one wallet doesn't work, try:
1. Disconnect current wallet
2. Connect with a different wallet provider
3. Try creating a campaign again

## Prevention

### Before Creating a Campaign:

✅ **Checklist:**
- [ ] Wallet app is installed and open
- [ ] Wallet is connected to the web app (address visible)
- [ ] Wallet is on Algorand TestNet
- [ ] You have test ALGO in your wallet
- [ ] Browser console shows no errors

## Still Not Working?

### Check These:

1. **Wallet Provider Compatibility**
   - Pera Wallet: ✅ Supported
   - Defly Wallet: ✅ Supported
   - Other wallets: May not be supported

2. **Browser Compatibility**
   - Chrome: ✅ Recommended
   - Firefox: ✅ Supported
   - Safari: ⚠️ May have issues
   - Edge: ✅ Supported

3. **Network Issues**
   - Check internet connection
   - Try disabling VPN
   - Check if Algorand TestNet is accessible

## Error Messages Explained

### "Address must not be null or undefined"
- **Cause**: Wallet address is not available
- **Fix**: Ensure wallet is connected before creating campaign

### "Organizer address is required"
- **Cause**: activeAddress is empty or null
- **Fix**: Connect wallet and ensure address is visible

### "Invalid organizer address"
- **Cause**: Address format is incorrect
- **Fix**: Disconnect and reconnect wallet

### "Please connect your wallet"
- **Cause**: Wallet not connected
- **Fix**: Click "Connect Wallet" button

## Quick Fix (Most Common)

**90% of the time, this works:**

1. Refresh the page (F5)
2. Click "Connect Wallet"
3. Select your wallet (Pera/Defly)
4. Approve connection
5. Wait for address to appear
6. Try creating campaign again

---

## Technical Details (For Developers)

The error occurs in `contractService.ts` at line 83:
```typescript
algosdk.decodeAddress(params.organizer).publicKey
```

This fails when `params.organizer` is:
- `undefined`
- `null`
- Empty string `""`
- Invalid Algorand address format

The fix adds validation before decoding:
```typescript
// Validate organizer address
if (!params.organizer || params.organizer.trim() === '') {
    throw new Error('Organizer address is required. Please ensure your wallet is connected.');
}

// Validate address format
if (!algosdk.isValidAddress(params.organizer)) {
    throw new Error(`Invalid organizer address: ${params.organizer}`);
}
```

This provides clearer error messages to help diagnose the issue.
