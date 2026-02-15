/**
 * Sidebar Navigation Component
 * ==============================
 * 
 * Professional left sidebar for desktop navigation.
 * Clean, predictable, no gradients or glassmorphism.
 */

import { Home, Send, Users, TrendingUp, History, Wallet, LogOut, Split } from 'lucide-react';
import { useWallet } from '@txnlab/use-wallet-react';

interface SidebarProps {
    currentView: string;
    onNavigate: (view: string) => void;
    onLogout: () => void;
}

export function Sidebar({ currentView, onNavigate, onLogout }: SidebarProps) {
    const { activeAddress } = useWallet();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'sendPayment', label: 'Payments', icon: Send },
        { id: 'splitExpense', label: 'Split Expense', icon: Split },
        { id: 'clubFunding', label: 'Club Funding', icon: Users },
        { id: 'clubSpending', label: 'Club Spending', icon: TrendingUp },
        { id: 'history', label: 'History', icon: History },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-60 bg-card border-r border-border flex flex-col">
            {/* Logo/Brand */}
            <div className="p-6 border-b border-border">
                <h1 className="text-xl font-semibold text-foreground">CampusPay</h1>
                <p className="text-xs text-muted-foreground mt-1">Campus Finance</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive
                                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }
              `}
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Wallet Info */}
            {activeAddress && (
                <div className="p-4 border-t border-border space-y-3">
                    <div className="flex items-center gap-3 px-3 py-2 bg-muted rounded-md">
                        <Wallet className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">Wallet</p>
                            <p className="text-xs font-mono truncate text-foreground">
                                {activeAddress.slice(0, 8)}...{activeAddress.slice(-6)}
                            </p>
                        </div>
                    </div>

                    <div className="px-3 py-1 bg-muted/50 rounded text-xs text-muted-foreground">
                        Algorand TestNet
                    </div>

                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Disconnect
                    </button>
                </div>
            )}
        </aside>
    );
}
