# TestNet Setup Guide

## Current Configuration

Your CampusChain payment UI is now configured to work with **Algorand TestNet**.

### Network Details
- **Network**: TestNet (no API keys required)
- **Algod Endpoint**: https://testnet-api.algonode.cloud
- **Indexer Endpoint**: https://testnet-idx.algonode.cloud

### Supported Wallets
1. **Pera Wallet** (Recommended)
2. **Defly Wallet**
3. **Exodus Wallet**

## How to Test

### 1. Get TestNet ALGO
Before you can send payments, you need TestNet ALGO in your wallet:

1. Install Pera Wallet on your mobile device
2. Create a new wallet or use existing one
3. **IMPORTANT**: Switch to TestNet in Pera Wallet settings
4. Get free TestNet ALGO from the dispenser:
   - Visit: https://bank.testnet.algorand.network/
   - Or: https://testnet.algoexplorer.io/dispenser
   - Enter your wallet address
   - Request TestNet ALGO (you'll get 10 ALGO)

### 2. Connect Your Wallet
1. Open http://localhost:3000 in your browser
2. Click "Connect Wallet"
3. Choose "Pera Wallet"
4. Scan the QR code with Pera Wallet app
5. **Make sure Pera Wallet is on TestNet** (check settings)
6. Approve the connection

### 3. Send a Payment
1. After connecting, click "Send Payment"
2. Enter recipient address (58 characters)
3. Enter amount in ALGO
4. Click "Send Payment"
5. Approve the transaction in Pera Wallet

## Troubleshooting

### "Network mismatch error"
- **Solution**: Make sure Pera Wallet is set to TestNet
- Go to Pera Wallet Settings → Developer Settings → Node Settings
- Select "TestNet"

### "Insufficient balance"
- **Solution**: Get more TestNet ALGO from the dispenser
- Visit: https://bank.testnet.algorand.network/

### "Invalid address"
- **Solution**: Algorand addresses must be exactly 58 characters
- Example valid address: `AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ`

### Wallet won't connect
- **Solution**: 
  1. Make sure you're using HTTPS or localhost
  2. Clear browser cache
  3. Try a different wallet (Defly or Exodus)
  4. Check browser console for errors

## Features Implemented

✅ **Wallet Connection**
- Connect with Pera, Defly, or Exodus wallet
- Display connected wallet address
- Show wallet balance in ALGO

✅ **Send Payment**
- Send ALGO to any Algorand address
- Real-time address validation
- Transaction confirmation
- Error handling

🚧 **Coming Soon**
- Split Expenses
- Club Funding
- Transaction History

## No API Keys Needed!

The public Algorand TestNet endpoints are free and don't require any API keys or authentication. This makes it perfect for development and testing.

## Ready for Production?

When you're ready to deploy to MainNet:
1. Change `DEFAULT_NETWORK` in `src/utils/algorand.ts` from `'testnet'` to `'mainnet'`
2. Test thoroughly with small amounts first
3. Remember: MainNet uses real ALGO with real value!
