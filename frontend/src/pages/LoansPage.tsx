import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import {
  Search,
  Plus,
  ChevronRight,
  ArrowLeft,
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  CalendarDays,
  FileText,
  Loader2,
  Banknote,
  TrendingUp,
  CircleDollarSign,
  BadgeCheck,
  Send,
  XCircle,
  Eye,
  Users,
  CreditCard,
  Calendar,
  Hash,
  Filter,
  X as XIcon,
} from 'lucide-react';

interface Collector {
  id: string;
  username: string;
}

interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'upi';
  balance: number;
  status: string;
}

interface Customer {
  id: string;
  name: string;
  code: string;
  shopName?: string;
  mobileNumber?: string;
}

interface LoanProduct {
  id: string;
  name: string;
  interestRatePercent?: number;
  collectionFrequency: string;
  minPrincipal?: number;
  maxPrincipal?: number;
  durationDays: number;
}

interface Loan {
  id: string;
  companyId: string;
  customerId: string;
  loanProductId: string;
  principalAmount: number;
  heldAmount: number;
  disbursedAmount: number;
  totalScheduledRepayment: number;
  durationDays: number;
  collectionFrequency: string;
  startDate?: string;
  endDate?: string;
  status: 'draft' | 'approved' | 'active' | 'closed';
  approvedAt?: string;
  disbursedAt?: string;
  closedAt?: string;
  createdAt: string;
  Customer?: Customer;
  LoanProduct?: LoanProduct;
}

type ViewMode = 'list' | 'detail';
type FilterTab = 'all' | 'draft' | 'approved' | 'active' | 'closed';

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  draft: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: FileText, label: 'Draft' },
  approved: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: BadgeCheck, label: 'Approved' },
  active: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: TrendingUp, label: 'Active' },
  closed: { color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200', icon: CheckCircle2, label: 'Closed' },
};

