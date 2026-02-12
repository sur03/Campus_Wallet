# 🚪 Logout Feature Guide

## ✅ Logout is Already Implemented!

Your app already has a fully functional logout button.

---

## Where to Find the Logout Button

### Location 1: Student Dashboard (Main Page)
```
┌─────────────────────────────────────────────┐
│  Student Dashboard              [Logout] ←  │  Top-right corner
│  Manage your campus payments                │
├─────────────────────────────────────────────┤
│                                             │
│  Connected Wallet: ABC123...XYZ789          │
│  Balance: 10.000000 ALGO                    │
│                                             │
└─────────────────────────────────────────────┘
```

### Location 2: Send Payment Page
```
┌─────────────────────────────────────────────┐
│  [← Back to Dashboard]          [Logout] ←  │  Top-right corner
│                                             │
│  Send Payment                               │
│  Transfer ALGO to another wallet            │
└─────────────────────────────────────────────┘
```

---

## How Logout Works

### What Happens When You Click Logout:

1. **Disconnects wallet** from the app
2. **Clears active address** from state
3. **Shows notification**: "Wallet disconnected"
4. **Returns to connect screen**

### Code Implementation:
```typescript
const handleDisconnect = async () => {
  try {
    const connectedWallet = wallets?.find(w => w.isActive);
    if (connectedWallet) {
      await connectedWallet.disconnect();  // Disconnect from wallet
      enqueueSnackbar('Wallet disconnected', { variant: 'info' });
      onLogout();  // Return to connect screen
    }
  } catch (error) {
    console.error('Disconnect error:', error);
  }
};
```

---

## Testing the Logout

### Step 1: Connect Wallet
1. Open http://localhost:3002
2. Click "Connect Wallet"
3. Choose "Pera Wallet"
4. Scan QR code
5. Approve connection

### Step 2: Verify Logout Button Visible
Look at top-right corner - should see:
```
[🚪 Logout]
```

### Step 3: Click Logout
1. Click the "Logout" button
2. Should see notification: "Wallet disconnected"
3. Should return to "Connect Your Wallet" screen

### Step 4: Reconnect (Optional)
1. Click "Connect Wallet" again
2. Choose wallet
3. Approve
4. Back to dashboard

---

## Logout Button Styling

The logout button has:
- ✅ LogOut icon (🚪)
- ✅ "Logout" text
- ✅ Hover effect (darker background)
- ✅ Border with purple accent
- ✅ Smooth transition animation

```typescript
<button
  onClick={handleDisconnect}
  className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-white rounded-lg border border-purple-500/20 transition-all"
>
  <LogOut className="w-4 h-4" />
  Logout
</button>
```

---

## If You Don't See the Logout Button

### Possible Reasons:

1. **Wallet not connected**
   - Logout only shows when wallet is connected
   - Connect wallet first

2. **Browser cache**
   - Clear cache: Ctrl + Shift + Delete
   - Hard refresh: Ctrl + Shift + R

3. **Screen too small**
   - Logout is in top-right corner
   - Try full screen or zoom out

---

## Logout on Both Pages

The logout button appears on:

### ✅ Page 1: Student Dashboard
- Top-right corner
- Next to "Student Dashboard" title

### ✅ Page 2: Send Payment
- Top-right corner
- Next to "Back to Dashboard" button

---

## What Logout Does NOT Do

❌ Does NOT delete your wallet
❌ Does NOT remove your ALGO
❌ Does NOT close Pera Wallet app
❌ Does NOT affect blockchain data

✅ ONLY disconnects the wallet from THIS app
✅ You can reconnect anytime

---

## Keyboard Shortcut (Optional Enhancement)

If you want to add a keyboard shortcut for logout, you can add:

```typescript
// In StudentDashboard.tsx
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'l') {
      handleDisconnect();
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

Then users can press `Ctrl + L` to logout.

---

## Summary

✅ **Logout button exists** in top-right corner
✅ **Works on both pages** (Dashboard and Send Payment)
✅ **Fully functional** - disconnects wallet properly
✅ **User-friendly** - shows notification on disconnect

**Just look at the top-right corner of your screen when wallet is connected!**

---

## Quick Test

1. Open http://localhost:3002
2. Connect wallet
3. Look at top-right corner
4. See "Logout" button with 🚪 icon
5. Click it
6. See "Wallet disconnected" notification
7. ✅ Working!

The logout feature is already there and working perfectly! 🎉
