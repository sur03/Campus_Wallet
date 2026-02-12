# Pera Wallet Initialization Fix

## Problem
Error: `PeraWalletConnect was not initialized correctly`

This error occurs when Pera Wallet (and other WalletConnect-based wallets) are not properly initialized with required configuration.

## Root Cause
The `@txnlab/use-wallet-react` library requires a `projectId` for WalletConnect-based wallets like Pera and Defly. Without this, the wallet SDK cannot establish a proper connection.

## Solution Applied

### 1. Fixed Algod Configuration Format (404 Error Fix)

The 404 error was caused by incorrect property names in the algod config. Updated `src/utils/algorand.ts`:

```typescript
export function getAlgodConfig() {
  const config = ALGORAND_CONFIG[DEFAULT_NETWORK].algod;
  return {
    baseServer: config.baseServer,  // Changed from 'server' to 'baseServer'
    port: config.port || '',
    token: config.token || '',
  };
}
```

Also updated `src/components/StudentDashboard.tsx` to use `config.baseServer` instead of `config.server`.

### 2. Added WalletConnect Project ID Configuration

Updated `src/App.tsx` to include `projectId` in wallet options:

```typescript
const walletManager = new WalletManager({
  wallets: [
    { 
      id: WalletId.PERA,
      options: { 
        projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
      }
    },
    { 
      id: WalletId.DEFLY,
      options: { 
        projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
      }
    },
    { id: WalletId.EXODUS }
  ],
  // ... rest of config
});
```

### 3. Updated Environment Variables

Added to `.env`:
```
VITE_WALLETCONNECT_PROJECT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 4. Enhanced Connection Validation

Updated `src/components/SendPayment.tsx` to properly check wallet state before transactions:

- Added detailed logging of wallet connection status
- Check for active wallet, connection state, and signer availability
- Provide clear error messages for each failure case

### 5. Improved Connection Handling

Updated `src/components/WalletConnectionModal.tsx`:

- Added logging to track connection flow
- Handle edge cases where wallet is connected but has no accounts
- Disconnect and reconnect if wallet is in a bad state
- Better error handling for various connection scenarios

## Testing Steps

1. **Restart Development Server**
   ```bash
   npm run dev
   ```

2. **Clear Browser Cache**
   - Open DevTools (F12)
   - Right-click refresh button → "Empty Cache and Hard Reload"
   - Or clear site data in Application tab

3. **Connect Wallet**
   - Click "Connect Wallet"
   - Select Pera Wallet
   - Approve connection in Pera mobile app
   - Check console for connection logs

4. **Test Transaction**
   - Navigate to Send Payment
   - Enter recipient address and amount
   - Click "Send Payment"
   - Approve transaction in Pera app

## Getting a Real WalletConnect Project ID

For production use, get your own project ID:

1. Go to https://cloud.walletconnect.com
2. Sign up for a free account
3. Create a new project
4. Copy your Project ID
5. Update `.env`:
   ```
   VITE_WALLETCONNECT_PROJECT_ID=your_actual_project_id_here
   ```

## Troubleshooting

### Still Getting Initialization Error?

1. **Clear all wallet connections:**
   - In Pera app: Settings → Connected Apps → Disconnect your app
   - In browser: Clear localStorage and cookies

2. **Check console logs:**
   - Look for "Wallet Connection Status" logs
   - Verify `isConnected`, `hasAddress`, and `hasSigner` are all true

3. **Verify environment:**
   - Restart dev server after changing `.env`
   - Check that `VITE_WALLETCONNECT_PROJECT_ID` is loaded

### Transaction Still Fails?

- Ensure wallet is fully connected (check console logs)
- Verify you have sufficient balance (including 0.001 ALGO fee)
- Check network connectivity
- Try disconnecting and reconnecting wallet

## Key Changes Summary

- ✅ Added `projectId` to Pera and Defly wallet configurations
- ✅ Added `VITE_WALLETCONNECT_PROJECT_ID` to environment variables
- ✅ Enhanced connection state validation in SendPayment
- ✅ Improved error handling and logging throughout
- ✅ Better wallet connection flow in WalletConnectionModal
- ✅ Fixed algod config format (changed `server` to `baseServer`)
- ✅ Updated StudentDashboard to use correct config property

The wallet should now initialize correctly and handle transactions properly!
