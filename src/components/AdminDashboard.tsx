import { LogOut, Wallet, Activity, FileText, CheckCircle, TrendingUp, Users, DollarSign } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const statsCards = [
    {
      icon: DollarSign,
      title: 'Total Funds',
      value: '45,678 ALGO',
      change: '+12.5%',
      changeType: 'positive' as const,
      color: 'from-green-500 to-teal-600',
    },
    {
      icon: Activity,
      title: 'Transactions',
      value: '1,234',
      change: '+8.2%',
      changeType: 'positive' as const,
      color: 'from-blue-500 to-purple-600',
    },
    {
      icon: FileText,
      title: 'Pending Requests',
      value: '23',
      change: '-5.4%',
      changeType: 'negative' as const,
      color: 'from-orange-500 to-red-600',
    },
    {
      icon: CheckCircle,
      title: 'Approvals',
      value: '156',
      change: '+15.8%',
      changeType: 'positive' as const,
      color: 'from-purple-500 to-pink-600',
    },
  ];

  const recentTransactions = [
    {
      id: '1',
      type: 'Club Funding',
      from: 'Student Council',
      to: 'Tech Club',
      amount: '500 ALGO',
      status: 'completed',
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      type: 'Payment',
      from: 'ALGO1X2Y3Z...',
      to: 'ALGO4A5B6C...',
      amount: '25.50 ALGO',
      status: 'completed',
      timestamp: '4 hours ago',
    },
    {
      id: '3',
      type: 'Split Expense',
      from: 'Group #342',
      to: 'Multiple Recipients',
      amount: '75 ALGO',
      status: 'pending',
      timestamp: '6 hours ago',
    },
    {
      id: '4',
      type: 'Club Funding',
      from: 'Administration',
      to: 'Sports Club',
      amount: '1,000 ALGO',
      status: 'completed',
      timestamp: '1 day ago',
    },
  ];

  const pendingApprovals = [
    {
      id: '1',
      club: 'Art & Design Club',
      amount: '750 ALGO',
      purpose: 'Annual Exhibition Expenses',
      submitted: '2024-02-08',
    },
    {
      id: '2',
      club: 'Robotics Club',
      amount: '1,200 ALGO',
      purpose: 'Competition Registration & Parts',
      submitted: '2024-02-07',
    },
    {
      id: '3',
      club: 'Environmental Club',
      amount: '450 ALGO',
      purpose: 'Campus Sustainability Project',
      submitted: '2024-02-07',
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
            <p className="text-purple-300">Monitor and manage campus transactions</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-white rounded-lg border border-purple-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <div
              key={index}
              className="p-6 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color} shadow-lg`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`text-sm font-medium px-2 py-1 rounded-lg ${
                  card.changeType === 'positive' ? 'text-green-400 bg-green-900/30' : 'text-red-400 bg-red-900/30'
                }`}>
                  {card.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{card.value}</div>
              <div className="text-sm text-purple-300">{card.title}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
              <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 bg-slate-900/50 rounded-xl border border-purple-500/10 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-white mb-1">{transaction.type}</div>
                      <div className="text-sm text-purple-300">
                        {transaction.from} → {transaction.to}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{transaction.amount}</div>
                      <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                        transaction.status === 'completed'
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-orange-900/30 text-orange-400'
                      }`}>
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">{transaction.timestamp}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Pending Approvals</h2>
            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="p-4 bg-slate-900/50 rounded-xl border border-purple-500/10"
                >
                  <div className="font-medium text-white mb-2">{approval.club}</div>
                  <div className="text-lg font-bold text-purple-400 mb-2">{approval.amount}</div>
                  <div className="text-xs text-purple-300 mb-3">{approval.purpose}</div>
                  <div className="text-xs text-slate-400 mb-3">Submitted: {approval.submitted}</div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-sm font-medium rounded-lg transition-all">
                      Approve
                    </button>
                    <button className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-all">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Chart Placeholder */}
        <div className="mt-6 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Transaction Activity</h2>
          <div className="h-64 flex items-center justify-center text-purple-300">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 text-purple-500" />
              <p>Activity chart visualization</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
