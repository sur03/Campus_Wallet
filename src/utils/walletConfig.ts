import { WalletId } from '@txnlab/use-wallet-react';

// Detect if LocalNet is actually running
export const isLocalNetRunning = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://127.0.0.1:4001/health', { 
      method: 'GET',
      signal: AbortSignal.timeout(1000) // 1 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Get appropriate wallets based on environment
// For now, always use TestNet wallets (Pera, Defly, Exodus)
// To use LocalNet/KMD, you must start AlgoKit LocalNet first
export const getWalletList = (): WalletId[] => {
  // Always use browser wallets for TestNet
  // If you want to use LocalNet/KMD, start: algokit localnet start
  return [WalletId.PERA, WalletId.DEFLY, WalletId.EXODUS];
};

// Get wallet display names
export const getWalletDisplayName = (walletId: WalletId): string => {
  const names: Record<string, string> = {
    [WalletId.KMD]: 'KMD (LocalNet)',
    [WalletId.PERA]: 'Pera Wallet',
    [WalletId.DEFLY]: 'Defly Wallet',
    [WalletId.EXODUS]: 'Exodus Wallet',
  };
  return names[walletId] || walletId;
};

// Get wallet descriptions
export const getWalletDescription = (walletId: WalletId): string => {
  const descriptions: Record<string, string> = {
    [WalletId.KMD]: 'AlgoKit LocalNet Development Wallet',
    [WalletId.PERA]: 'Official Algorand Wallet (Recommended)',
    [WalletId.DEFLY]: 'Defly Wallet for Algorand',
    [WalletId.EXODUS]: 'Multi-chain Crypto Wallet',
  };
  return descriptions[walletId] || 'Algorand Wallet';
};

// Check if we should use LocalNet
export const shouldUseLocalNet = (): boolean => {
  // Only use LocalNet if explicitly set in environment or URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('network') === 'localnet';
};
