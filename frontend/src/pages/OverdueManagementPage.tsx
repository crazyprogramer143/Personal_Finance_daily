import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api';
import Layout from '@/components/Layout';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  X,
  ShieldCheck,
  CalendarPlus,
  RefreshCw,
  User,
  FileText,
  Building2,
  Smartphone,
  TrendingDown,
  IndianRupee,
  Search,
  Banknote,
  SkipForward,
} from 'lucide-react';

interface Schedule {
  id: string;
  loanId: string;
  dueDate: string;
  scheduledAmount: number;
  amountAllocated: number;
  remainingDue: number;
  status: string;
  Loan?: {
    id: string;
    loanCode?: string;
    principalAmount: number;
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

type ModalType = 'payment' | 'waiver' | 'grace' | 'skip' | null;

export default function OverdueManagementPage() {
  const [overdueSchedules, setOverdueSchedules] = useState<Schedule[]>([]);
  const [totalOverdue, setTotalOverdue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [waiverReason, setWaiverReason] = useState('');
  const [skipReason, setSkipReason] = useState('');
  const [graceForm, setGraceForm] = useState({ days: '', reason: '' });
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'cash' as 'cash' | 'upi' | 'bank_transfer', reference: '', accountId: '' });
  const [accounts, setAccounts] = useState<any[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [stats, accountsData] = await Promise.all([
        apiClient.getOverdueStats(),
        apiClient.getCompanyAccounts(),
      ]);
      setOverdueSchedules(stats.overdueSchedules || []);
      setTotalOverdue(stats.totalOverdueAmount || 0);
      setAccounts(accountsData.filter((a: any) => a.status === 'active'));
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to load overdue data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return Math.floor((today.getTime() - due.getTime()) / 86400000);
  };

  const filtered = search
    ? overdueSchedules.filter(s => {
        const q = search.toLowerCase();
        return (
          s.Loan?.Customer?.name?.toLowerCase().includes(q) ||
          s.Loan?.Customer?.code?.toLowerCase().includes(q) ||
          s.Loan?.Customer?.shopName?.toLowerCase().includes(q) ||
          s.Loan?.loanCode?.toLowerCase().includes(q)
        );
      })
    : overdueSchedules;

  const uniqueCustomers = new Set(filtered.map(s => s.Loan?.Customer?.id)).size;

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
        paymentDate: new Date().toISOString(),
        accountId: paymentForm.accountId || undefined,
        allocations: [{ scheduleId: selectedSchedule.id, amountAllocated: Number(paymentForm.amount) }],
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
      showToast('Installment waived', 'success');
      setModalType(null);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to waive', 'error');
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
      showToast(err.response?.data?.error || 'Failed to skip', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGrace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;
    try {
      setSubmitting(true);
      await apiClient.applyGracePeriod(selectedSchedule.id, Number(graceForm.days), graceForm.reason);
      showToast('Grace period applied', 'success');
      setModalType(null);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to apply grace', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Overdue Management</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage all overdue installments</p>
          </div>
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total Overdue</span>
            </div>
            <p className="text-2xl font-bold text-red-600">₹{totalOverdue.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-sm font-medium text-gray-500">Overdue Installments</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <User className="w-5 h-5 text-violet-500" />
              </div>
              <span className="text-sm font-medium text-gray-500">Affected Customers</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{uniqueCustomers}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, code, shop, or loan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
          />
        </div>

        {/* Overdue List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-red-200 border-t-red-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Loading overdue data...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Overdue Installments</h3>
            <p className="text-sm text-gray-500">All collections are current!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(schedule => {
              const days = getDaysOverdue(schedule.dueDate);
              const paidPercent = Number(schedule.scheduledAmount) > 0
                ? Math.round((Number(schedule.amountAllocated) / Number(schedule.scheduledAmount)) * 100)
                : 0;
              return (
                <div key={schedule.id} className="bg-white rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-semibold text-gray-900 truncate">{schedule.Loan?.Customer?.name || 'Unknown'}</h3>
                            {schedule.Loan?.loanCode && (
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-semibold">{schedule.Loan.loanCode}</span>
                            )}
                            <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-medium">{days}d overdue</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            {schedule.Loan?.Customer?.code && (
                              <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{schedule.Loan.Customer.code}</span>
                            )}
                            {schedule.Loan?.Customer?.shopName && (
                              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{schedule.Loan.Customer.shopName}</span>
                            )}
                            {schedule.Loan?.Customer?.mobileNumber && (
                              <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" />{schedule.Loan.Customer.mobileNumber}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold text-red-600">₹{Number(schedule.remainingDue).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-400 mt-0.5">remaining</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-500">Due:</span>
                        <span className="font-medium text-gray-700">{new Date(schedule.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-500">Scheduled:</span>
                        <span className="font-medium text-gray-700">₹{Number(schedule.scheduledAmount).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-500">Paid:</span>
                        <span className="font-medium text-gray-700">₹{Number(schedule.amountAllocated).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${paidPercent > 0 ? 'bg-blue-500' : 'bg-gray-200'}`} style={{ width: `${Math.min(paidPercent, 100)}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{paidPercent}%</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                      <button onClick={() => { setSelectedSchedule(schedule); setPaymentForm({ amount: String(schedule.remainingDue), method: 'cash', reference: '', accountId: accounts[0]?.id || '' }); setModalType('payment'); }} className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors shadow-sm">
                        <Banknote className="w-3.5 h-3.5" /> Record Payment
                      </button>
                      <button onClick={() => { setSelectedSchedule(schedule); setWaiverReason(''); setModalType('waiver'); }} className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-purple-200 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-50 transition-colors">
                        <ShieldCheck className="w-3.5 h-3.5" /> Waive
                      </button>
                      <button onClick={() => { setSelectedSchedule(schedule); setGraceForm({ days: '', reason: '' }); setModalType('grace'); }} className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-50 transition-colors">
                        <CalendarPlus className="w-3.5 h-3.5" /> Grace Period
                      </button>
                      <button onClick={() => { setSelectedSchedule(schedule); setSkipReason(''); setModalType('skip'); }} className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-amber-200 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-50 transition-colors">
                        <SkipForward className="w-3.5 h-3.5" /> Skip
                      </button>
                    </div>
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
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Banknote className="w-5 h-5 text-white" /></div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Record Payment</h2>
                      <p className="text-emerald-100 text-xs">{selectedSchedule.Loan?.Customer?.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setModalType(null)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
              </div>
              <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
                <div className="bg-emerald-50 rounded-xl p-4 flex justify-between">
                  <div><p className="text-xs text-emerald-600 font-medium">Amount Due</p><p className="text-2xl font-bold text-emerald-700">₹{Number(selectedSchedule.remainingDue).toLocaleString('en-IN')}</p></div>
                  <div className="text-right"><p className="text-xs text-emerald-600 font-medium">Overdue</p><p className="text-sm font-semibold text-emerald-700">{getDaysOverdue(selectedSchedule.dueDate)} days</p></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₹) *</label>
                  <input type="number" value={paymentForm.amount} onChange={e => setPaymentForm(p => ({ ...p, amount: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" required min="1" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([{ value: 'cash', label: 'Cash', icon: Banknote }, { value: 'upi', label: 'UPI', icon: Smartphone }, { value: 'bank_transfer', label: 'Bank', icon: Building2 }] as const).map(m => (
                      <button key={m.value} type="button" onClick={() => setPaymentForm(p => ({ ...p, method: m.value }))} className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 text-xs font-medium transition-all ${paymentForm.method === m.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500'}`}>
                        <m.icon className="w-4 h-4" />{m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Credit to Account</label>
                  <select value={paymentForm.accountId} onChange={e => setPaymentForm(p => ({ ...p, accountId: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400">
                    <option value="">No account</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type}) - ₹{Number(a.balance).toLocaleString('en-IN')}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalType(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-50">{submitting ? 'Recording...' : 'Record Payment'}</button>
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
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-white" /></div>
                    <div><h2 className="text-lg font-bold text-white">Waive Installment</h2><p className="text-purple-100 text-xs">{selectedSchedule.Loan?.Customer?.name}</p></div>
                  </div>
                  <button onClick={() => setModalType(null)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
              </div>
              <form onSubmit={handleWaiver} className="p-6 space-y-4">
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-xs text-purple-600">This will waive ₹{Number(selectedSchedule.remainingDue).toLocaleString('en-IN')}. This action cannot be undone.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason *</label>
                  <textarea value={waiverReason} onChange={e => setWaiverReason(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 resize-none" rows={3} required placeholder="Why is this being waived?" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalType(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-purple-500 text-white rounded-xl text-sm font-medium hover:bg-purple-600 disabled:opacity-50">{submitting ? 'Processing...' : 'Confirm Waiver'}</button>
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
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><SkipForward className="w-5 h-5 text-white" /></div>
                    <div><h2 className="text-lg font-bold text-white">Skip Installment</h2><p className="text-amber-100 text-xs">{selectedSchedule.Loan?.Customer?.name}</p></div>
                  </div>
                  <button onClick={() => setModalType(null)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
              </div>
              <form onSubmit={handleSkip} className="p-6 space-y-4">
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-xs text-amber-600">Skipping ₹{Number(selectedSchedule.remainingDue).toLocaleString('en-IN')}. This amount will be added as an extra repayment at the end of the loan.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['Shop closed', 'Customer not available', 'Refused to pay', 'Holiday'].map(r => (
                      <button key={r} type="button" onClick={() => setSkipReason(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${skipReason === r ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>{r}</button>
                    ))}
                  </div>
                  <textarea value={skipReason} onChange={e => setSkipReason(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 resize-none" rows={2} required placeholder="Or type a custom reason..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalType(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 disabled:opacity-50">{submitting ? 'Processing...' : 'Confirm Skip'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Grace Period Modal */}
        {modalType === 'grace' && selectedSchedule && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><CalendarPlus className="w-5 h-5 text-white" /></div>
                    <div><h2 className="text-lg font-bold text-white">Apply Grace Period</h2><p className="text-blue-100 text-xs">{selectedSchedule.Loan?.Customer?.name}</p></div>
                  </div>
                  <button onClick={() => setModalType(null)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
              </div>
              <form onSubmit={handleGrace} className="p-6 space-y-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-blue-600">Current due: <strong>{new Date(selectedSchedule.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
                  {graceForm.days && Number(graceForm.days) > 0 && (
                    <p className="text-xs text-blue-600 mt-1">New due: <strong>{(() => { const d = new Date(selectedSchedule.dueDate); d.setDate(d.getDate() + Number(graceForm.days)); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); })()}</strong></p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Grace Days *</label>
                  <input type="number" value={graceForm.days} onChange={e => setGraceForm(f => ({ ...f, days: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" required min="1" max="90" placeholder="Number of days" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason *</label>
                  <textarea value={graceForm.reason} onChange={e => setGraceForm(f => ({ ...f, reason: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" rows={3} required placeholder="Reason for extending..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalType(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50">{submitting ? 'Applying...' : 'Apply Grace Period'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
