import { useState } from 'react';
import { ArrowLeft, Send, Wallet, AlertCircle, CheckCircle, LogOut } from 'lucide-react';
import { useWallet } from '@txnlab/use-wallet-react';
import { useSnackbar } from 'notistack';
import { algo, AlgorandClient } from '@algorandfoundation/algokit-utils';
import algosdk from 'algosdk';
import { getAlgorandClientConfig } from '../utils/algorand';

interface SendPaymentProps {
  onBack: () => void;
  onLogout: () => void;
  onTransactionSuccess?: () => void;
}

export function SendPayment({ onBack, onLogout, onTransactionSuccess }: SendPaymentProps) {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const { activeAddress, transactionSigner, wallets } = useWallet();
  const { enqueueSnackbar } = useSnackbar();

  // Check if wallet is properly connected
  const isWalletConnected = () => {
    const activeWallet = wallets?.find(w => w.isActive);
    const isConnected = activeWallet?.isConnected ?? false;
    const hasAddress = !!activeAddress;
    const hasSigner = !!transactionSigner;
    
    console.log('Wallet Connection Status:', {
      activeWallet: activeWallet?.id,
      isConnected,
      hasAddress,
      hasSigner,
      address: activeAddress
    });
    
    return hasAddress && hasSigner && isConnected;
  };

  // Validate Algorand address
  const isValidAddress = (address: string): boolean => {
    if (address.length !== 58) return false;
    try {
      algosdk.decodeAddress(address);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!recipientAddress || !amount) {
      setError('Please fill in all fields');
      return;
    }

    if (!isValidAddress(recipientAddress)) {
      setError('Invalid Algorand address (must be 58 characters)');
      return;
    }
    
    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    // Check if wallet is properly connected
    const activeWallet = wallets?.find(w => w.isActive);
    
    if (!activeWallet) {
      setError('No wallet connected. Please connect your wallet first.');
      enqueueSnackbar('Please connect your wallet', { variant: 'warning' });
      return;
    }

    if (!activeWallet.isConnected) {
      setError('Wallet not connected. Please reconnect your wallet.');
      enqueueSnackbar('Please reconnect your wallet', { variant: 'warning' });
      return;
    }

    if (!transactionSigner || !activeAddress) {
      setError('Transaction signer not available. Please reconnect your wallet.');
      enqueueSnackbar('Wallet signer not ready', { variant: 'warning' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get Algorand configuration
      const algodConfig = getAlgorandClientConfig();
      
      console.log('🔍 Algod Config:', algodConfig);
      
      // Create AlgorandClient with proper config format
      const algorand = AlgorandClient.fromConfig({
        algodConfig: algodConfig
      });
      
      console.log('📤 Sending payment:', {
        from: activeAddress,
        to: recipientAddress,
        amount: parseFloat(amount)
      });

      // Send payment
      const result = await algorand.send.payment({
        sender: activeAddress,
        receiver: recipientAddress,
        amount: algo(parseFloat(amount)),
        signer: transactionSigner,
      });
      
      const txId = result.txIds[0];
      
      console.log('✅ Transaction successful:', txId);
      
      setShowSuccess(true);
      enqueueSnackbar(`Transaction sent! TX ID: ${txId}`, { variant: 'success' });
      
      // Clear form and navigate back after showing success
      setTimeout(() => {
        setShowSuccess(false);
        setRecipientAddress('');
        setAmount('');
        
        // Trigger refresh and navigate back to dashboard
        if (onTransactionSuccess) {
          onTransactionSuccess();
        }
        
        // Navigate back to dashboard to see updated transactions
        setTimeout(() => {
          onBack();
        }, 500);
      }, 2000);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Transaction failed';
      console.error('Transaction error:', e);
      
      if (errorMessage.includes('overspend')) {
        setError('Insufficient balance. Check your wallet balance.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setError('Network error. Please check your connection.');
      } else if (errorMessage.includes('rejected') || errorMessage.includes('cancelled')) {
        setError('Transaction cancelled by user');
      } else {
        setError(`Transaction failed: ${errorMessage}`);
      }
      
      enqueueSnackbar(`Transaction failed: ${errorMessage}`, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-white rounded-lg border border-purple-500/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-white rounded-lg border border-purple-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Page Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4 shadow-lg shadow-purple-500/50">
            <Send className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Send Payment</h1>
          <p className="text-purple-300">Transfer ALGO to another wallet</p>
        </div>

        {/* Wallet Connection Warning */}
        {!isWalletConnected() && (
          <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-yellow-300 font-medium">Wallet Not Properly Connected</p>
              <p className="text-yellow-400 text-sm">Please disconnect and reconnect your wallet to enable transactions.</p>
            </div>
          </div>
        )}

        {/* Payment Form */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-purple-500/20">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left Column - Recipient Address */}
              <div>
                <label htmlFor="recipient" className="block text-sm font-medium text-purple-300 mb-2">
                  Recipient Wallet Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Wallet className="w-5 h-5 text-purple-400" />
                  </div>
                  <input
                    id="recipient"
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                    placeholder="Enter wallet address"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-purple-400">
                  Double check the address before sending
                </p>
              </div>

              {/* Right Column - Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-purple-300 mb-2">
                  Amount (ALGO)
                </label>
                <div className="relative">
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-4 pr-20 py-4 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                    placeholder="0.00"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-purple-600/30 rounded-md">
                    <span className="text-purple-300 font-medium">ALGO</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-purple-400">
                  Network fee: ~0.001 ALGO
                </p>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-purple-500/20">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-purple-300">Network Fee</span>
                <span className="text-white">0.001 ALGO</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-purple-300">Total Amount</span>
                <span className="text-white font-medium">
                  {amount ? (parseFloat(amount) + 0.001).toFixed(3) : '0.000'} ALGO
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-green-300">Transaction submitted successfully!</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-medium rounded-lg shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Payment
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300 text-center">
              🔒 All transactions are secured using blockchain technology
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
