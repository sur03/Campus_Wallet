"""
Campaign Escrow Smart Contract
===============================

This PyTeal contract implements a crowdfunding escrow for campus club campaigns.

RULES (IMMUTABLE ONCE DEPLOYED):
1. Accept contributions before deadline
2. If goal met after deadline: organizer can withdraw all funds
3. If goal NOT met after deadline: contributors can claim refunds
4. NO admin override, NO rule changes, NO early withdrawal

Contract Parameters (set at deployment):
- organizer_address: Campaign creator's wallet
- goal_amount: Target amount in microALGOs
- deadline: Unix timestamp

Global State:
- total_collected: Running total of contributions
- contributor_count: Number of unique contributors

Local State (per contributor):
- contribution_amount: Amount contributed by this address
"""

from pyteal import *


def campaign_escrow_contract():
    """
    Main approval program for campaign escrow.
    
    Transaction Types:
    1. ApplicationCall (NoOp) - Contribute funds
    2. ApplicationCall (CloseOut) - Claim refund
    3. ApplicationCall (DeleteApplication) - Withdraw funds (organizer only)
    """
    
    # Global state keys
    key_organizer = Bytes("organizer")
    key_goal = Bytes("goal")
    key_deadline = Bytes("deadline")
    key_total_collected = Bytes("total")
    key_contributor_count = Bytes("count")
    
    # Local state keys
    key_contribution = Bytes("contribution")
    
    # Get current timestamp
    current_time = Global.latest_timestamp()
    
    # Application creation (deployment)
    on_creation = Seq([
        # Validate creation arguments
        Assert(Txn.application_args.length() == Int(3)),
        
        # Store contract parameters
        App.globalPut(key_organizer, Txn.application_args[0]),
        App.globalPut(key_goal, Btoi(Txn.application_args[1])),
        App.globalPut(key_deadline, Btoi(Txn.application_args[2])),
        
        # Initialize state
        App.globalPut(key_total_collected, Int(0)),
        App.globalPut(key_contributor_count, Int(0)),
        
        Approve()
    ])
    
    # Opt-in (contributor registration)
    on_opt_in = Seq([
        # Initialize contributor's local state
        App.localPut(Txn.sender(), key_contribution, Int(0)),
        Approve()
    ])
    
    # Contribution logic (NoOp call with payment)
    contribute = Seq([
        # Validate conditions
        Assert(current_time < App.globalGet(key_deadline)),  # Before deadline
        Assert(Gtxn[0].type_enum() == TxnType.Payment),      # Payment transaction
        Assert(Gtxn[0].receiver() == Global.current_application_address()),  # To contract
        Assert(Gtxn[0].amount() > Int(0)),                   # Positive amount
        
        # Check if first contribution (need to opt-in)
        If(
            App.localGet(Txn.sender(), key_contribution) == Int(0),
            # First contribution - increment contributor count
            App.globalPut(
                key_contributor_count,
                App.globalGet(key_contributor_count) + Int(1)
            )
        ),
        
        # Update contributor's total
        App.localPut(
            Txn.sender(),
            key_contribution,
            App.localGet(Txn.sender(), key_contribution) + Gtxn[0].amount()
        ),
        
        # Update global total
        App.globalPut(
            key_total_collected,
            App.globalGet(key_total_collected) + Gtxn[0].amount()
        ),
        
        Approve()
    ])
    
    # Withdrawal logic (organizer only, after deadline, goal met)
    withdraw = Seq([
        # Validate conditions
        Assert(current_time >= App.globalGet(key_deadline)),  # After deadline
        Assert(App.globalGet(key_total_collected) >= App.globalGet(key_goal)),  # Goal met
        Assert(Txn.sender() == App.globalGet(key_organizer)),  # Organizer only
        
        # Transfer all funds to organizer
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: App.globalGet(key_organizer),
            TxnField.amount: App.globalGet(key_total_collected),
            TxnField.fee: Int(0),  # Caller pays fee
        }),
        InnerTxnBuilder.Submit(),
        
        Approve()
    ])
    
    # Refund logic (contributor only, after deadline, goal NOT met)
    refund = Seq([
        # Validate conditions
        Assert(current_time >= App.globalGet(key_deadline)),  # After deadline
        Assert(App.globalGet(key_total_collected) < App.globalGet(key_goal)),  # Goal NOT met
        Assert(App.localGet(Txn.sender(), key_contribution) > Int(0)),  # Has contribution
        
        # Get refund amount
        refund_amount := App.localGet(Txn.sender(), key_contribution),
        
        # Transfer refund to contributor
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: Txn.sender(),
            TxnField.amount: refund_amount.load(),
            TxnField.fee: Int(0),  # Caller pays fee
        }),
        InnerTxnBuilder.Submit(),
        
        # Clear contributor's state
        App.localPut(Txn.sender(), key_contribution, Int(0)),
        
        # Update global total
        App.globalPut(
            key_total_collected,
            App.globalGet(key_total_collected) - refund_amount.load()
        ),
        
        Approve()
    ])
    
    # Main program logic
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnComplete.OptIn, on_opt_in],
        [Txn.on_completion() == OnComplete.NoOp, contribute],
        [Txn.on_completion() == OnComplete.DeleteApplication, withdraw],
        [Txn.on_completion() == OnComplete.CloseOut, refund],
    )
    
    return program


def clear_state_program():
    """
    Clear state program (always approve).
    Users can always remove the app from their account.
    """
    return Approve()


if __name__ == "__main__":
    # Compile approval program
    approval_program = campaign_escrow_contract()
    print("Approval Program:")
    print(compileTeal(approval_program, mode=Mode.Application, version=8))
    
    print("\n" + "="*80 + "\n")
    
    # Compile clear state program
    clear_program = clear_state_program()
    print("Clear State Program:")
    print(compileTeal(clear_program, mode=Mode.Application, version=8))
