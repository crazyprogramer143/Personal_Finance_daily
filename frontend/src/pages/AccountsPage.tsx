import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import Layout from '@/components/Layout';
import {
  Plus,
  Landmark,
  Banknote,
  Smartphone,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Lock,
  Unlock,
  Eye,
  TrendingUp,
  TrendingDown,
  X,
  Search,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';

interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'upi';
  balance: number;
  heldAmount: number;
  currency: string;
  bankName?: string;
  accountNumber?: string;
  upiId?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface LedgerEntry {
  id: string;
  accountId: string;
  transactionDate: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
  runningBalance: number;
  createdAt: string;
}

type ModalType = 'create' | 'transaction' | 'hold' | 'release' | 'ledger' | null;
type FilterType = 'all' | 'cash' | 'bank' | 'upi';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [createForm, setCreateForm] = useState({
    name: '',
    type: 'cash' as 'cash' | 'bank' | 'upi',
    currency: 'INR',
    bankName: '',
    accountNumber: '',
    upiId: '',
  });

  const [txForm, setTxForm] = useState({
    type: 'credit' as 'credit' | 'debit',
    amount: '',
    description: '',
    referenceType: '',
    transactionDate: new Date().toISOString().split('T')[0],
  });

  const [holdForm, setHoldForm] = useState({ amount: '' });
  const [releaseForm, setReleaseForm] = useState({ amount: '' });

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCompanyAccounts();
      setAccounts(data);
    } catch {
      showToast('Failed to load accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadLedger = async (accountId: string) => {
    try {
      setLedgerLoading(true);
      const data = await apiClient.getAccountLedger(accountId, 50);
      setLedgerEntries(data);
    } catch {
      showToast('Failed to load ledger', 'error');
    } finally {
      setLedgerLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createAccount(createForm);
      showToast('Account created successfully', 'success');
      setActiveModal(null);
      setCreateForm({ name: '', type: 'cash', currency: 'INR', bankName: '', accountNumber: '', upiId: '' });
      loadAccounts();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to create account', 'error');
    }
  };

  const handleRecordTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    try {
      await apiClient.recordTransaction({
        accountId: selectedAccount.id,
        type: txForm.type,
        amount: parseFloat(txForm.amount),
        description: txForm.description,
        referenceType: txForm.referenceType || undefined,
        transactionDate: txForm.transactionDate,
      });
      showToast(`${txForm.type === 'credit' ? 'Credit' : 'Debit'} recorded successfully`, 'success');
      setActiveModal(null);
      setTxForm({ type: 'credit', amount: '', description: '', referenceType: '', transactionDate: new Date().toISOString().split('T')[0] });
      loadAccounts();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to record transaction', 'error');
    }
  };

  const handleHoldAmount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    try {
      await apiClient.holdAmount(selectedAccount.id, parseFloat(holdForm.amount));
      showToast('Amount held successfully', 'success');
      setActiveModal(null);
      setHoldForm({ amount: '' });
      loadAccounts();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to hold amount', 'error');
    }
  };

  const handleReleaseAmount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    try {
      await apiClient.releaseHeldAmount(selectedAccount.id, parseFloat(releaseForm.amount));
      showToast('Amount released successfully', 'success');
      setActiveModal(null);
      setReleaseForm({ amount: '' });
      loadAccounts();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to release amount', 'error');
    }
  };

  const handleToggleStatus = async (account: Account) => {
    const newStatus = account.status === 'active' ? 'inactive' : 'active';
    try {
      await apiClient.updateAccountStatus(account.id, newStatus);
      showToast(`Account ${newStatus === 'active' ? 'activated' : 'deactivated'}`, 'success');
      loadAccounts();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update status', 'error');
    }
  };

  const openModal = (type: ModalType, account?: Account) => {
    if (account) setSelectedAccount(account);
    if (type === 'ledger' && account) {
      loadLedger(account.id);
    }
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedAccount(null);
    setLedgerEntries([]);
  };

  const filteredAccounts = accounts.filter((a) => {
    const matchesType = filterType === 'all' || a.type === filterType;
    const matchesSearch =
      searchQuery === '' ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.bankName && a.bankName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.accountNumber && a.accountNumber.includes(searchQuery)) ||
      (a.upiId && a.upiId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const totals = accounts.reduce(
    (acc, a) => ({
      balance: acc.balance + Number(a.balance),
      held: acc.held + Number(a.heldAmount),
      available: acc.available + (Number(a.balance) - Number(a.heldAmount)),
    }),
    { balance: 0, held: 0, available: 0 }
  );

  const accountCounts = {
    all: accounts.length,
    cash: accounts.filter((a) => a.type === 'cash').length,
    bank: accounts.filter((a) => a.type === 'bank').length,
    upi: accounts.filter((a) => a.type === 'upi').length,
  };

  const getTypeIcon = (type: string, size = 'w-5 h-5') => {
    switch (type) {
      case 'cash': return <Banknote className={`${size} text-emerald-600`} />;
      case 'bank': return <Landmark className={`${size} text-blue-600`} />;
      case 'upi': return <Smartphone className={`${size} text-violet-600`} />;
      default: return <Wallet className={`${size} text-slate-600`} />;
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'cash': return 'from-emerald-500 to-teal-600';
      case 'bank': return 'from-blue-500 to-indigo-600';
      case 'upi': return 'from-violet-500 to-purple-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'cash': return 'bg-emerald-50 border-emerald-200';
      case 'bank': return 'bg-blue-50 border-blue-200';
      case 'upi': return 'bg-violet-50 border-violet-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const fmt = (n: number) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">Loading accounts...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Balance',
              value: `₹${fmt(totals.balance)}`,
              icon: <Wallet className="w-5 h-5" />,
              gradient: 'from-blue-500 to-indigo-600',
              bg: 'bg-blue-50',
              text: 'text-blue-700',
            },
            {
              label: 'Available Balance',
              value: `₹${fmt(totals.available)}`,
              icon: <TrendingUp className="w-5 h-5" />,
              gradient: 'from-emerald-500 to-teal-600',
              bg: 'bg-emerald-50',
              text: 'text-emerald-700',
            },
            {
              label: 'Held Amount',
              value: `₹${fmt(totals.held)}`,
              icon: <Lock className="w-5 h-5" />,
              gradient: 'from-amber-500 to-orange-600',
              bg: 'bg-amber-50',
              text: 'text-amber-700',
            },
            {
              label: 'Total Accounts',
              value: `${accounts.length}`,
              icon: <Landmark className="w-5 h-5" />,
              gradient: 'from-violet-500 to-purple-600',
              bg: 'bg-violet-50',
              text: 'text-violet-700',
              sub: `${accountCounts.cash} Cash · ${accountCounts.bank} Bank · ${accountCounts.upi} UPI`,
            },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white`}>
                  {card.icon}
                </div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
              </div>
              <p className={`text-2xl font-bold ${card.text}`}>{card.value}</p>
              {card.sub && <p className="text-xs text-slate-400 mt-1">{card.sub}</p>}
            </div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(['all', 'cash', 'bank', 'upi'] as FilterType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    filterType === type
                      ? type === 'cash'
                        ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'
                        : type === 'bank'
                        ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                        : type === 'upi'
                        ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-300'
                        : 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type !== 'all' && getTypeIcon(type, 'w-3.5 h-3.5')}
                  <span className="capitalize">{type}</span>
                  <span className={`ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                    filterType === type ? 'bg-white/30' : 'bg-slate-200'
                  }`}>
                    {accountCounts[type]}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => openModal('create')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              New Account
            </button>
          </div>
        </div>

        {/* Account Cards */}
        {filteredAccounts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No accounts found</h3>
            <p className="text-sm text-slate-500">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Create your first account to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredAccounts.map((account) => {
              const available = Number(account.balance) - Number(account.heldAmount);
              const isExpanded = expandedCard === account.id;
              const heldPercent = Number(account.balance) > 0
                ? (Number(account.heldAmount) / Number(account.balance)) * 100
                : 0;

              return (
                <div
                  key={account.id}
                  className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                    account.status === 'inactive' ? 'opacity-60 border-slate-300' : 'border-slate-200'
                  }`}
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-r ${getTypeGradient(account.type)} p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          {account.type === 'cash' && <Banknote className="w-5 h-5" />}
                          {account.type === 'bank' && <Landmark className="w-5 h-5" />}
                          {account.type === 'upi' && <Smartphone className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-base">{account.name}</h3>
                          <p className="text-white/70 text-xs capitalize">
                            {account.type === 'bank' && account.bankName
                              ? `${account.bankName} · ${account.accountNumber ? '••••' + account.accountNumber.slice(-4) : ''}`
                              : account.type === 'upi' && account.upiId
                              ? account.upiId
                              : `${account.type} account`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          account.status === 'active' ? 'bg-white/20' : 'bg-red-500/50'
                        }`}>
                          {account.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Balance Section */}
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className={`${getTypeBg(account.type)} rounded-lg p-3 border text-center`}>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-1">Available</p>
                        <p className="text-lg font-bold text-slate-800">₹{fmt(available)}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-1">Total</p>
                        <p className="text-lg font-bold text-slate-800">₹{fmt(Number(account.balance))}</p>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-1">Held</p>
                        <p className="text-lg font-bold text-amber-700">₹{fmt(Number(account.heldAmount))}</p>
                      </div>
                    </div>

                    {/* Held amount progress bar */}
                    {Number(account.balance) > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>Available ({(100 - heldPercent).toFixed(0)}%)</span>
                          <span>Held ({heldPercent.toFixed(0)}%)</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
                            style={{ width: `${100 - heldPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openModal('transaction', account)}
                        disabled={account.status === 'inactive'}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowUpCircle className="w-3.5 h-3.5" />
                        Transaction
                      </button>
                      <button
                        onClick={() => openModal('hold', account)}
                        disabled={account.status === 'inactive'}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Hold
                      </button>
                      {Number(account.heldAmount) > 0 && (
                        <button
                          onClick={() => openModal('release', account)}
                          disabled={account.status === 'inactive'}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          Release
                        </button>
                      )}
                      <button
                        onClick={() => openModal('ledger', account)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ledger
                      </button>
                      <button
                        onClick={() => setExpandedCard(isExpanded ? null : account.id)}
                        className="flex items-center gap-1 px-2 py-1.5 text-slate-400 hover:text-slate-600 text-xs transition-colors ml-auto"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-500">Currency</span>
                            <p className="font-medium text-slate-700">{account.currency}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Created</span>
                            <p className="font-medium text-slate-700">
                              {new Date(account.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          {account.type === 'bank' && (
                            <>
                              <div>
                                <span className="text-slate-500">Bank</span>
                                <p className="font-medium text-slate-700">{account.bankName || '—'}</p>
                              </div>
                              <div>
                                <span className="text-slate-500">Account No.</span>
                                <p className="font-medium text-slate-700">{account.accountNumber || '—'}</p>
                              </div>
                            </>
                          )}
                          {account.type === 'upi' && (
                            <div className="col-span-2">
                              <span className="text-slate-500">UPI ID</span>
                              <p className="font-medium text-slate-700">{account.upiId || '—'}</p>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleToggleStatus(account)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors w-full justify-center ${
                            account.status === 'active'
                              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {account.status === 'active' ? (
                            <><ToggleRight className="w-4 h-4" /> Deactivate Account</>
                          ) : (
                            <><ToggleLeft className="w-4 h-4" /> Activate Account</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium animate-[slideIn_0.3s_ease] ${
          toast.type === 'success'
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
            : 'bg-gradient-to-r from-red-500 to-rose-600'
        }`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}

      {/* ====== MODALS ====== */}

      {/* Create Account Modal */}
      {activeModal === 'create' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">New Account</h2>
                    <p className="text-white/70 text-xs">Add a cash, bank, or UPI account</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleCreateAccount} className="p-5 space-y-4">
              {/* Account Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Account Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['cash', 'bank', 'upi'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setCreateForm((p) => ({ ...p, type: t }))}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        createForm.type === t
                          ? t === 'cash'
                            ? 'border-emerald-400 bg-emerald-50'
                            : t === 'bank'
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-violet-400 bg-violet-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {getTypeIcon(t, 'w-6 h-6')}
                      <span className="text-xs font-medium capitalize">{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Account Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  placeholder="e.g. Main Cash Box, HDFC Current"
                  required
                />
              </div>

              {createForm.type === 'bank' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Bank Name</label>
                    <input
                      type="text"
                      value={createForm.bankName}
                      onChange={(e) => setCreateForm((p) => ({ ...p, bankName: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      placeholder="e.g. HDFC Bank"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Account Number</label>
                    <input
                      type="text"
                      value={createForm.accountNumber}
                      onChange={(e) => setCreateForm((p) => ({ ...p, accountNumber: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      placeholder="e.g. 12345678901234"
                    />
                  </div>
                </div>
              )}

              {createForm.type === 'upi' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">UPI ID</label>
                  <input
                    type="text"
                    value={createForm.upiId}
                    onChange={(e) => setCreateForm((p) => ({ ...p, upiId: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    placeholder="e.g. business@upi"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Record Transaction Modal */}
      {activeModal === 'transaction' && selectedAccount && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className={`bg-gradient-to-r ${txForm.type === 'credit' ? 'from-emerald-500 to-teal-600' : 'from-red-500 to-rose-600'} p-5 text-white transition-colors`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    {txForm.type === 'credit' ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Record Transaction</h2>
                    <p className="text-white/70 text-xs">{selectedAccount.name} · Available: ₹{fmt(Number(selectedAccount.balance) - Number(selectedAccount.heldAmount))}</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleRecordTransaction} className="p-5 space-y-4">
              {/* Credit/Debit Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxForm((p) => ({ ...p, type: 'credit' }))}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                      txForm.type === 'credit'
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <ArrowDownCircle className="w-4 h-4" /> Credit (Money In)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxForm((p) => ({ ...p, type: 'debit' }))}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                      txForm.type === 'debit'
                        ? 'border-red-400 bg-red-50 text-red-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <ArrowUpCircle className="w-4 h-4" /> Debit (Money Out)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={txForm.amount}
                    onChange={(e) => setTxForm((p) => ({ ...p, amount: e.target.value }))}
                    className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Description</label>
                <input
                  type="text"
                  value={txForm.description}
                  onChange={(e) => setTxForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  placeholder="e.g. Loan disbursement to customer"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={txForm.transactionDate}
                      onChange={(e) => setTxForm((p) => ({ ...p, transactionDate: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Reference Type</label>
                  <select
                    value={txForm.referenceType}
                    onChange={(e) => setTxForm((p) => ({ ...p, referenceType: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  >
                    <option value="">None</option>
                    <option value="payment">Payment</option>
                    <option value="disbursement">Disbursement</option>
                    <option value="expense">Expense</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 text-white rounded-lg text-sm font-semibold transition-all shadow-sm ${
                  txForm.type === 'credit'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                    : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
                }`}
              >
                Record {txForm.type === 'credit' ? 'Credit' : 'Debit'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hold Amount Modal */}
      {activeModal === 'hold' && selectedAccount && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Hold Amount</h2>
                    <p className="text-white/70 text-xs">
                      {selectedAccount.name} · Available: ₹{fmt(Number(selectedAccount.balance) - Number(selectedAccount.heldAmount))}
                    </p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleHoldAmount} className="p-5 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700">
                  Holding an amount will reserve it and reduce the available balance. Currently held: <span className="font-bold">₹{fmt(Number(selectedAccount.heldAmount))}</span>
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Amount to Hold</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={holdForm.amount}
                    onChange={(e) => setHoldForm({ amount: e.target.value })}
                    className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    max={Number(selectedAccount.balance) - Number(selectedAccount.heldAmount)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg text-sm font-semibold hover:from-amber-600 hover:to-orange-700 transition-all shadow-sm"
              >
                Hold Amount
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Release Amount Modal */}
      {activeModal === 'release' && selectedAccount && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Unlock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Release Held Amount</h2>
                    <p className="text-white/70 text-xs">
                      {selectedAccount.name} · Held: ₹{fmt(Number(selectedAccount.heldAmount))}
                    </p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleReleaseAmount} className="p-5 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  Releasing will make the held funds available again. Currently held: <span className="font-bold">₹{fmt(Number(selectedAccount.heldAmount))}</span>
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Amount to Release</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={releaseForm.amount}
                    onChange={(e) => setReleaseForm({ amount: e.target.value })}
                    className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    max={Number(selectedAccount.heldAmount)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all shadow-sm"
              >
                Release Amount
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Ledger Modal */}
      {activeModal === 'ledger' && selectedAccount && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className={`bg-gradient-to-r ${getTypeGradient(selectedAccount.type)} p-5 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    {getTypeIcon(selectedAccount.type, 'w-5 h-5 text-white')}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Transaction Ledger</h2>
                    <p className="text-white/70 text-xs">{selectedAccount.name} · Balance: ₹{fmt(Number(selectedAccount.balance))}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadLedger(selectedAccount.id)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${ledgerLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button onClick={closeModal} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {ledgerLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : ledgerEntries.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {ledgerEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        entry.type === 'credit' ? 'bg-emerald-100' : 'bg-red-100'
                      }`}>
                        {entry.type === 'credit' ? (
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-slate-800">{entry.description?.replace(/\s*\([A-Z][A-Z0-9-]*\)\s*/g, ' ').trim()}</p>
                          {(() => {
                            const codeMatch = entry.description?.match(/\(([A-Z][A-Z0-9-]*)\)/);
                            return codeMatch ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-violet-50 text-violet-700 text-[10px] font-bold rounded">
                                {codeMatch[1]}
                              </span>
                            ) : null;
                          })()}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{new Date(entry.transactionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          {entry.referenceType && (
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded capitalize">{entry.referenceType}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-bold ${entry.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {entry.type === 'credit' ? '+' : '-'}₹{fmt(Number(entry.amount))}
                        </p>
                        <p className="text-[10px] text-slate-400">Bal: ₹{fmt(Number(entry.runningBalance))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
