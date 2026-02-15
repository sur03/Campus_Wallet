/**
 * SplitDetail Component
 * ======================
 * 
 * Display split details and track participant payments.
 * Auto-refreshes payment status every 15 seconds via blockchain queries.
 */

import { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { ArrowLeft, Copy, CheckCircle2, Clock, ExternalLink, Users, DollarSign, Calendar, Loader2, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { getSplitById } from '../../utils/splitStorage';
import { fetchParticipantPayments, getExplorerUrl, formatAddress } from '../../utils/splitUtils';
import { Split, ParticipantStatus } from '../../types/split';
import { createSplitNote } from '../../utils/splitUtils';
import algosdk from 'algosdk';
import { useSnackbar } from 'notistack';

interface SplitDetailProps {
    expenseId: string;
    onBack: () => void;
}

export function SplitDetail({ expenseId, onBack }: SplitDetailProps) {
    const { activeAddress, transactionSigner } = useWallet();
    const { enqueueSnackbar } = useSnackbar();
    const [split, setSplit] = useState<Split | null>(null);
    const [participantStatuses, setParticipantStatuses] = useState<ParticipantStatus[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
    const [copied, setCopied] = useState(false);
    const [isPaying, setIsPaying] = useState(false);

    // Load split data
    useEffect(() => {
        const splitData = getSplitById(expenseId);
        if (splitData) {
            setSplit(splitData);
        }
    }, [expenseId]);

    // Fetch payment status
    const fetchPaymentStatus = async (splitData: Split) => {
        setIsRefreshing(true);
        try {
            const payments = await fetchParticipantPayments(
                splitData.createdBy,
                splitData.expenseId,
                splitData.participants,
                splitData.sharePerPerson
            );

            const statuses: ParticipantStatus[] = splitData.participants.map(address => ({
                address,
                paid: payments.has(address),
                transactionId: payments.get(address)?.txId,
                paidAt: payments.get(address)?.timestamp,
            }));

            setParticipantStatuses(statuses);
            setLastRefresh(Date.now());
        } catch (error) {
            console.error('Error fetching payment status:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Initial fetch and auto-refresh
    useEffect(() => {
        if (!split) return;

        // Initial fetch
        fetchPaymentStatus(split);

        // Auto-refresh every 15 seconds
        const interval = setInterval(() => {
            fetchPaymentStatus(split);
        }, 15000);

        return () => clearInterval(interval);
    }, [split]);

    // Copy payment note to clipboard
    const handleCopyNote = () => {
        if (!split) return;

        const noteBytes = createSplitNote(split.expenseId, split.title, split.createdBy);
        const noteText = new TextDecoder().decode(noteBytes);

        navigator.clipboard.writeText(noteText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Handle in-app payment
    const handlePaySplit = async () => {
        if (!split || !activeAddress || !transactionSigner) {
            enqueueSnackbar('Please connect your wallet to pay', { variant: 'warning' });
            return;
        }

        // Check if user is the creator
        if (activeAddress === split.createdBy) {
            enqueueSnackbar('You cannot pay your own split', { variant: 'warning' });
            return;
        }

        // Check if user is a participant
        if (!split.participants.includes(activeAddress)) {
            enqueueSnackbar('You are not a participant in this split', { variant: 'warning' });
            return;
        }

        setIsPaying(true);

        try {
            // Create Algorand client
            const algodClient = new algosdk.Algodv2(
                '',
                'https://testnet-api.algonode.cloud',
                ''
            );

            // Get suggested params
            const suggestedParams = await algodClient.getTransactionParams().do();

            // Create payment note
            const noteBytes = createSplitNote(split.expenseId, split.title, split.createdBy);

            // Create payment transaction
            const amountInMicroAlgos = Math.round(split.sharePerPerson * 1_000_000);
            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: activeAddress,
                receiver: split.createdBy,
                amount: amountInMicroAlgos,
                note: noteBytes,
                suggestedParams,
            });

            // Sign transaction
            console.log('🔐 Signing payment transaction...');
            const signedTxns = await transactionSigner([txn], [0]);

            // Get transaction ID from the transaction object
            const txId = txn.txID().toString();
            console.log('Transaction ID:', txId);

            // Send transaction
            console.log('📤 Sending payment to blockchain...');
            await algodClient.sendRawTransaction(signedTxns[0]).do();

            console.log('✅ Payment sent! TX ID:', txId);
            enqueueSnackbar(`Payment sent successfully! TX: ${txId.substring(0, 8)}...`, { variant: 'success' });

            // Wait for confirmation
            await algosdk.waitForConfirmation(algodClient, txId, 4);

            console.log('✅ Payment confirmed on blockchain');
            enqueueSnackbar('Payment confirmed! Refreshing status...', { variant: 'success' });

            // Refresh payment status
            setTimeout(() => {
                if (split) fetchPaymentStatus(split);
            }, 2000);

        } catch (error) {
            console.error('❌ Payment failed:', error);

            // Check for specific error types
            let errorMessage = 'Unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;

                // Handle specific wallet errors
                if (errorMessage.includes('Transaction request pending')) {
                    errorMessage = 'Please wait - another transaction is in progress. Try again in a moment.';
                } else if (errorMessage.includes('User rejected')) {
                    errorMessage = 'You cancelled the transaction';
                } else if (errorMessage.includes('Insufficient funds')) {
                    errorMessage = 'Insufficient ALGO balance in your wallet';
                }
            }

            enqueueSnackbar(`Payment failed: ${errorMessage}`, { variant: 'error' });
        } finally {
            setIsPaying(false);
        }
    };

    // Calculate statistics
    const paidCount = participantStatuses.filter(p => p.paid).length;
    const totalCollected = paidCount * (split?.sharePerPerson || 0);
    const progressPercentage = split ? (paidCount / split.participants.length) * 100 : 0;

    if (!split) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertDescription>Split expense not found.</AlertDescription>
                </Alert>
                <Button onClick={onBack} className="mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Splits
                </Button>
            </div>
        );
    }

    const isCreator = activeAddress === split.createdBy;

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-6">
                <Button variant="ghost" onClick={onBack} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Splits
                </Button>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{split.title}</h1>
                        <p className="text-muted-foreground mt-2">
                            Created {new Date(split.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    {isCreator && (
                        <Badge variant="secondary" className="ml-4">
                            <Users className="w-3 h-3 mr-1" />
                            Creator
                        </Badge>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <DollarSign className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Amount</p>
                                    <p className="text-2xl font-bold">{split.totalAmount} ALGO</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Users className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Per Person</p>
                                    <p className="text-2xl font-bold">{split.sharePerPerson.toFixed(6)} ALGO</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-500/10">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Collected</p>
                                    <p className="text-2xl font-bold">{totalCollected.toFixed(6)} ALGO</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Payment Progress */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Payment Progress</CardTitle>
                                <CardDescription>
                                    {paidCount} of {split.participants.length} participants paid
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchPaymentStatus(split)}
                                disabled={isRefreshing}
                            >
                                {isRefreshing ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Clock className="w-4 h-4 mr-2" />
                                )}
                                Refresh
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="w-full bg-muted rounded-full h-3">
                                    <div
                                        className="bg-primary h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground text-right">
                                    {progressPercentage.toFixed(0)}% Complete • Last updated{' '}
                                    {new Date(lastRefresh).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Participant List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Participants</CardTitle>
                        <CardDescription>Payment status for each participant</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {participantStatuses.map((status) => (
                                <div
                                    key={status.address}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-mono text-sm truncate">{status.address}</p>
                                        {status.paidAt && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Paid on {new Date(status.paidAt * 1000).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 ml-4">
                                        {status.paid ? (
                                            <>
                                                <Badge variant="default" className="bg-green-500">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    Paid
                                                </Badge>
                                                {status.transactionId && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => window.open(getExplorerUrl(status.transactionId!), '_blank')}
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </>
                                        ) : (
                                            <Badge variant="secondary">
                                                <Clock className="w-3 h-3 mr-1" />
                                                Pending
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Instructions (for participants who haven't paid) */}
                {!isCreator && (() => {
                    const currentUserStatus = participantStatuses.find(p => p.address === activeAddress);
                    const hasAlreadyPaid = currentUserStatus?.paid || false;

                    if (hasAlreadyPaid) {
                        // Show payment completed message
                        return (
                            <Card className="border-green-500/20 bg-green-500/5">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        <CardTitle>Payment Completed</CardTitle>
                                    </div>
                                    <CardDescription>You have successfully paid your share</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Amount Paid:</span>
                                        <span className="font-mono font-bold">{split.sharePerPerson.toFixed(6)} ALGO</span>
                                    </div>
                                    {currentUserStatus?.paidAt && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Paid On:</span>
                                            <span>{new Date(currentUserStatus.paidAt * 1000).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    {currentUserStatus?.transactionId && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full mt-2"
                                            onClick={() => window.open(getExplorerUrl(currentUserStatus.transactionId!), '_blank')}
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            View Transaction on Explorer
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    }

                    // Show payment instructions for unpaid participants
                    return (
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                                <CardTitle>How to Pay Your Share</CardTitle>
                                <CardDescription>Follow these steps to complete your payment</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">1. Amount to Send</Label>
                                    <div className="p-3 bg-background rounded-md font-mono font-bold text-lg">
                                        {split.sharePerPerson.toFixed(6)} ALGO
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">2. Send to Address</Label>
                                    <div className="p-3 bg-background rounded-md font-mono text-sm break-all">
                                        {split.createdBy}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">3. Transaction Note (Required)</Label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 p-3 bg-background rounded-md font-mono text-xs break-all">
                                            {new TextDecoder().decode(createSplitNote(split.expenseId, split.title, split.createdBy))}
                                        </div>
                                        <Button variant="outline" size="sm" onClick={handleCopyNote}>
                                            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <Alert>
                                    <AlertDescription>
                                        Your payment will be automatically detected within 15 seconds after confirmation on the blockchain.
                                    </AlertDescription>
                                </Alert>

                                {/* Pay Now Button */}
                                <div className="pt-4">
                                    <Button
                                        onClick={handlePaySplit}
                                        disabled={isPaying}
                                        size="lg"
                                        className="w-full"
                                    >
                                        {isPaying ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Processing Payment...
                                            </>
                                        ) : (
                                            <>
                                                <Wallet className="w-5 h-5 mr-2" />
                                                Pay Now ({split.sharePerPerson.toFixed(6)} ALGO)
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-xs text-muted-foreground text-center mt-2">
                                        Click to pay instantly using your connected wallet
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })()}

                {/* Split Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Split Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Expense ID:</span>
                            <span className="font-mono">{split.expenseId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Creator:</span>
                            <span className="font-mono">{formatAddress(split.createdBy)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Participants:</span>
                            <span>{split.participants.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Created:</span>
                            <span>{new Date(split.createdAt).toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <label className={`block text-sm font-medium ${className}`}>{children}</label>;
}
