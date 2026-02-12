/**
 * Contract Service
 * =================
 * 
 * Smart contract deployment and interaction.
 * All fund movements require wallet signatures - NO backend control.
 */

import algosdk from 'algosdk';
import { TransactionSigner } from '@txnlab/use-wallet-react';
import { AlgorandClient, algo } from '@algorandfoundation/algokit-utils';
import { getAlgorandClientConfig, getAlgodConfig } from '../utils/algorand';
import { DeploymentResult, TransactionResult } from '../types/campaign';

// TEAL programs (compiled from PyTeal)
// These will be loaded from the compiled .teal files
const APPROVAL_PROGRAM = `
#pragma version 8
// This is a placeholder - replace with actual compiled TEAL
// In production, load from campaign_escrow_approval.teal
int 1
return
`;

const CLEAR_PROGRAM = `
#pragma version 8
int 1
return
`;

/**
 * Get Algod client
 */
function getAlgodClient(): algosdk.Algodv2 {
    const config = getAlgodConfig();
    return new algosdk.Algodv2(
        config.token || '',
        config.baseServer,
        config.port || ''
    );
}

/**
 * Deploy a new campaign escrow contract
 * 
 * @param organizer - Campaign creator's wallet address
 * @param goalAmount - Target amount in ALGO
 * @param deadline - Unix timestamp
 * @param signer - Transaction signer from wallet
 * @returns Contract address and app ID
 */
