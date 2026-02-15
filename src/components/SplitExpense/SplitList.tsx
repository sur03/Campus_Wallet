/**
 * SplitList Component
 * ====================
 * 
 * Display and filter split expenses.
 * Shows splits created by user or where user is a participant.
 */

import { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { Plus, Users, Calendar, DollarSign, ArrowRight, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { getAllSplits, getSplitsByCreator, getSplitsByParticipant } from '../../utils/splitStorage';
import { Split } from '../../types/split';
import { fetchParticipantPayments } from '../../utils/splitUtils';

interface SplitListProps {
    onCreateNew: () => void;
    onViewDetails: (expenseId: string) => void;
}

export function SplitList({ onCreateNew, onViewDetails }: SplitListProps) {
    const { activeAddress } = useWallet();
    const [allSplits, setAllSplits] = useState<Split[]>([]);
    const [createdSplits, setCreatedSplits] = useState<Split[]>([]);
    const [participatingSplits, setParticipatingSplits] = useState<Split[]>([]);
    const [completedSplits, setCompletedSplits] = useState<Split[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'created' | 'participating' | 'completed'>('all');

    // Load splits and check payment status
    useEffect(() => {
        if (!activeAddress) return;

        const loadSplitsAndCheckPayments = async () => {
            const all = getAllSplits();
            const created = getSplitsByCreator(activeAddress);
            const participating = getSplitsByParticipant(activeAddress);

            // Sort by creation date (newest first)
            const sortBySplits = (splits: Split[]) =>
                [...splits].sort((a, b) => b.createdAt - a.createdAt);

            // Check payment status for participating splits to identify completed ones
            const completed: Split[] = [];
            const pending: Split[] = [];

            for (const split of participating) {
                // Skip if current user is the creator
                if (split.createdBy === activeAddress) continue;

                try {
                    // Check if current user has paid
                    const payments = await fetchParticipantPayments(
                        split.createdBy,
                        split.expenseId,
                        [activeAddress],
                        split.sharePerPerson
                    );

                    if (payments.has(activeAddress)) {
                        completed.push(split);
                    } else {
                        pending.push(split);
                    }
                } catch (error) {
                    console.error('Error checking payment status:', error);
                    // If error, assume not paid yet
                    pending.push(split);
                }
            }

            setAllSplits(sortBySplits(all));
            setCreatedSplits(sortBySplits(created));
            setParticipatingSplits(sortBySplits(pending));
            setCompletedSplits(sortBySplits(completed));
        };

        loadSplitsAndCheckPayments();
    }, [activeAddress]);

    if (!activeAddress) {
        return (
            <div className="p-8">
                <Alert>
                    <AlertDescription>Please connect your wallet to view split expenses.</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Split Expenses</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage and track expense splits with blockchain verification
                        </p>
                    </div>
                    <Button onClick={onCreateNew}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Split
                    </Button>
                </div>
            </div>

            {/* Tabs and Content */}
            <div className="max-w-6xl mx-auto">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                    <TabsList className="grid w-full max-w-2xl grid-cols-4">
                        <TabsTrigger value="all">
                            All ({allSplits.length})
                        </TabsTrigger>
                        <TabsTrigger value="created">
                            Created ({createdSplits.length})
                        </TabsTrigger>
                        <TabsTrigger value="participating">
                            Participating ({participatingSplits.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed">
                            Completed ({completedSplits.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-6">
                        <SplitGrid
                            splits={allSplits}
                            currentUserAddress={activeAddress}
                            onViewDetails={onViewDetails}
                            emptyMessage="No split expenses yet. Create your first split to get started!"
                        />
                    </TabsContent>

                    <TabsContent value="created" className="mt-6">
                        <SplitGrid
                            splits={createdSplits}
                            currentUserAddress={activeAddress}
                            onViewDetails={onViewDetails}
                            emptyMessage="You haven't created any splits yet."
                        />
                    </TabsContent>

                    <TabsContent value="participating" className="mt-6">
                        <SplitGrid
                            splits={participatingSplits}
                            currentUserAddress={activeAddress}
                            onViewDetails={onViewDetails}
                            emptyMessage="You're not participating in any pending splits."
                        />
                    </TabsContent>

                    <TabsContent value="completed" className="mt-6">
                        <SplitGrid
                            splits={completedSplits}
                            currentUserAddress={activeAddress}
                            onViewDetails={onViewDetails}
                            emptyMessage="You haven't completed any splits yet."
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

// Split Grid Component
interface SplitGridProps {
    splits: Split[];
    currentUserAddress: string;
    onViewDetails: (expenseId: string) => void;
    emptyMessage: string;
}

function SplitGrid({ splits, currentUserAddress, onViewDetails, emptyMessage }: SplitGridProps) {
    if (splits.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">{emptyMessage}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {splits.map((split) => (
                <SplitCard
                    key={split.expenseId}
                    split={split}
                    isCreator={split.createdBy === currentUserAddress}
                    onViewDetails={onViewDetails}
                />
            ))}
        </div>
    );
}

// Split Card Component
interface SplitCardProps {
    split: Split;
    isCreator: boolean;
    onViewDetails: (expenseId: string) => void;
}

function SplitCard({ split, isCreator, onViewDetails }: SplitCardProps) {
    return (
        <Card className="hover:border-primary/50 transition-all cursor-pointer group">
            <CardHeader onClick={() => onViewDetails(split.expenseId)}>
                <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg line-clamp-1">{split.title}</CardTitle>
                    {isCreator ? (
                        <Badge variant="default" className="ml-2 shrink-0">Creator</Badge>
                    ) : (
                        <Badge variant="secondary" className="ml-2 shrink-0">Participant</Badge>
                    )}
                </div>
                <CardDescription className="flex items-center gap-2 text-xs">
                    <Calendar className="w-3 h-3" />
                    {new Date(split.createdAt).toLocaleDateString()}
                </CardDescription>
            </CardHeader>

            <CardContent onClick={() => onViewDetails(split.expenseId)}>
                <div className="space-y-3">
                    {/* Amount Info */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Total Amount
                        </span>
                        <span className="font-semibold">{split.totalAmount} ALGO</span>
                    </div>

                    {/* Per Person */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Per Person</span>
                        <span className="font-semibold text-primary">
                            {split.sharePerPerson.toFixed(6)} ALGO
                        </span>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Participants
                        </span>
                        <span>{split.participants.length}</span>
                    </div>

                    {/* View Details Button */}
                    <Button
                        variant="outline"
                        className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(split.expenseId);
                        }}
                    >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
