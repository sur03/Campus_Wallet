import { X } from 'lucide-react';
import { useWallet, WalletId } from '@txnlab/use-wallet-react';
import { useSnackbar } from 'notistack';
import { getWalletDisplayName, getWalletDescription, getWalletList } from '../utils/walletConfig';

interface WalletConnectionModalProps {
  onClose: () => void;
  onConnect: (walletAddress: string) => void;
}

export function WalletConnectionModal({ onClose, onConnect }: WalletConnectionModalProps) {
  const { wallets } = useWallet();
  const { enqueueSnackbar } = useSnackbar();

  const handleConnect = async (walletId: WalletId) => {
    try {
      const wallet = wallets?.find(w => w.id === walletId);
      
      if (!wallet) {
        enqueueSnackbar(`${getWalletDisplayName(walletId)} is not available`, { variant: 'warning' });
        return;
      }

      console.log('Connecting wallet:', walletId, 'Current state:', {
        isConnected: wallet.isConnected,
        isActive: wallet.isActive,
        accountsCount: wallet.accounts?.length
      });

      // If already connected with accounts, use existing connection
      if (wallet.isConnected && wallet.accounts && wallet.accounts.length > 0) {
        console.log('Wallet already connected, using existing connection');
        onConnect(wallet.accounts[0].address);
        enqueueSnackbar('Wallet already connected!', { variant: 'success' });
        return;
      }

      // Disconnect first if in a bad state
      if (wallet.isConnected && (!wallet.accounts || wallet.accounts.length === 0)) {
        console.log('Wallet in bad state, disconnecting first');
        try {
          await wallet.disconnect();
        } catch (e) {
          console.warn('Error disconnecting:', e);
        }
      }

      // Connect wallet
      console.log('Initiating wallet connection...');
      const accounts = await wallet.connect();
      
      console.log('Connection result:', {
        accountsReturned: accounts?.length,
        walletAccounts: wallet.accounts?.length
      });
      
      if (accounts && accounts.length > 0) {
        onConnect(accounts[0].address);
        enqueueSnackbar('Wallet connected successfully!', { variant: 'success' });
      } else if (wallet.accounts && wallet.accounts.length > 0) {
        onConnect(wallet.accounts[0].address);
        enqueueSnackbar('Wallet connected successfully!', { variant: 'success' });
      } else {
        enqueueSnackbar('No accounts found in wallet', { variant: 'warning' });
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      
      // Handle specific error types
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Ignore "Session currently connected" error
      if (errorMessage.includes('Session currently connected')) {
        const wallet = wallets?.find(w => w.id === walletId);
        if (wallet && wallet.accounts && wallet.accounts.length > 0) {
          onConnect(wallet.accounts[0].address);
          enqueueSnackbar('Wallet connected!', { variant: 'success' });
        }
        return;
      }
      
      if (errorMessage.includes('not available') || errorMessage.includes('not installed')) {
        enqueueSnackbar(`${getWalletDisplayName(walletId)} is not installed or available`, { variant: 'warning' });
      } else if (errorMessage.includes('rejected') || errorMessage.includes('cancelled')) {
        enqueueSnackbar('Connection cancelled by user', { variant: 'info' });
      } else {
        enqueueSnackbar(`Failed to connect: ${errorMessage}`, { variant: 'error' });
      }
    }
  };

  // Get available wallets based on environment
  const availableWalletIds = getWalletList();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
          <h2 className="text-2xl font-bold text-white">Connect Your Wallet</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-purple-300" />
          </button>
        </div>

        {/* Wallet Options */}
        <div className="p-6 space-y-4">
          {availableWalletIds.map((walletId) => (
            <button
              key={walletId}
              onClick={() => handleConnect(walletId)}
              className="w-full group p-5 bg-slate-900/50 hover:bg-slate-900 border border-purple-500/20 hover:border-purple-500/50 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600">
                  <span className="text-2xl">💳</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-white text-lg mb-1">
                    {getWalletDisplayName(walletId)}
                  </div>
                  <div className="text-sm text-purple-300">
                    {getWalletDescription(walletId)}
                  </div>
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  Connect
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-900/50 border-t border-purple-500/20">
          <p className="text-sm text-purple-300 text-center">
            By connecting a wallet, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