export default function LoansPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAccountant = user?.role === 'accountant';
  const [view, setView] = useState<ViewMode>('list');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showDisburseModal, setShowDisburseModal] = useState<string | null>(null);
  const [disburseForm, setDisburseForm] = useState({ accountId: '', method: 'cash' as string });
  const [loanPayments, setLoanPayments] = useState<any[]>([]);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [filterCustomerId, setFilterCustomerId] = useState('');
  const [filterCollectorId, setFilterCollectorId] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [scheduleAction, setScheduleAction] = useState<{ id: string; type: 'waive' | 'skip' | 'grace'; amount: number } | null>(null);
  const [scheduleActionReason, setScheduleActionReason] = useState('');
  const [scheduleGraceDays, setScheduleGraceDays] = useState(1);

  const [formData, setFormData] = useState({
    customerId: '',
    loanProductId: '',
    principalAmount: '',
    heldAmount: '',
    durationDays: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData().then(() => {
      const loanId = searchParams.get('loanId');
      if (loanId) {
        setSearchParams({}, { replace: true });
        apiClient.getLoanDetails(loanId).then(details => {
          return apiClient.getLoanPayments(loanId).then(payments => {
            setSelectedLoan(details);
            setLoanPayments(payments);
            setView('detail');
          });
        }).catch(() => {});
      }
    });
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadData = async (filters?: { customerId?: string; collectorId?: string }) => {
    try {
      setLoading(true);
      const loansParams: any = {};
      if (filters?.customerId) loansParams.customerId = filters.customerId;
      if (filters?.collectorId) loansParams.collectorId = filters.collectorId;

      const promises: Promise<any>[] = [
        apiClient.getLoans(Object.keys(loansParams).length > 0 ? loansParams : undefined),
        isAccountant ? apiClient.getCustomers() : apiClient.getMyAssignedCustomers(),
        apiClient.getLoanProducts(),
      ];
      if (isAccountant) {
        promises.push(apiClient.getCompanyAccounts());
        promises.push(apiClient.getCollectors());
      }
      const results = await Promise.all(promises);
      setLoans(results[0]);
      const custData = results[1];
      setCustomers(isAccountant ? custData.filter((c: any) => c.status === 'active') : custData);
      setProducts(results[2].filter((p: any) => p.status === 'active'));
      if (isAccountant) {
        setAccounts(results[3].filter((a: any) => a.status === 'active'));
        setCollectors(results[4]);
      }
    } catch {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const applyFilters = () => {
    loadData({ customerId: filterCustomerId || undefined, collectorId: filterCollectorId || undefined });
  };

  const clearFilters = () => {
    setFilterCustomerId('');
    setFilterCollectorId('');
    loadData();
  };

  const hasActiveFilters = filterCustomerId || filterCollectorId;

  const filteredLoans = useMemo(() => {
    let result = loans;
    if (activeTab !== 'all') {
      result = result.filter((l) => l.status === activeTab);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.Customer?.name?.toLowerCase().includes(q) ||
          l.Customer?.code?.toLowerCase().includes(q) ||
          l.Customer?.shopName?.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [loans, activeTab, searchQuery]);

  const tabCounts = useMemo(() => ({
    all: loans.length,
    draft: loans.filter((l) => l.status === 'draft').length,
    approved: loans.filter((l) => l.status === 'approved').length,
    active: loans.filter((l) => l.status === 'active').length,
    closed: loans.filter((l) => l.status === 'closed').length,
  }), [loans]);

  const selectedProduct = useMemo(() => {
    if (!formData.loanProductId) return null;
    return products.find((p) => p.id === formData.loanProductId) || null;
  }, [formData.loanProductId, products]);

  const computedValues = useMemo(() => {
    const principal = parseFloat(formData.principalAmount) || 0;
    const held = parseFloat(formData.heldAmount) || 0;
    const disbursed = principal - held;
    const totalRepayment = principal;
    const duration = parseInt(formData.durationDays) || selectedProduct?.durationDays || 30;
    const frequency = selectedProduct?.collectionFrequency || 'daily';
    let installments = duration;
    if (frequency === 'weekly') installments = Math.ceil(duration / 7);
    else if (frequency === 'monthly') installments = Math.ceil(duration / 30);
    const perInstallment = installments > 0 ? principal / installments : 0;
    return { principal, held, disbursed, totalRepayment, installments, perInstallment, frequency };
  }, [formData.principalAmount, formData.heldAmount, formData.durationDays, selectedProduct]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading('create');
      await apiClient.createLoan({
        customerId: formData.customerId,
        loanProductId: formData.loanProductId,
        principalAmount: parseFloat(formData.principalAmount),
        heldAmount: parseFloat(formData.heldAmount) || 0,
        durationDays: parseInt(formData.durationDays) || selectedProduct?.durationDays || 30,
        startDate: formData.startDate,
      });
      setShowCreateModal(false);
      setFormData({ customerId: '', loanProductId: '', principalAmount: '', heldAmount: '', durationDays: '', startDate: new Date().toISOString().split('T')[0] });
      showToast(isAccountant ? 'Loan created successfully' : 'Loan request submitted for approval', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to create loan', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (loanId: string) => {
    try {
      setActionLoading(loanId);
      await apiClient.approveLoan(loanId);
      showToast('Loan approved successfully', 'success');
      await loadData();
      if (selectedLoan?.id === loanId) {
        const updated = await apiClient.getLoanDetails(loanId);
        setSelectedLoan(updated);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to approve', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const openDisburseModal = (loanId: string) => {
    setDisburseForm({ accountId: accounts.length > 0 ? accounts[0].id : '', method: 'cash' });
    setShowDisburseModal(loanId);
  };

  const handleDisburse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDisburseModal) return;
    const loanId = showDisburseModal;
    try {
      setActionLoading(loanId);
      await apiClient.disburseLoan(loanId, {
        disbursementDate: new Date().toISOString(),
        disbursementMethod: disburseForm.method,
        accountId: disburseForm.accountId || undefined,
      });
      showToast('Loan disbursed successfully', 'success');
      setShowDisburseModal(null);
      await loadData();
      if (selectedLoan?.id === loanId) {
        const updated = await apiClient.getLoanDetails(loanId);
        setSelectedLoan(updated);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to disburse', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClose = async (loanId: string) => {
    try {
      setActionLoading(loanId);
      await apiClient.closeLoan(loanId);
      showToast('Loan closed successfully', 'success');
      await loadData();
      if (selectedLoan?.id === loanId) {
        const updated = await apiClient.getLoanDetails(loanId);
        setSelectedLoan(updated);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to close', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const openDetail = async (loan: Loan) => {
    try {
      setLoading(true);
      const [details, payments] = await Promise.all([
        apiClient.getLoanDetails(loan.id),
        apiClient.getLoanPayments(loan.id),
      ]);
      setSelectedLoan(details);
      setLoanPayments(payments);
      setView('detail');
    } catch {
      showToast('Failed to load loan details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleAction = async () => {
    if (!scheduleAction || !scheduleActionReason.trim()) return;
    try {
      setActionLoading(scheduleAction.id);
      if (scheduleAction.type === 'waive') {
        await apiClient.waiverInstallment(scheduleAction.id, scheduleActionReason);
      } else if (scheduleAction.type === 'skip') {
        await apiClient.skipInstallment(scheduleAction.id, scheduleActionReason);
      } else if (scheduleAction.type === 'grace') {
        await apiClient.applyGracePeriod(scheduleAction.id, scheduleGraceDays, scheduleActionReason);
      }
      showToast(`Installment ${scheduleAction.type === 'waive' ? 'waived' : scheduleAction.type === 'skip' ? 'skipped' : 'grace period applied'} successfully`, 'success');
      setScheduleAction(null);
      setScheduleActionReason('');
      setScheduleGraceDays(1);
      if (selectedLoan) {
        const details = await apiClient.getLoanDetails(selectedLoan.id);
        setSelectedLoan(details);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || `Failed to ${scheduleAction.type}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setFormData((prev) => ({
      ...prev,
      loanProductId: productId,
      durationDays: product ? String(product.durationDays) : prev.durationDays,
    }));
  };

  if (loading && loans.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 animate-[slide-in_0.3s_ease-out] ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {view === 'list' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Loans</h1>
              <p className="text-sm text-slate-500 mt-1">{isAccountant ? 'Manage loan lifecycle from draft to closure' : 'Request and track loans for your customers'}</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              {isAccountant ? 'Create Loan' : 'Request Loan'}
            </button>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer name, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 text-sm"
              />
            </div>
            {isAccountant && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
                  hasActiveFilters
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filter
                {hasActiveFilters && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">
                    {(filterCustomerId ? 1 : 0) + (filterCollectorId ? 1 : 0)}
                  </span>
                )}
              </button>
            )}
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
              {(['all', 'draft', 'approved', 'active', 'closed'] as FilterTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                    activeTab === tab
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab} {tabCounts[tab] > 0 && <span className="ml-1 text-[10px] opacity-60">{tabCounts[tab]}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && isAccountant && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  Filter By
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <XIcon className="w-3 h-3" />
                    Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Customer</label>
                  <select
                    value={filterCustomerId}
                    onChange={(e) => setFilterCustomerId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  >
                    <option value="">All Customers</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Collector</label>
                  <select
                    value={filterCollectorId}
                    onChange={(e) => setFilterCollectorId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  >
                    <option value="">All Collectors</option>
                    {collectors.map((c) => (
                      <option key={c.id} value={c.id}>{c.username}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Loans List */}
          {filteredLoans.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Banknote className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                {searchQuery || activeTab !== 'all' ? 'No loans found' : 'No loans yet'}
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {searchQuery || activeTab !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first loan'}
              </p>
              {!searchQuery && activeTab === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Loan
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLoans.map((loan) => {
                const sc = statusConfig[loan.status];
                const StatusIcon = sc.icon;
                return (
                  <div
                    key={loan.id}
                    className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => openDetail(loan)}
                  >
                    <div className="p-4 sm:p-5">
                      {/* Top row: Customer + Status + Actions */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <Banknote className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-slate-900 text-sm">
                                {loan.Customer?.name || 'Unknown'}
                              </h3>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                                {loan.Customer?.code}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {loan.loanCode && <span className="font-semibold text-slate-600">{loan.loanCode}</span>}{loan.loanCode && ' · '}{loan.LoanProduct?.name || 'Unknown Product'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${sc.bg} ${sc.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {sc.label}
                          </span>
                        </div>
                      </div>

                      {/* Financial summary */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        <div className="bg-slate-50 rounded-xl px-3 py-2">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Principal</p>
                          <p className="text-sm font-bold text-slate-900">{formatCurrency(loan.principalAmount)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl px-3 py-2">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Held</p>
                          <p className="text-sm font-bold text-amber-600">{formatCurrency(loan.heldAmount)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl px-3 py-2">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Disbursed</p>
                          <p className="text-sm font-bold text-emerald-600">{formatCurrency(loan.disbursedAmount)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl px-3 py-2">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Repayment</p>
                          <p className="text-sm font-bold text-slate-900">{formatCurrency(loan.totalScheduledRepayment)}</p>
                        </div>
                      </div>

                      {/* Bottom row: Meta + action buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(loan.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {loan.durationDays} days
                          </span>
                          <span className="flex items-center gap-1 capitalize">
                            <Hash className="w-3 h-3" />
                            {loan.collectionFrequency}
                          </span>
                        </div>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {loan.status === 'draft' && !isAccountant && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-amber-600 bg-amber-50 rounded-lg border border-amber-200">
                              <Clock className="w-3 h-3" />
                              Pending Approval
                            </span>
                          )}
                          {isAccountant && loan.status === 'draft' && (
                            <button
                              onClick={() => handleApprove(loan.id)}
                              disabled={actionLoading === loan.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              {actionLoading === loan.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <BadgeCheck className="w-3 h-3" />}
                              Approve
                            </button>
                          )}
                          {isAccountant && loan.status === 'approved' && (
                            <button
                              onClick={() => openDisburseModal(loan.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                            >
                              <Send className="w-3 h-3" />
                              Disburse
                            </button>
                          )}
                          <button
                            onClick={() => openDetail(loan)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                            title="View Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Detail View */}
      {view === 'detail' && selectedLoan && (
        <div className="space-y-6">
          {/* Back */}
          <button
            onClick={() => { setView('list'); setSelectedLoan(null); }}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Loans
          </button>

          {/* Header card */}
          <div className="bg-gradient-to-r from-slate-800 via-slate-800 to-slate-700 rounded-2xl p-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                  <Banknote className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold">{selectedLoan.Customer?.name || 'Unknown'}</h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 rounded text-white/70">
                      {selectedLoan.Customer?.code}
                    </span>
                    {(() => {
                      const sc = statusConfig[selectedLoan.status];
                      return (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                          selectedLoan.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                          selectedLoan.status === 'approved' ? 'bg-blue-500/20 text-blue-300' :
                          selectedLoan.status === 'draft' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-slate-500/20 text-slate-300'
                        }`}>
                          {sc.label}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-sm text-white/60 mt-1">
                    {selectedLoan.loanCode && <span className="font-semibold">{selectedLoan.loanCode}</span>}{selectedLoan.loanCode && ' · '}{selectedLoan.LoanProduct?.name}
                  </p>
                  {selectedLoan.Customer?.shopName && (
                    <p className="text-sm text-white/50 mt-0.5 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {selectedLoan.Customer.shopName}
                      {selectedLoan.Customer.mobileNumber && (
                        <>&nbsp;&middot;&nbsp;{selectedLoan.Customer.mobileNumber}</>
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {selectedLoan.status === 'draft' && !isAccountant && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500/20 text-amber-300 rounded-xl text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    Pending Approval
                  </span>
                )}
                {isAccountant && selectedLoan.status === 'draft' && (
                  <button
                    onClick={() => handleApprove(selectedLoan.id)}
                    disabled={actionLoading === selectedLoan.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    {actionLoading === selectedLoan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
                    Approve
                  </button>
                )}
                {isAccountant && selectedLoan.status === 'approved' && (
                  <button
                    onClick={() => openDisburseModal(selectedLoan.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Disburse
                  </button>
                )}
                {isAccountant && selectedLoan.status === 'active' && (
                  <button
                    onClick={() => handleClose(selectedLoan.id)}
                    disabled={actionLoading === selectedLoan.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    {actionLoading === selectedLoan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Close Loan
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Principal', value: formatCurrency(selectedLoan.principalAmount), icon: Wallet, color: 'text-violet-600 bg-violet-50' },
              { label: 'Held Amount', value: formatCurrency(selectedLoan.heldAmount), icon: CreditCard, color: 'text-amber-600 bg-amber-50' },
              { label: 'Disbursed', value: formatCurrency(selectedLoan.disbursedAmount), icon: Send, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Total Repayment', value: formatCurrency(selectedLoan.totalScheduledRepayment), icon: CircleDollarSign, color: 'text-blue-600 bg-blue-50' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-4">
                <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-4.5 h-4.5" />
                </div>
                <p className="text-[11px] text-slate-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-lg font-bold text-slate-900 mt-0.5">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Loan Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-slate-400" />
                Loan Details
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Duration', value: `${selectedLoan.durationDays} days` },
                  { label: 'Frequency', value: selectedLoan.collectionFrequency, capitalize: true },
                  { label: 'Product', value: selectedLoan.LoanProduct?.name || 'N/A' },
                  { label: 'Created', value: formatDate(selectedLoan.createdAt) },
                  ...(selectedLoan.approvedAt ? [{ label: 'Approved', value: formatDate(selectedLoan.approvedAt) }] : []),
                  ...(selectedLoan.disbursedAt ? [{ label: 'Disbursed', value: formatDate(selectedLoan.disbursedAt) }] : []),
                  ...(selectedLoan.closedAt ? [{ label: 'Closed', value: formatDate(selectedLoan.closedAt) }] : []),
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{item.label}</span>
                    <span className={`font-medium text-slate-900 ${(item as any).capitalize ? 'capitalize' : ''}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-400" />
                Repayment Schedule
              </h3>
              {(selectedLoan as any).LoanSchedules && (selectedLoan as any).LoanSchedules.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
                  {(selectedLoan as any).LoanSchedules.map((schedule: any, idx: number) => (
                    <div key={schedule.id || idx} className="flex items-center justify-between text-sm py-2 px-2 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-slate-600">{formatDate(schedule.dueDate)}</span>
                        {schedule.originalDueDate && (
                          <span className="text-[9px] px-1 py-0.5 bg-amber-50 text-amber-600 rounded font-medium">
                            was {formatDate(schedule.originalDueDate)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{formatCurrency(schedule.scheduledAmount)}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          schedule.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                          schedule.status === 'overdue' ? 'bg-red-50 text-red-700' :
                          schedule.status === 'partially_paid' ? 'bg-amber-50 text-amber-700' :
                          schedule.status === 'waived' ? 'bg-purple-50 text-purple-700' :
                          schedule.status === 'skipped' ? 'bg-blue-50 text-blue-700' :
                          'bg-slate-50 text-slate-600'
                        }`}>
                          {schedule.status}
                        </span>
                        {selectedLoan?.status === 'active' && ['upcoming', 'due', 'overdue', 'partially_paid'].includes(schedule.status) && (
                          <div className="flex items-center gap-1 ml-1">
                            {isAccountant && (
                              <button
                                onClick={() => setScheduleAction({ id: schedule.id, type: 'waive', amount: Number(schedule.scheduledAmount) })}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 hover:bg-purple-100 font-medium transition-colors"
                                title="Waive"
                              >
                                Waive
                              </button>
                            )}
                            <button
                              onClick={() => setScheduleAction({ id: schedule.id, type: 'skip', amount: Number(schedule.scheduledAmount) })}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition-colors"
                              title="Skip"
                            >
                              Skip
                            </button>
                            <button
                              onClick={() => setScheduleAction({ id: schedule.id, type: 'grace', amount: Number(schedule.scheduledAmount) })}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 hover:bg-amber-100 font-medium transition-colors"
                              title="Grace Period"
                            >
                              Grace
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No schedule entries yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Collections / Payments */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-500" />
              Collections
              {loanPayments.length > 0 && (
                <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {loanPayments.filter((p: any) => p.status === 'completed').length} received
                </span>
              )}
            </h3>
            {loanPayments.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
                {loanPayments.map((payment: any, idx: number) => (
                  <div key={payment.id || idx} className="flex items-center justify-between text-sm py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        payment.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                        payment.status === 'reversed' ? 'bg-red-100 text-red-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{formatCurrency(payment.amountReceived)}</p>
                        <p className="text-[11px] text-slate-400">
                          {formatDate(payment.paymentDate)} &middot; {payment.paymentMethod}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      payment.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                      payment.status === 'reversed' ? 'bg-red-50 text-red-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                  <span className="text-xs font-medium text-slate-500">Total Collected</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {formatCurrency(loanPayments.filter((p: any) => p.status === 'completed').reduce((sum: number, p: any) => sum + Number(p.amountReceived), 0))}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Banknote className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No collections yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disburse Modal */}
      {showDisburseModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Disburse Loan</h2>
                    <p className="text-emerald-100 text-xs">Select account to deduct from</p>
                  </div>
                </div>
                <button onClick={() => setShowDisburseModal(null)} className="text-white/70 hover:text-white">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleDisburse} className="p-6 space-y-4">
              {(() => {
                const loan = loans.find(l => l.id === showDisburseModal);
                if (!loan) return null;
                return (
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600">Customer</span>
                      <span className="font-semibold text-emerald-800">{loan.Customer?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-emerald-600">Disbursement Amount</span>
                      <span className="font-bold text-emerald-800">{formatCurrency(loan.disbursedAmount)}</span>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  From Account <span className="text-red-500">*</span>
                </label>
                <select
                  value={disburseForm.accountId}
                  onChange={(e) => setDisburseForm(f => ({ ...f, accountId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  required
                >
                  <option value="">Select account</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type}) - Balance: {formatCurrency(a.balance)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Disbursement Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'cash', label: 'Cash', icon: Banknote },
                    { value: 'upi', label: 'UPI', icon: CreditCard },
                    { value: 'bank_transfer', label: 'Bank', icon: Wallet },
                  ].map(m => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setDisburseForm(f => ({ ...f, method: m.value }))}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all ${
                        disburseForm.method === m.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <m.icon className="w-5 h-5" />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisburseModal(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === showDisburseModal}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  {actionLoading === showDisburseModal && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Disburse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Loan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{isAccountant ? 'Create New Loan' : 'Request New Loan'}</h2>
                  <p className="text-xs text-slate-500">{isAccountant ? 'Set up a new loan for a customer' : 'Submit a loan request for owner approval'}</p>
                </div>
              </div>

              <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, customerId: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    required
                  >
                    <option value="">Select customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Loan Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.loanProductId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    required
                  >
                    <option value="">Select loan product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.interestRatePercent || 0}% &middot; {p.durationDays}d)
                      </option>
                    ))}
                  </select>
                  {selectedProduct && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Range: {formatCurrency(selectedProduct.minPrincipal || 0)} - {formatCurrency(selectedProduct.maxPrincipal || 0)} &middot; {selectedProduct.collectionFrequency} collection
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Principal Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.principalAmount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, principalAmount: e.target.value }))}
                      placeholder="e.g. 10000"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Held Amount
                    </label>
                    <input
                      type="number"
                      value={formData.heldAmount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, heldAmount: e.target.value }))}
                      placeholder="0"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Repayment Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Duration (Days)
                    </label>
                    <input
                      type="number"
                      value={formData.durationDays}
                      onChange={(e) => setFormData((prev) => ({ ...prev, durationDays: e.target.value }))}
                      placeholder={selectedProduct ? String(selectedProduct.durationDays) : '30'}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                      min="1"
                    />
                  </div>
                </div>

                {/* Calculated Summary */}
                {computedValues.principal > 0 && (
                  <div className="bg-gradient-to-r from-slate-50 to-emerald-50/50 rounded-xl p-4 border border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-700 mb-2">Loan Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Principal</span>
                        <span className="font-medium">{formatCurrency(computedValues.principal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Held (Profit)</span>
                        <span className="font-medium text-amber-600">-{formatCurrency(computedValues.held)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Given to Customer</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(computedValues.disbursed)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Collection</span>
                        <span className="font-bold text-slate-900">{formatCurrency(computedValues.totalRepayment)}</span>
                      </div>
                    </div>
                    {computedValues.installments > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">{computedValues.installments} {computedValues.frequency} installments</span>
                          <span className="font-bold text-blue-600">{formatCurrency(computedValues.perInstallment)} each</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === 'create'}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    {actionLoading === 'create' && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isAccountant ? 'Create Loan' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Schedule Action Modal (Waive/Skip/Grace) */}
      {scheduleAction && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setScheduleAction(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className={`p-4 text-white ${
              scheduleAction.type === 'waive' ? 'bg-gradient-to-r from-purple-500 to-violet-600' :
              scheduleAction.type === 'skip' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
              'bg-gradient-to-r from-amber-500 to-orange-600'
            }`}>
              <h3 className="text-base font-bold capitalize">{scheduleAction.type === 'grace' ? 'Apply Grace Period' : `${scheduleAction.type} Installment`}</h3>
              <p className="text-white/70 text-xs">Amount: {formatCurrency(scheduleAction.amount)}</p>
            </div>
            <div className="p-4 space-y-3">
              {scheduleAction.type === 'grace' && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Grace Days</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={scheduleGraceDays}
                    onChange={(e) => setScheduleGraceDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Reason</label>
                <textarea
                  value={scheduleActionReason}
                  onChange={(e) => setScheduleActionReason(e.target.value)}
                  rows={2}
                  placeholder={`Why ${scheduleAction.type} this installment?`}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  required
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => { setScheduleAction(null); setScheduleActionReason(''); }} className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleScheduleAction}
                  disabled={!scheduleActionReason.trim() || !!actionLoading}
                  className={`flex-1 px-3 py-2 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 ${
                    scheduleAction.type === 'waive' ? 'bg-purple-500 hover:bg-purple-600' :
                    scheduleAction.type === 'skip' ? 'bg-blue-500 hover:bg-blue-600' :
                    'bg-amber-500 hover:bg-amber-600'
                  }`}
                >
                  {actionLoading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
