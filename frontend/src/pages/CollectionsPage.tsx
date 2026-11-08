import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api';
import Layout from '@/components/Layout';
import {
  Search,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  IndianRupee,
  X,
  Banknote,
  Smartphone,
  Building2,
  ShieldCheck,
  RefreshCw,
  User,
  FileText,
  TrendingDown,
  SkipForward,
} from 'lucide-react';

interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'upi';
  balance: number;
  status: string;
}

interface Schedule {
  id: string;
  loanId: string;
  dueDate: string;
  scheduledAmount: number;
  amountAllocated: number;
  remainingDue: number;
  status: string;
  installmentNumber?: number;
  totalInstallments?: number;
  loanCode?: string;
  skipReason?: string;
  Loan?: {
    id: string;
    loanCode?: string;
    principalAmount: number;
    totalScheduledRepayment: number;
    status: string;
    Customer?: {
      id: string;
      name: string;
      code: string;
      shopName?: string;
      mobileNumber: string;
    };
  };
}

interface OverdueStats {
  totalOverdueAmount: number;
  overdueInstallmentCount: number;
  overdueSchedules: Schedule[];
}

type TabType = 'overdue' | 'due' | 'all';
type ModalType = 'payment' | 'waiver' | 'skip' | null;

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('due');
  const [overdueStats, setOverdueStats] = useState<OverdueStats | null>(null);
  const [dueSchedules, setDueSchedules] = useState<Schedule[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'cash' as 'cash' | 'upi' | 'bank_transfer',
    reference: '',
    accountId: '',
  });
  const [waiverReason, setWaiverReason] = useState('');
  const [skipReason, setSkipReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const dueDate = new Date(selectedDate);
      const [overdue, schedules, accountsData] = await Promise.all([
        apiClient.getOverdueStats(dueDate),
        apiClient.getDueSchedules(dueDate),
        apiClient.getCompanyAccounts(),
      ]);
      setOverdueStats(overdue);
      setDueSchedules(schedules);
      setAccounts(accountsData.filter((a: any) => a.status === 'active'));
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to load collections data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const allSchedules = [
    ...(overdueStats?.overdueSchedules || []),
    ...dueSchedules.filter(
      (s) => !overdueStats?.overdueSchedules?.some((os) => os.id === s.id)
    ),
  ];

  const getFilteredSchedules = () => {
    let schedules: Schedule[] = [];
    if (activeTab === 'overdue') {
      schedules = overdueStats?.overdueSchedules || [];
    } else if (activeTab === 'due') {
      schedules = dueSchedules;
    } else {
      schedules = allSchedules;
    }

    if (search) {
      const q = search.toLowerCase();
      schedules = schedules.filter(
        (s) =>
          s.Loan?.Customer?.name?.toLowerCase().includes(q) ||
          s.Loan?.Customer?.code?.toLowerCase().includes(q) ||
          s.Loan?.Customer?.shopName?.toLowerCase().includes(q) ||
          s.Loan?.Customer?.mobileNumber?.includes(q) ||
          s.loanCode?.toLowerCase().includes(q) ||
          s.Loan?.loanCode?.toLowerCase().includes(q)
      );
    }

    return schedules;
  };

  const filteredSchedules = getFilteredSchedules();

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'overdue':
        return { label: 'Overdue', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' };
      case 'due':
        return { label: 'Due Today', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
      case 'partially_paid':
        return { label: 'Partial', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' };
      case 'upcoming':
        return { label: 'Upcoming', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' };
      case 'paid':
        return { label: 'Paid', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' };
      case 'waived':
        return { label: 'Waived', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' };
      case 'skipped':
        return { label: 'Skipped', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' };
      default:
        return { label: status, bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };
    }
  };

  const openPaymentModal = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setPaymentForm({
      amount: String(schedule.remainingDue),
      method: 'cash',
      reference: '',
      accountId: accounts.length > 0 ? accounts[0].id : '',
    });
    setModalType('payment');
  };

  const openWaiverModal = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setWaiverReason('');
    setModalType('waiver');
  };

  const openSkipModal = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setSkipReason('');
    setModalType('skip');
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;
    try {
      setSubmitting(true);
      await apiClient.recordPayment({
        loanId: selectedSchedule.loanId,
        amountReceived: Number(paymentForm.amount),
        paymentMethod: paymentForm.method,
        referenceNumber: paymentForm.reference || undefined,
        paymentDate: new Date(selectedDate).toISOString(),
        accountId: paymentForm.accountId || undefined,
        allocations: [
          {
            scheduleId: selectedSchedule.id,
            amountAllocated: Number(paymentForm.amount),
          },
        ],
      });
      showToast('Payment recorded successfully', 'success');
      setModalType(null);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to record payment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWaiver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;
    try {
      setSubmitting(true);
      await apiClient.waiverInstallment(selectedSchedule.id, waiverReason);
      showToast('Installment waived successfully', 'success');
      setModalType(null);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to waive installment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;
    try {
      setSubmitting(true);
      await apiClient.skipInstallment(selectedSchedule.id, skipReason);
      showToast('Installment skipped — extra repayment added at end', 'success');
      setModalType(null);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to skip installment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalDueAmount = dueSchedules.reduce((s, d) => s + Number(d.remainingDue), 0);
  const paidCount = allSchedules.filter((s) => s.status === 'paid').length;
  const collectionRate = allSchedules.length > 0 ? Math.round((paidCount / allSchedules.length) * 100) : 0;

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'overdue', label: 'Overdue', count: overdueStats?.overdueInstallmentCount || 0 },
    { key: 'due', label: isToday ? 'Due Today' : `Due ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`, count: dueSchedules.length },
    { key: 'all', label: 'All Pending', count: allSchedules.length },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 animate-fade-in ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
            <p className="text-sm text-gray-500 mt-1">Track due payments, manage overdue accounts, and record collections</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm font-medium text-gray-700 focus:outline-none bg-transparent"
              />
            </div>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                selectedDate === new Date().toISOString().split('T')[0]
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Today
            </button>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Overdue Amount */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total Overdue</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ₹{(overdueStats?.totalOverdueAmount || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-red-500 mt-1">
              {overdueStats?.overdueInstallmentCount || 0} installments pending
            </p>
          </div>

          {/* Due Today */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-sm font-medium text-gray-500">{isToday ? 'Due Today' : `Due ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ₹{totalDueAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-amber-500 mt-1">
              {dueSchedules.length} installments due
            </p>
          </div>

          {/* Overdue Count */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-violet-500" />
              </div>
              <span className="text-sm font-medium text-gray-500">Overdue Accounts</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {new Set((overdueStats?.overdueSchedules || []).map((s) => s.Loan?.Customer?.id)).size}
            </p>
            <p className="text-xs text-violet-500 mt-1">Unique customers with overdue</p>
          </div>

          {/* Collection Rate */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-sm font-medium text-gray-500">Collection Rate</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{collectionRate}%</p>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Search and Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, code, shop, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
            />
          </div>
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key
                      ? tab.key === 'overdue' ? 'bg-red-100 text-red-600' : tab.key === 'due' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Loading collections...</p>
            </div>
          </div>
        ) : filteredSchedules.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {activeTab === 'overdue' ? 'No Overdue Installments' : activeTab === 'due' ? 'No Due Installments Today' : 'No Pending Installments'}
            </h3>
            <p className="text-sm text-gray-500">
              {search ? 'No results match your search.' : 'All collections are up to date!'}
            </p>
          </div>
        ) : (
          /* Schedule List */
          <div className="space-y-3">
            {filteredSchedules.map((schedule) => {
              const statusConfig = getStatusConfig(schedule.status);
              const daysOverdue = getDaysOverdue(schedule.dueDate);
              const paidPercent = Number(schedule.scheduledAmount) > 0
                ? Math.round((Number(schedule.amountAllocated) / Number(schedule.scheduledAmount)) * 100)
                : 0;

              return (
                <div
                  key={schedule.id}
                  className={`bg-white rounded-2xl border ${statusConfig.border} shadow-sm hover:shadow-md transition-all overflow-hidden`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Customer Info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`w-11 h-11 rounded-xl ${statusConfig.bg} flex items-center justify-center flex-shrink-0`}>
                          <User className={`w-5 h-5 ${statusConfig.text}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <h3 className="font-semibold text-gray-900 truncate max-w-[180px] sm:max-w-none">
                              {schedule.Loan?.Customer?.name || 'Unknown Customer'}
                            </h3>
                            {(schedule.loanCode || schedule.Loan?.loanCode) && (
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-semibold flex-shrink-0">
                                {schedule.loanCode || schedule.Loan?.loanCode}
                              </span>
                            )}
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusConfig.bg} ${statusConfig.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                              {statusConfig.label}
                            </span>
                          </div>
                          {schedule.Loan?.Customer?.shopName && (
                            <p className="text-xs text-gray-600 font-medium flex items-center gap-1 mb-1">
                              <Building2 className="w-3 h-3 text-gray-400" />
                              {schedule.Loan.Customer.shopName}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            {schedule.Loan?.Customer?.code && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {schedule.Loan.Customer.code}
                              </span>
                            )}
                            {schedule.Loan?.Customer?.mobileNumber && (
                              <span className="flex items-center gap-1">
                                <Smartphone className="w-3 h-3" />
                                {schedule.Loan.Customer.mobileNumber}
                              </span>
                            )}
                            {schedule.installmentNumber && schedule.totalInstallments && (
                              <span className="flex items-center gap-1 text-gray-400">
                                Day {schedule.installmentNumber}/{schedule.totalInstallments}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount Due */}
                      <div className="text-right flex-shrink-0">
                        <p className={`text-xl font-bold ${schedule.status === 'overdue' ? 'text-red-600' : schedule.status === 'due' ? 'text-amber-600' : 'text-gray-900'}`}>
                          ₹{Number(schedule.remainingDue).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">remaining due</p>
                      </div>
                    </div>

                    {/* Details Row */}
                    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-500">Due:</span>
                        <span className="font-medium text-gray-700">
                          {new Date(schedule.dueDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        {schedule.status === 'overdue' && daysOverdue > 0 && (
                          <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-xs font-medium">
                            {daysOverdue}d overdue
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-500">Scheduled:</span>
                        <span className="font-medium text-gray-700">
                          ₹{Number(schedule.scheduledAmount).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-500">Paid:</span>
                        <span className="font-medium text-gray-700">
                          ₹{Number(schedule.amountAllocated).toLocaleString('en-IN')}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              paidPercent >= 100 ? 'bg-emerald-500' : paidPercent > 0 ? 'bg-blue-500' : 'bg-gray-200'
                            }`}
                            style={{ width: `${Math.min(paidPercent, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{paidPercent}%</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {(schedule.status === 'overdue' || schedule.status === 'due' || schedule.status === 'partially_paid' || schedule.status === 'upcoming') && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                        <button
                          onClick={() => openPaymentModal(schedule)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors shadow-sm"
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          Record Payment
                        </button>
                        {(schedule.status === 'overdue' || schedule.status === 'due') && (
                          <button
                            onClick={() => openWaiverModal(schedule)}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-purple-200 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-50 transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Waive
                          </button>
                        )}
                        <button
                          onClick={() => openSkipModal(schedule)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-amber-200 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-50 transition-colors"
                        >
                          <SkipForward className="w-3.5 h-3.5" />
                          Skip
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Payment Modal */}
        {modalType === 'payment' && selectedSchedule && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Banknote className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Record Payment</h2>
                      <p className="text-emerald-100 text-xs">{selectedSchedule.Loan?.Customer?.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setModalType(null)} className="text-white/70 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleRecordPayment} className="p-6 space-y-5">
                <div className="bg-emerald-50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-600 font-medium">Amount Due</p>
                    <p className="text-2xl font-bold text-emerald-700">₹{Number(selectedSchedule.remainingDue).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-600 font-medium">Installment Date</p>
                    <p className="text-sm font-semibold text-emerald-700">
                      {new Date(selectedSchedule.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₹) *</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    placeholder="Enter amount"
                    required
                    min="1"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'cash', label: 'Cash', icon: Banknote },
                      { value: 'upi', label: 'UPI', icon: Smartphone },
                      { value: 'bank_transfer', label: 'Bank', icon: Building2 },
                    ] as const).map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setPaymentForm((p) => ({ ...p, method: m.value }))}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all ${
                          paymentForm.method === m.value
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <m.icon className="w-5 h-5" />
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentForm.method !== 'cash' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Reference Number</label>
                    <input
                      type="text"
                      value={paymentForm.reference}
                      onChange={(e) => setPaymentForm((p) => ({ ...p, reference: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                      placeholder="Transaction ID / UTR number"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Credit to Account</label>
                  <select
                    value={paymentForm.accountId}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, accountId: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  >
                    <option value="">No account (don't record)</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type}) - ₹{Number(a.balance).toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {submitting ? 'Recording...' : 'Record Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Waiver Modal */}
        {modalType === 'waiver' && selectedSchedule && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Waive Installment</h2>
                      <p className="text-purple-100 text-xs">{selectedSchedule.Loan?.Customer?.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setModalType(null)} className="text-white/70 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleWaiver} className="p-6 space-y-5">
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-medium text-purple-700">Warning</p>
                  </div>
                  <p className="text-xs text-purple-600">
                    This will waive the installment of ₹{Number(selectedSchedule.remainingDue).toLocaleString('en-IN')}. This action marks the installment as waived and cannot be undone.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for Waiver *</label>
                  <textarea
                    value={waiverReason}
                    onChange={(e) => setWaiverReason(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 resize-none"
                    placeholder="Explain why this installment is being waived..."
                    rows={3}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 bg-purple-500 text-white rounded-xl text-sm font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {submitting ? 'Processing...' : 'Confirm Waiver'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Skip Modal */}
        {modalType === 'skip' && selectedSchedule && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <SkipForward className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Skip Installment</h2>
                      <p className="text-amber-100 text-xs">{selectedSchedule.Loan?.Customer?.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setModalType(null)} className="text-white/70 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSkip} className="p-6 space-y-5">
                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <p className="text-sm font-medium text-amber-700">Skip Info</p>
                  </div>
                  <p className="text-xs text-amber-600">
                    Skipping ₹{Number(selectedSchedule.remainingDue).toLocaleString('en-IN')} installment. This amount will be added as an extra repayment at the end of the loan, extending it by one day.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Skip *</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['Shop closed', 'Customer not available', 'Refused to pay', 'Holiday'].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSkipReason(r)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          skipReason === r
                            ? 'border-amber-400 bg-amber-50 text-amber-700'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={skipReason}
                    onChange={(e) => setSkipReason(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 resize-none"
                    placeholder="Or type a custom reason..."
                    rows={2}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {submitting ? 'Processing...' : 'Confirm Skip'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
