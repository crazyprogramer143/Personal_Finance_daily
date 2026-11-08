import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import {
  Users,
  Wallet,
  HandCoins,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  IndianRupee,
  Clock,
  FileText,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiClient } from '@/services/api';

interface DashboardStats {
  todayCollection: number;
  todayCollectionCount: number;
  pendingDueToday: number;
  pendingDueAmount: number;
  overdueCount: number;
  overdueAmount: number;
  totalActiveLoans: number;
  totalActiveLoanAmount: number;
  totalCustomers: number;
  totalAccounts: number;
  totalBalance: number;
  recentSchedules: any[];
  overdueSchedules: any[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const today = new Date();

      const [collectionStats, overdueStats, dueSchedules, loans, customers, accounts] = await Promise.all([
        apiClient.getCollectionStats(today),
        apiClient.getOverdueStats(today),
        apiClient.getDueSchedules(today),
        apiClient.getLoans(),
        apiClient.getCustomers(),
        apiClient.getCompanyAccounts(),
      ]);

      const activeLoans = loans.filter((l: any) => l.status === 'active');
      const totalActiveLoanAmount = activeLoans.reduce((sum: number, l: any) => sum + parseFloat(l.principalAmount || 0), 0);

      const pendingSchedules = dueSchedules.filter((s: any) => s.status === 'due' || s.status === 'upcoming' || s.status === 'partially_paid');
      const pendingAmount = pendingSchedules.reduce((sum: number, s: any) => sum + parseFloat(s.remainingDue || 0), 0);

      const totalBalance = accounts.reduce((sum: number, a: any) => sum + parseFloat(a.balance || 0), 0);

      setStats({
        todayCollection: collectionStats.totalCollected || 0,
        todayCollectionCount: collectionStats.collectionCount || 0,
        pendingDueToday: pendingSchedules.length,
        pendingDueAmount: pendingAmount,
        overdueCount: overdueStats.overdueInstallmentCount || 0,
        overdueAmount: overdueStats.totalOverdueAmount || 0,
        totalActiveLoans: activeLoans.length,
        totalActiveLoanAmount,
        totalCustomers: customers.length,
        totalAccounts: accounts.length,
        totalBalance,
        recentSchedules: dueSchedules.slice(0, 5),
        overdueSchedules: (overdueStats.overdueSchedules || []).slice(0, 5),
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  const quickActions = [
    { label: 'Customers', path: '/customers', icon: Users, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50' },
    { label: 'Loans', path: '/loans', icon: Wallet, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' },
    { label: 'Collections', path: '/collections', icon: HandCoins, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
    { label: 'Reports', path: '/reports', icon: TrendingUp, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Welcome section */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 sm:p-8 mb-6 text-white">
          <h2 className="text-xl sm:text-2xl font-bold">
            Welcome back{user?.role === 'accountant' ? `, ${user.name || 'Owner'}` : ''}
          </h2>
          <p className="text-slate-300 mt-1 text-sm">
            {user?.role === 'accountant'
              ? "Here's an overview of your business today."
              : "Ready for today's collections."}
          </p>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Quick actions */}
        {user?.role === 'accountant' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 p-5 text-left transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-semibold text-slate-800 text-sm">{action.label}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Today's Collection */}
          <button
            onClick={() => navigate('/collections')}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-left hover:shadow-md hover:border-emerald-200 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-500">Today's Collection</h3>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            {loading ? (
              <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
            ) : (
              <>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats?.todayCollection || 0)}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {stats?.todayCollectionCount || 0} payments collected
                </p>
              </>
            )}
          </button>

          {/* Pending Due Today */}
          <button
            onClick={() => navigate('/collections')}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-left hover:shadow-md hover:border-amber-200 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-500">Pending Today</h3>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            {loading ? (
              <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
            ) : (
              <>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats?.pendingDueAmount || 0)}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {stats?.pendingDueToday || 0} installments due
                </p>
              </>
            )}
          </button>

          {/* Overdue */}
          <button
            onClick={() => navigate('/collections')}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-left hover:shadow-md hover:border-red-200 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-500">Overdue</h3>
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
            </div>
            {loading ? (
              <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
            ) : (
              <>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats?.overdueAmount || 0)}</p>
                <p className="text-xs text-amber-600 mt-1 font-medium">
                  {stats?.overdueCount || 0} overdue installments
                </p>
              </>
            )}
          </button>
        </div>

        {/* Second row: Portfolio stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Active Loans */}
          <button
            onClick={() => navigate('/loans')}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-left hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-500">Active Loans</h3>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
            ) : (
              <>
                <p className="text-2xl font-bold text-slate-800">{stats?.totalActiveLoans || 0}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Portfolio: {formatCurrency(stats?.totalActiveLoanAmount || 0)}
                </p>
              </>
            )}
          </button>

          {/* Customers */}
          <button
            onClick={() => navigate('/customers')}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-left hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-500">Customers</h3>
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-violet-600" />
              </div>
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
            ) : (
              <>
                <p className="text-2xl font-bold text-slate-800">{stats?.totalCustomers || 0}</p>
                <p className="text-xs text-slate-400 mt-1">Total registered</p>
              </>
            )}
          </button>

          {/* Total Balance */}
          <button
            onClick={() => navigate('/accounts')}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-left hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-500">Cash & Accounts</h3>
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <PiggyBank className="w-4 h-4 text-teal-600" />
              </div>
            </div>
            {loading ? (
              <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
            ) : (
              <>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats?.totalBalance || 0)}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Across {stats?.totalAccounts || 0} accounts
                </p>
              </>
            )}
          </button>
        </div>

        {/* Due today and Overdue sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Due Today */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-500" />
                Due Today
              </h3>
              <button
                onClick={() => navigate('/collections')}
                className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : stats?.recentSchedules && stats.recentSchedules.length > 0 ? (
              <div className="space-y-2">
                {stats.recentSchedules.map((s: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{s.customerName}</p>
                      <p className="text-xs text-slate-400">{s.loanCode}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-sm font-semibold text-slate-800">{formatCurrency(s.remainingDue)}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        s.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                        s.status === 'partially_paid' ? 'bg-amber-100 text-amber-700' :
                        s.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-slate-400">
                No installments due today
              </div>
            )}
          </div>

          {/* Overdue */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Overdue Installments
              </h3>
              <button
                onClick={() => navigate('/collections')}
                className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : stats?.overdueSchedules && stats.overdueSchedules.length > 0 ? (
              <div className="space-y-2">
                {stats.overdueSchedules.map((s: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg border border-red-100">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{s.customerName || s.Customer?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400">Due: {new Date(s.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-sm font-semibold text-red-600">{formatCurrency(s.remainingDue)}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-red-100 text-red-700">overdue</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-emerald-500 font-medium">
                No overdue installments
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
