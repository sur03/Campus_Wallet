import { useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';

export function NetworkDiagnostic() {
  const { wallets, activeAddress } = useWallet();

  useEffect(() => {
    console.log('🔍 Network Diagnostic:');
    console.log('- Active Address:', activeAddress);
    console.log('- Wallets:', wallets?.map(w => ({
      id: w.id,
      isActive: w.isActive,
      isConnected: w.isConnected,
      accounts: w.accounts?.length || 0,
    })));
    
    const activeWallet = wallets?.find(w => w.isActive);
    if (activeWallet) {
      console.log('✅ Active Wallet:', {
        id: activeWallet.id,
        isConnected: activeWallet.isConnected,
        accounts: activeWallet.accounts,
      });
    } else {
      console.log('❌ No active wallet found');
    }
  }, [wallets, activeAddress]);

  return null;
}
