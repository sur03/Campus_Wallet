/**
 * Bottom Navigation Component
 * =============================
 * 
 * Mobile bottom navigation bar.
 * Clean, minimal, professional.
 */

import { Home, Send, Users, TrendingUp, User, Split } from 'lucide-react';

interface BottomNavProps {
    currentView: string;
    onNavigate: (view: string) => void;
}

export function BottomNav({ currentView, onNavigate }: BottomNavProps) {
    const navItems = [
        { id: 'dashboard', label: 'Home', icon: Home },
        { id: 'sendPayment', label: 'Pay', icon: Send },
        { id: 'splitExpense', label: 'Split', icon: Split },
        { id: 'clubFunding', label: 'Funding', icon: Users },
        { id: 'clubSpending', label: 'Spending', icon: TrendingUp },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`
                flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors
                ${isActive ? 'text-primary' : 'text-muted-foreground'}
              `}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
