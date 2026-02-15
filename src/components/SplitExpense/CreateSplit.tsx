/**
 * CreateSplit Component
 * ======================
 * 
 * Form for creating new expense splits.
 * Validates addresses, prevents duplicates, calculates equal splits.
 */

import { useState } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { ArrowLeft, Plus, X, AlertCircle, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { saveSplit } from '../../utils/splitStorage';
import { generateExpenseId, isValidAlgorandAddress } from '../../utils/splitUtils';
import { Split } from '../../types/split';

interface CreateSplitProps {
    onBack: () => void;
    onSplitCreated: (expenseId: string) => void;
}

export function CreateSplit({ onBack, onSplitCreated }: CreateSplitProps) {
    const { activeAddress } = useWallet();

    const [title, setTitle] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [participants, setParticipants] = useState<string[]>([]);
    const [currentAddress, setCurrentAddress] = useState('');
    const [error, setError] = useState('');
    const [addressError, setAddressError] = useState('');

    // Calculate split preview
    const totalPeople = participants.length + 1; // +1 for creator
    const sharePerPerson = totalAmount ? parseFloat(totalAmount) / totalPeople : 0;

    // Validate participant address input
    const validateAddress = (address: string): string => {
        if (!address.trim()) return '';

        if (address === activeAddress) {
            return 'Cannot add yourself as a participant';
        }

        if (!isValidAlgorandAddress(address)) {
            return 'Invalid Algorand address (must be 58 characters)';
        }

        if (participants.includes(address)) {
            return 'Address already added';
        }

        return '';
    };

    // Add participant
    const handleAddParticipant = () => {
        const trimmedAddress = currentAddress.trim();
        const validationError = validateAddress(trimmedAddress);

        if (validationError) {
            setAddressError(validationError);
            return;
        }

        setParticipants([...participants, trimmedAddress]);
        setCurrentAddress('');
        setAddressError('');
    };

    // Remove participant
    const handleRemoveParticipant = (address: string) => {
        setParticipants(participants.filter(p => p !== address));
    };

    // Handle address input change
    const handleAddressChange = (value: string) => {
        setCurrentAddress(value);
        if (addressError) {
            setAddressError('');
        }
    };

    // Validate and create split
    const handleCreateSplit = () => {
        setError('');

        // Validation
        if (!title.trim()) {
            setError('Please enter a title for the expense');
            return;
        }

        const amount = parseFloat(totalAmount);
        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid amount greater than 0');
            return;
        }

        if (participants.length === 0) {
            setError('Please add at least one participant');
            return;
        }

        if (!activeAddress) {
            setError('Wallet not connected');
            return;
        }

        // Create split object
        const expenseId = generateExpenseId();
        const split: Split = {
            expenseId,
            title: title.trim(),
            totalAmount: amount,
            sharePerPerson,
            createdBy: activeAddress,
            participants,
            createdAt: Date.now(),
        };

        // Save to localStorage
        saveSplit(split);

        // Navigate to detail view
        onSplitCreated(expenseId);
    };

    if (!activeAddress) {
        return (
            <div className="p-8">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Please connect your wallet to create a split expense.</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            {/* Header */}
            <div className="max-w-3xl mx-auto mb-6">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <h1 className="text-3xl font-bold text-foreground">Create Split Expense</h1>
                <p className="text-muted-foreground mt-2">
                    Split an expense equally among participants with blockchain verification
                </p>
            </div>

            {/* Main Form */}
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Basic Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Expense Details</CardTitle>
                        <CardDescription>Enter the expense information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Dinner at Restaurant, Team Event, etc."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label htmlFor="amount">Total Amount (ALGO)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={totalAmount}
                                onChange={(e) => setTotalAmount(e.target.value)}
                                className="mt-1.5"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Participants Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Participants</CardTitle>
                        <CardDescription>
                            Add wallet addresses of people who will pay their share
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Add Participant Input */}
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    placeholder="Enter Algorand wallet address (58 characters)"
                                    value={currentAddress}
                                    onChange={(e) => handleAddressChange(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()}
                                    className={addressError ? 'border-destructive' : ''}
                                />
                                {addressError && (
                                    <p className="text-sm text-destructive mt-1.5">{addressError}</p>
                                )}
                            </div>
                            <Button
                                onClick={handleAddParticipant}
                                disabled={!currentAddress.trim()}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add
                            </Button>
                        </div>

                        {/* Participant List */}
                        {participants.length > 0 && (
                            <div className="space-y-2 mt-4">
                                <Label>Added Participants ({participants.length})</Label>
                                <div className="border rounded-md divide-y">
                                    {participants.map((address) => (
                                        <div
                                            key={address}
                                            className="flex items-center justify-between p-3 hover:bg-muted/50"
                                        >
                                            <span className="font-mono text-sm truncate flex-1">
                                                {address}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveParticipant(address)}
                                                className="ml-2"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Creator Info */}
                        <Alert>
                            <Users className="h-4 w-4" />
                            <AlertDescription>
                                You (creator) are automatically included in the split calculation.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                {/* Split Preview Card */}
                {totalAmount && participants.length > 0 && (
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle>Split Preview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Amount:</span>
                                <span className="font-semibold">{totalAmount} ALGO</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total People:</span>
                                <span className="font-semibold">{totalPeople} (You + {participants.length} participants)</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-3">
                                <span>Each Person Pays:</span>
                                <span className="text-primary">{sharePerPerson.toFixed(6)} ALGO</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onBack}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateSplit}
                        disabled={!title || !totalAmount || participants.length === 0}
                        className="flex-1"
                    >
                        Create Split Expense
                    </Button>
                </div>
            </div>
        </div>
    );
}