export async function deployCampaignContract(params: {
    organizer: string;
    goalAmount: number;
    deadline: number;
    signer: TransactionSigner;
}): Promise<DeploymentResult> {
    try {
        const algodClient = getAlgodClient();

        console.log('🚀 Deploying campaign contract:', {
            organizer: params.organizer,
            goal: params.goalAmount,
            deadline: new Date(params.deadline * 1000).toISOString(),
        });

        // Compile TEAL programs
        const approvalCompiled = await algodClient.compile(APPROVAL_PROGRAM).do();
        const clearCompiled = await algodClient.compile(CLEAR_PROGRAM).do();

        const approvalProgram = new Uint8Array(
            Buffer.from(approvalCompiled.result, 'base64')
        );
        const clearProgram = new Uint8Array(
            Buffer.from(clearCompiled.result, 'base64')
        );

        // Get suggested params
        const suggestedParams = await algodClient.getTransactionParams().do();

        // Validate organizer address
        if (!params.organizer || params.organizer.trim() === '') {
            throw new Error('Organizer address is required. Please ensure your wallet is connected.');
        }

        // Validate address format
        if (!algosdk.isValidAddress(params.organizer)) {
            throw new Error(`Invalid organizer address: ${params.organizer}`);
        }

        // Encode application arguments
        const appArgs = [
            algosdk.decodeAddress(params.organizer).publicKey,
            algosdk.encodeUint64(params.goalAmount * 1_000_000), // Convert to microALGOs
            algosdk.encodeUint64(params.deadline),
        ];

        // Debug: Log the exact values being used
        console.log('📋 Transaction Parameters:', {
            sender: params.organizer,
            senderType: typeof params.organizer,
            senderLength: params.organizer?.length,
            suggestedParams: !!suggestedParams,
            approvalProgram: !!approvalProgram,
            clearProgram: !!clearProgram,
        });

        // Create application (using algosdk v3 API)
        const txn = algosdk.makeApplicationCreateTxnFromObject({
            sender: params.organizer,  // v3 uses 'sender' not 'from'
            suggestedParams,
            onComplete: algosdk.OnApplicationComplete.NoOpOC,
            approvalProgram,
            clearProgram,
            numLocalInts: 1, // contribution amount
            numLocalByteSlices: 0,
            numGlobalInts: 4, // goal, deadline, total, count
            numGlobalByteSlices: 1, // organizer address
            appArgs,
        });

        // Sign transaction
        const signedTxns = await params.signer([txn], [0]);

        // Submit transaction
        const sendResult = await algodClient.sendRawTransaction(signedTxns).do();
        const txId = sendResult.txId || sendResult.txid;

        console.log('📤 Deployment transaction sent:', txId);

        // Wait for confirmation
        const result = await algosdk.waitForConfirmation(algodClient, txId, 4);

        const appId = result.applicationIndex || result['application-index'];
        const contractAddress = algosdk.getApplicationAddress(appId).toString();

        console.log('✅ Contract deployed:', {
            appId,
            contractAddress,
            txId,
        });

        return {
            contractAddress,
            appId,
            txId,
        };
    } catch (error) {
        console.error('❌ Contract deployment failed:', error);
        throw new Error(`Contract deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Contribute funds to a campaign
 * 
 * @param contractAddress - Campaign contract address
 * @param amount - Contribution amount in ALGO
 * @param sender - Contributor's wallet address
 * @param signer - Transaction signer from wallet
 * @returns Transaction ID
 */
export async function contributeToContract(params: {
    contractAddress: string;
    appId: number;
    amount: number;
    sender: string;
    signer: TransactionSigner;
}): Promise<TransactionResult> {
    try {
        const algodClient = getAlgodClient();

        console.log('💰 Contributing to campaign:', {
            contract: params.contractAddress,
            amount: params.amount,
            sender: params.sender,
        });

        const suggestedParams = await algodClient.getTransactionParams().do();

        // Create payment transaction to contract
        const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
            sender: params.sender,  // v3 uses 'sender' not 'from'
            receiver: params.contractAddress,  // v3 uses 'receiver' not 'to'
            amount: params.amount * 1_000_000, // Convert to microALGOs
            suggestedParams,
        });

        // Create application call transaction (NoOp to record contribution)
        const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
            sender: params.sender,  // v3 uses 'sender' not 'from'
            appIndex: params.appId,
            suggestedParams,
        });

        // Group transactions
        const txnGroup = [paymentTxn, appCallTxn];
        algosdk.assignGroupID(txnGroup);

        // Sign transactions
        const signedTxns = await params.signer(txnGroup, [0, 1]);

        // Submit transactions
        const sendResult = await algodClient.sendRawTransaction(signedTxns).do();
        const txId = sendResult.txId || sendResult.txid;

        console.log('📤 Contribution transaction sent:', txId);

        // Wait for confirmation
        const result = await algosdk.waitForConfirmation(algodClient, txId, 4);

        console.log('✅ Contribution confirmed:', result);

        return {
            txId,
            confirmedRound: result.confirmedRound || result['confirmed-round'],
        };
    } catch (error) {
        console.error('❌ Contribution failed:', error);
        throw new Error(`Contribution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Withdraw funds (organizer only, after deadline, goal met)
 * 
 * @param appId - Application ID
 * @param organizer - Organizer's wallet address
 * @param signer - Transaction signer from wallet
 * @returns Transaction ID
 */
export async function withdrawFunds(params: {
    appId: number;
    organizer: string;
    signer: TransactionSigner;
}): Promise<TransactionResult> {
    try {
        const algodClient = getAlgodClient();

        console.log('💸 Withdrawing funds:', {
            appId: params.appId,
            organizer: params.organizer,
        });

        const suggestedParams = await algodClient.getTransactionParams().do();

        // Create DeleteApplication transaction (triggers withdrawal)
        const txn = algosdk.makeApplicationDeleteTxnFromObject({
            sender: params.organizer,  // v3 uses 'sender' not 'from'
            appIndex: params.appId,
            suggestedParams,
        });

        // Sign transaction
        const signedTxns = await params.signer([txn], [0]);

        // Submit transaction
        const sendResult = await algodClient.sendRawTransaction(signedTxns).do();
        const txId = sendResult.txId || sendResult.txid;

        console.log('📤 Withdrawal transaction sent:', txId);

        // Wait for confirmation
        const result = await algosdk.waitForConfirmation(algodClient, txId, 4);

        console.log('✅ Withdrawal confirmed:', result);

        return {
            txId,
            confirmedRound: result.confirmedRound || result['confirmed-round'],
        };
    } catch (error) {
        console.error('❌ Withdrawal failed:', error);
        throw new Error(`Withdrawal failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Claim refund (contributor only, after deadline, goal not met)
 * 
 * @param appId - Application ID
 * @param contributor - Contributor's wallet address
 * @param signer - Transaction signer from wallet
 * @returns Transaction ID
 */
export async function claimRefund(params: {
    appId: number;
    contributor: string;
    signer: TransactionSigner;
}): Promise<TransactionResult> {
    try {
        const algodClient = getAlgodClient();

        console.log('🔄 Claiming refund:', {
            appId: params.appId,
            contributor: params.contributor,
        });

        const suggestedParams = await algodClient.getTransactionParams().do();

        // Create CloseOut transaction (triggers refund)
        const txn = algosdk.makeApplicationCloseOutTxnFromObject({
            sender: params.contributor,  // v3 uses 'sender' not 'from'
            appIndex: params.appId,
            suggestedParams,
        });

        // Sign transaction
        const signedTxns = await params.signer([txn], [0]);

        // Submit transaction
        const sendResult = await algodClient.sendRawTransaction(signedTxns).do();
        const txId = sendResult.txId || sendResult.txid;

        console.log('📤 Refund transaction sent:', txId);

        // Wait for confirmation
        const result = await algosdk.waitForConfirmation(algodClient, txId, 4);

        console.log('✅ Refund confirmed:', result);

        return {
            txId,
            confirmedRound: result.confirmedRound || result['confirmed-round'],
        };
    } catch (error) {
        console.error('❌ Refund failed:', error);
        throw new Error(`Refund failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Opt-in to application (required before contributing)
 */
export async function optInToApp(params: {
    appId: number;
    sender: string;
    signer: TransactionSigner;
}): Promise<TransactionResult> {
    try {
        const algodClient = getAlgodClient();

        const suggestedParams = await algodClient.getTransactionParams().do();

        const txn = algosdk.makeApplicationOptInTxnFromObject({
            sender: params.sender,  // v3 uses 'sender' not 'from'
            appIndex: params.appId,
            suggestedParams,
        });

        const signedTxns = await params.signer([txn], [0]);
        const sendResult = await algodClient.sendRawTransaction(signedTxns).do();
        const txId = sendResult.txId || sendResult.txid;

        await algosdk.waitForConfirmation(algodClient, txId, 4);

        return { txId };
    } catch (error) {
        console.error('❌ Opt-in failed:', error);
        throw new Error(`Opt-in failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
