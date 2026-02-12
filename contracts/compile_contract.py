"""
Contract Compilation Utility
=============================

Compiles PyTeal smart contracts to TEAL bytecode.
Generates both approval and clear state programs.

Usage:
    python compile_contract.py
"""

import base64
from pyteal import *
from campaign_escrow import campaign_escrow_contract, clear_state_program


def compile_to_teal():
    """Compile PyTeal to TEAL source code."""
    
    # Compile approval program
    approval_teal = compileTeal(
        campaign_escrow_contract(),
        mode=Mode.Application,
        version=8
    )
    
    # Compile clear state program
    clear_teal = compileTeal(
        clear_state_program(),
        mode=Mode.Application,
        version=8
    )
    
    return approval_teal, clear_teal


def save_teal_files():
    """Save compiled TEAL to files."""
    
    approval_teal, clear_teal = compile_to_teal()
    
    # Save approval program
    with open("campaign_escrow_approval.teal", "w") as f:
        f.write(approval_teal)
    print("✅ Saved: campaign_escrow_approval.teal")
    
    # Save clear state program
    with open("campaign_escrow_clear.teal", "w") as f:
        f.write(clear_teal)
    print("✅ Saved: campaign_escrow_clear.teal")
    
    return approval_teal, clear_teal


def print_contract_info():
    """Print contract information."""
    
    print("\n" + "="*80)
    print("CAMPAIGN ESCROW CONTRACT - COMPILATION SUMMARY")
    print("="*80 + "\n")
    
    print("📋 Contract Features:")
    print("  • Accept contributions before deadline")
    print("  • Organizer withdrawal (after deadline, goal met)")
    print("  • Contributor refunds (after deadline, goal not met)")
    print("  • No admin override or rule changes")
    print()
    
    print("🔧 Global State Schema:")
    print("  • organizer (bytes): Campaign creator address")
    print("  • goal (uint64): Target amount in microALGOs")
    print("  • deadline (uint64): Unix timestamp")
    print("  • total (uint64): Total collected amount")
    print("  • count (uint64): Number of contributors")
    print()
    
    print("👤 Local State Schema:")
    print("  • contribution (uint64): Amount contributed by user")
    print()
    
    print("📦 Deployment Requirements:")
    print("  • Global state: 3 uints, 1 bytes")
    print("  • Local state: 1 uint")
    print("  • Minimum balance: ~0.1 ALGO")
    print()


if __name__ == "__main__":
    print("🔨 Compiling Campaign Escrow Contract...\n")
    
    try:
        approval_teal, clear_teal = save_teal_files()
        print_contract_info()
        
        print("✅ Compilation successful!")
        print("\nNext steps:")
        print("  1. Deploy contract using contractService.ts")
        print("  2. Test on Algorand TestNet")
        print("  3. Verify on AlgoExplorer")
        
    except Exception as e:
        print(f"❌ Compilation failed: {e}")
        raise
