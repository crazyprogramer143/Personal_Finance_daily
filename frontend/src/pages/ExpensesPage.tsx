import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import {
  BadgeDollarSign,
  Plus,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Landmark,
  Banknote,
  Smartphone,
  Building2,
} from 'lucide-react';

const CATEGORIES = [
  'Travel', 'Rent', 'Salary', 'Office Supplies', 'Utilities',
  'Marketing', 'Maintenance', 'Insurance', 'Miscellaneous',
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock },
  approved: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
};

interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'upi';
  balance: number;
}

export default function ExpensesPage() {
  const { user } = useAuth();
  const isAccountant = user?.role === 'accountant';

  const [expenses, setExpenses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [submitting, setSubmitting] = useState(false);
  const [approveModal, setApproveModal] = useState<{ id: string; category: string; amount: number } | null>(null);
  const [approveAccountId, setApproveAccountId] = useState('');
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      if (isAccountant) {
        const [expenseData, statsData, accountData] = await Promise.all([
          apiClient.getCompanyExpenses(),
          apiClient.getExpenseStats(),
          apiClient.getCompanyAccounts(),
        ]);
        setExpenses(expenseData);
        setStats(statsData);
        setAccounts(accountData.filter((a: Account) => a.balance > 0 || true));
      } else {
        const expenseData = await apiClient.getMyExpenses();
        setExpenses(expenseData);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiClient.createExpense({
        category: formData.category,
        amount: Number(formData.amount),
        description: formData.description,
        expenseDate: new Date(formData.expenseDate).toISOString(),
      });
      setFormData({ category: '', amount: '', description: '', expenseDate: new Date().toISOString().split('T')[0] });
      setShowCreate(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create expense');
    } finally {
      setSubmitting(false);
    }
  };

  const openApproveModal = (exp: any) => {
    setApproveModal({ id: exp.id, category: exp.category, amount: Number(exp.amount) });
    setApproveAccountId(accounts.length > 0 ? accounts[0].id : '');
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveModal) return;
    try {
      setSubmitting(true);
      await apiClient.approveExpense(approveModal.id, approveAccountId || undefined);
      setApproveModal(null);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to approve');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await apiClient.rejectExpense(id);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject');
    }
  };

  const filtered = expenses.filter((exp) => {
    const matchesSearch =
      !search ||
      exp.category?.toLowerCase().includes(search.toLowerCase()) ||
      exp.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || exp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = expenses.filter((e) => e.status === 'pending').length;
  const approvedTotal = expenses
    .filter((e) => e.status === 'approved')
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const pendingTotal = expenses
    .filter((e) => e.status === 'pending')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const fmt = (n: number) => Number(n).toLocaleString('en-IN');

  const accountIcon = (type: string) => {
    if (type === 'cash') return <Banknote className="w-3.5 h-3.5 text-green-500" />;
    if (type === 'upi') return <Smartphone className="w-3.5 h-3.5 text-purple-500" />;
    return <Building2 className="w-3.5 h-3.5 text-blue-500" />;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isAccountant ? 'Track and manage company expenses' : 'Submit and track your expenses'}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              showCreate
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-200'
            }`}
          >
            {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCreate ? 'Cancel' : 'New Expense'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Approved Total</p>
                <p className="text-lg font-bold text-slate-900">₹{fmt(approvedTotal)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Pending Approval</p>
                <p className="text-lg font-bold text-slate-900">{pendingCount} (₹{fmt(pendingTotal)})</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  {isAccountant ? 'Categories' : 'Total Expenses'}
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {isAccountant
                    ? (stats ? Object.keys(stats.byCategory || {}).length : 0)
                    : expenses.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Form */}
        {showCreate && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Add New Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="0"
                    min="1"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) => setFormData((p) => ({ ...p, expenseDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                  placeholder="What was this expense for?"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-sm shadow-emerald-200"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Category breakdown (accountant only) */}
        {isAccountant && stats && Object.keys(stats.byCategory || {}).length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Spending by Category</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.byCategory as Record<string, number>)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => (
                  <div key={cat} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                    <span className="text-xs font-medium text-slate-700">{cat}</span>
                    <span className="text-xs font-bold text-emerald-600">₹{fmt(amount)}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by category or description..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
            {['all', 'pending', 'approved', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === s
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                {s === 'pending' && pendingCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-[10px] bg-amber-400 text-white rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Expense list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <BadgeDollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No expenses found</p>
            <p className="text-sm text-slate-400 mt-1">
              {expenses.length === 0 ? 'Click "New Expense" to add one' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((exp) => {
              const sc = STATUS_CONFIG[exp.status] || STATUS_CONFIG.pending;
              const StatusIcon = sc.icon;
              return (
                <div
                  key={exp.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BadgeDollarSign className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-slate-900">{exp.category}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${sc.bg} ${sc.text}`}>
                              <StatusIcon className="w-3 h-3" />
                              {sc.label}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5 truncate">{exp.description}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(exp.expenseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            {exp.User && (
                              <span>by {exp.User.username}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-slate-900">₹{fmt(exp.amount)}</p>
                        </div>
                      </div>

                      {isAccountant && exp.status === 'pending' && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                          <button
                            onClick={() => openApproveModal(exp)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(exp.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Approve Modal with Account Selection */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setApproveModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Approve Expense</h2>
                  <p className="text-white/70 text-xs">{approveModal.category} — ₹{fmt(approveModal.amount)}</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleApprove} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5" />
                    Deduct from Account
                  </span>
                </label>
                {accounts.length > 0 ? (
                  <div className="space-y-2">
                    {accounts.map((acc) => (
                      <label
                        key={acc.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          approveAccountId === acc.id
                            ? 'border-emerald-300 bg-emerald-50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="account"
                          value={acc.id}
                          checked={approveAccountId === acc.id}
                          onChange={() => setApproveAccountId(acc.id)}
                          className="sr-only"
                        />
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          approveAccountId === acc.id ? 'bg-emerald-100' : 'bg-slate-100'
                        }`}>
                          {accountIcon(acc.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{acc.name}</p>
                          <p className="text-xs text-slate-400 capitalize">{acc.type}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">₹{fmt(acc.balance)}</p>
                        {approveAccountId === acc.id && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No accounts available. Expense will be approved without account deduction.</p>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApproveModal(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Approving...' : 'Approve & Deduct'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
