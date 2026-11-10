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
  BookOpen,
  Receipt,
  Banknote,
  Smartphone,
  Building2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
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
  dayBook: any | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dayBookDate, setDayBookDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dayBookLoading, setDayBookLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    collections: false, disbursements: false, expenses: false,
  });

  const toggleSection = (key: string) =>
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = dayBookDate === todayStr;

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const today = new Date();

      const [collectionStats, overdueStats, dueSchedules, loans, customers, accounts, dayBook] = await Promise.all([
        apiClient.getCollectionStats(today),
        apiClient.getOverdueStats(today),
        apiClient.getDueSchedules(today),
        apiClient.getLoans(),
        apiClient.getCustomers(),
        apiClient.getCompanyAccounts(),
        apiClient.getDayBookReport(today, today),
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
        dayBook,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadDayBook(dateStr: string) {
    try {
      setDayBookLoading(true);
      const date = new Date(dateStr + 'T00:00:00');
      const dayBook = await apiClient.getDayBookReport(date, date);
      setStats(prev => prev ? { ...prev, dayBook } : prev);
    } catch (err) {
      console.error('Failed to load day book:', err);
    } finally {
      setDayBookLoading(false);
    }
  }

  function shiftDayBookDate(days: number) {
    const d = new Date(dayBookDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    const newDate = d.toISOString().split('T')[0];
    setDayBookDate(newDate);
    loadDayBook(newDate);
  }

  function handleDayBookDateChange(dateStr: string) {
    setDayBookDate(dateStr);
    loadDayBook(dateStr);
  }

  function formatDayBookLabel(dateStr: string) {
    if (dateStr === todayStr) return "Today's Day Book";
    const d = new Date(dateStr + 'T00:00:00');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === yesterday.toISOString().split('T')[0]) return "Yesterday's Day Book";
    return `Day Book — ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
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

        {/* Day Book */}
        {stats?.dayBook && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                {formatDayBookLabel(dayBookDate)}
                {dayBookLoading && <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />}
              </h3>
              <div className="flex items-center gap-1">
                <button onClick={() => shiftDayBookDate(-1)} className="p-1 rounded hover:bg-slate-100 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                </button>
                <input
                  type="date"
                  value={dayBookDate}
                  max={todayStr}
                  onChange={(e) => handleDayBookDateChange(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-300"
                />
                <button
                  onClick={() => shiftDayBookDate(1)}
                  disabled={isToday}
                  className="p-1 rounded hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
                {!isToday && (
                  <button
                    onClick={() => handleDayBookDateChange(todayStr)}
                    className="text-[10px] text-amber-600 hover:text-amber-700 font-medium ml-1"
                  >
                    Today
                  </button>
                )}
              </div>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <p className="text-xs text-slate-500 mb-0.5">Collections</p>
                <p className="text-lg font-bold text-emerald-700">{formatCurrency(stats.dayBook.summary.totalCollections)}</p>
                <p className="text-[10px] text-slate-400">{stats.dayBook.summary.collectionsCount} entries</p>
              </div>
              <div className="bg-violet-50 rounded-lg p-3 border border-violet-100">
                <p className="text-xs text-slate-500 mb-0.5">Disbursements</p>
                <p className="text-lg font-bold text-violet-700">{formatCurrency(stats.dayBook.summary.totalDisbursements)}</p>
                <p className="text-[10px] text-slate-400">{stats.dayBook.summary.disbursementsCount} entries</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                <p className="text-xs text-slate-500 mb-0.5">Expenses</p>
                <p className="text-lg font-bold text-red-700">{formatCurrency(stats.dayBook.summary.totalExpenses)}</p>
                <p className="text-[10px] text-slate-400">{stats.dayBook.summary.expensesCount} entries</p>
              </div>
              <div className={`${stats.dayBook.summary.netCashFlow >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'} rounded-lg p-3 border`}>
                <p className="text-xs text-slate-500 mb-0.5">Net Cash Flow</p>
                <p className={`text-lg font-bold ${stats.dayBook.summary.netCashFlow >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatCurrency(stats.dayBook.summary.netCashFlow)}</p>
                <p className="text-[10px] text-slate-400">in − out</p>
              </div>
            </div>

            {/* Collection method breakdown */}
            {stats.dayBook.summary.collectionsCount > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2">
                  <Banknote className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500">Cash ({stats.dayBook.summary.collectionsByMethod.cash.count})</p>
                    <p className="text-sm font-bold text-slate-800">{formatCurrency(stats.dayBook.summary.collectionsByMethod.cash.amount)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                  <Smartphone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500">UPI ({stats.dayBook.summary.collectionsByMethod.upi.count})</p>
                    <p className="text-sm font-bold text-slate-800">{formatCurrency(stats.dayBook.summary.collectionsByMethod.upi.amount)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                  <Building2 className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500">Bank ({stats.dayBook.summary.collectionsByMethod.bank_transfer.count})</p>
                    <p className="text-sm font-bold text-slate-800">{formatCurrency(stats.dayBook.summary.collectionsByMethod.bank_transfer.amount)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Collapsible detail sections */}
            <div className="space-y-2">
              {/* Collections */}
              {stats.dayBook.collections.length > 0 && (
                <div className="border border-slate-100 rounded-lg overflow-hidden">
                  <button onClick={() => toggleSection('collections')} className="w-full flex items-center justify-between px-3 py-2 bg-emerald-50 hover:bg-emerald-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-semibold text-slate-700">Collections</span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full">{stats.dayBook.collections.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700">{formatCurrency(stats.dayBook.summary.totalCollections)}</span>
                      {expandedSections.collections ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                  </button>
                  {expandedSections.collections && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="text-left py-2 px-3 text-[10px] font-semibold text-slate-500">Customer</th>
                            <th className="text-left py-2 px-3 text-[10px] font-semibold text-slate-500">Loan</th>
                            <th className="text-right py-2 px-3 text-[10px] font-semibold text-slate-500">Amount</th>
                            <th className="text-left py-2 px-3 text-[10px] font-semibold text-slate-500">Method</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.dayBook.collections.map((c: any) => (
                            <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                              <td className="py-1.5 px-3 text-xs font-medium text-slate-700">{c.customerName}</td>
                              <td className="py-1.5 px-3 text-[10px] text-slate-500 font-mono">{c.loanCode}</td>
                              <td className="py-1.5 px-3 text-xs font-semibold text-emerald-600 text-right">{formatCurrency(Number(c.amountReceived))}</td>
                              <td className="py-1.5 px-3 text-[10px] text-slate-500 capitalize">{c.paymentMethod?.replace('_', ' ')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Disbursements */}
              {stats.dayBook.disbursements.length > 0 && (
                <div className="border border-slate-100 rounded-lg overflow-hidden">
                  <button onClick={() => toggleSection('disbursements')} className="w-full flex items-center justify-between px-3 py-2 bg-violet-50 hover:bg-violet-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-3.5 h-3.5 text-violet-600" />
                      <span className="text-xs font-semibold text-slate-700">Disbursements</span>
                      <span className="text-[10px] bg-violet-200 text-violet-800 px-1.5 py-0.5 rounded-full">{stats.dayBook.disbursements.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-violet-700">{formatCurrency(stats.dayBook.summary.totalDisbursements)}</span>
                      {expandedSections.disbursements ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                  </button>
                  {expandedSections.disbursements && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="text-left py-2 px-3 text-[10px] font-semibold text-slate-500">Customer</th>
                            <th className="text-left py-2 px-3 text-[10px] font-semibold text-slate-500">Loan</th>
                            <th className="text-right py-2 px-3 text-[10px] font-semibold text-slate-500">Disbursed</th>
                            <th className="text-right py-2 px-3 text-[10px] font-semibold text-slate-500">Held</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.dayBook.disbursements.map((d: any) => (
                            <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50">
                              <td className="py-1.5 px-3 text-xs font-medium text-slate-700">{d.customerName}</td>
                              <td className="py-1.5 px-3 text-[10px] text-slate-500 font-mono">{d.loanCode}</td>
                              <td className="py-1.5 px-3 text-xs font-semibold text-violet-600 text-right">{formatCurrency(Number(d.disbursedAmount))}</td>
                              <td className="py-1.5 px-3 text-xs text-slate-500 text-right">{formatCurrency(Number(d.heldAmount))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Expenses */}
              {stats.dayBook.expenses.length > 0 && (
                <div className="border border-slate-100 rounded-lg overflow-hidden">
                  <button onClick={() => toggleSection('expenses')} className="w-full flex items-center justify-between px-3 py-2 bg-red-50 hover:bg-red-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-3.5 h-3.5 text-red-600" />
                      <span className="text-xs font-semibold text-slate-700">Expenses</span>
                      <span className="text-[10px] bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full">{stats.dayBook.expenses.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-700">{formatCurrency(stats.dayBook.summary.totalExpenses)}</span>
                      {expandedSections.expenses ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                  </button>
                  {expandedSections.expenses && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="text-left py-2 px-3 text-[10px] font-semibold text-slate-500">Category</th>
                            <th className="text-left py-2 px-3 text-[10px] font-semibold text-slate-500">Description</th>
                            <th className="text-right py-2 px-3 text-[10px] font-semibold text-slate-500">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.dayBook.expenses.map((e: any) => (
                            <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50">
                              <td className="py-1.5 px-3 text-xs text-slate-700 capitalize">{e.category?.replace('_', ' ')}</td>
                              <td className="py-1.5 px-3 text-xs text-slate-600 max-w-[180px] truncate">{e.description}</td>
                              <td className="py-1.5 px-3 text-xs font-semibold text-red-600 text-right">{formatCurrency(Number(e.amount))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

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
