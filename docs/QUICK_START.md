# Quick Start Guide

## ✅ All Errors Fixed!

The following issues have been resolved:
- ❌ ~~"global is not defined"~~ → ✅ Fixed with polyfills
- ❌ ~~"buffer externalized"~~ → ✅ Fixed with Buffer polyfill
- ❌ ~~"Exodus not available"~~ → ✅ Fixed with environment detection

---

## Running the App

### Option 1: TestNet (Recommended for Testing)
```bash
npm run dev
```
- Opens at http://localhost:3000
- Uses TestNet (free, no API keys)
- Wallets: Pera, Defly, Exodus
- Get free TestNet ALGO: https://bank.testnet.algorand.network/

### Option 2: LocalNet (Development)
```bash
# Terminal 1: Start LocalNet
algokit localnet start

# Terminal 2: Start app
npm run dev
```
- Opens at http://localhost:3000
- Uses LocalNet (local blockchain)
- Wallet: KMD only
- No real ALGO needed

---

## Testing Wallet Connection

### TestNet (Current Setup)
1. Install Pera Wallet on mobile
2. Switch to TestNet in settings
3. Get free ALGO from dispenser
4. Open http://localhost:3000
5. Click "Connect Wallet" → "Pera Wallet"
6. Scan QR code
7. ✅ Connected!

### LocalNet
1. Start AlgoKit LocalNet
2. Open http://localhost:3000
3. Click "Connect Wallet" → "KMD (LocalNet)"
4. ✅ Connected!

---

## What Changed?

### Files Modified
1. `vite.config.ts` - Added Node.js polyfills
2. `main.tsx` - Added Buffer polyfill
3. `App.tsx` - Environment-aware wallet config
4. `WalletConnectionModal.tsx` - Better error handling
5. `utils/walletConfig.ts` - NEW: Auto-detect environment

### Dependencies Added
- `vite-plugin-node-polyfills` - Provides Node.js globals for browser

---

## Environment Detection

The app automatically detects your environment:

| Environment | URL | Wallets Available |
|------------|-----|-------------------|
| LocalNet | localhost:3000 | KMD only |
| TestNet | Any other domain | Pera, Defly, Exodus |

No manual configuration needed!

---

## Common Issues

### "Network mismatch" in Pera Wallet
**Fix**: Switch Pera Wallet to TestNet
- Settings → Developer Settings → Node Settings → TestNet

### "Insufficient balance"
**Fix**: Get free TestNet ALGO
- Visit: https://bank.testnet.algorand.network/
- Enter your wallet address
- Request 10 ALGO

### Wallet won't connect
**Fix**: Check environment
- LocalNet → Use KMD wallet
- TestNet → Use Pera/Defly/Exodus
- Make sure wallet extension is installed

---

## Next Steps

1. ✅ App is running at http://localhost:3000
2. ✅ Connect your wallet
3. ✅ Test "Send Payment" feature
4. 🚧 Other features coming soon:
   - Split Expenses
   - Club Funding
   - Transaction History

---

## Need Help?

- Check `VITE_POLYFILL_FIX.md` for technical details
- Check `TESTNET_SETUP.md` for TestNet configuration
- Check browser console for error messages
- Ensure all dependencies are installed: `npm install`

---

## Production Deployment

When ready to deploy:
1. Build: `npm run build`
2. Deploy `build/` folder to hosting
3. Use HTTPS (required for wallets)
4. Test with real wallets
5. Consider switching to MainNet (edit `algorand.ts`)

**Current Status**: Ready for TestNet testing! 🚀
