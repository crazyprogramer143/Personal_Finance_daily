import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import Layout from '@/components/Layout';
import {
  CalendarCheck,
  Plus,
  Send,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  IndianRupee,
  Banknote,
  Smartphone,
  Building2,
  BadgeDollarSign,
  ArrowDownUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-600', icon: FileText },
  submitted: { label: 'Submitted', bg: 'bg-blue-50', text: 'text-blue-700', icon: Send },
  approved: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
};

export default function DailyClosingPage() {
  const [closings, setClosings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, any>>({});
  const [formData, setFormData] = useState({
    closingDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    loadClosings();
  }, []);

  const loadClosings = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCompanyClosings();
      setClosings(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load closings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiClient.createDailyClosing({
        closingDate: new Date(formData.closingDate).toISOString(),
        notes: formData.notes,
      });
      setFormData({ closingDate: new Date().toISOString().split('T')[0], notes: '' });
      setShowCreate(false);
      loadClosings();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create closing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id: string, action: 'submit' | 'approve' | 'reject') => {
    try {
      if (action === 'submit') await apiClient.submitClosing(id);
      else if (action === 'approve') await apiClient.approveClosing(id);
      else if (action === 'reject') await apiClient.rejectClosing(id);
      loadClosings();
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${action} closing`);
    }
  };

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!details[id]) {
      try {
        const data = await apiClient.getClosingDetails(id);
        setDetails((prev) => ({ ...prev, [id]: data }));
      } catch {
        // silently fail
      }
    }
  };

  const fmt = (n: number) => Number(n).toLocaleString('en-IN');

  const totalNet = closings
    .filter((c) => c.status === 'approved')
    .reduce((sum, c) => sum + Number(c.netAmount), 0);
  const draftCount = closings.filter((c) => c.status === 'draft').length;
  const submittedCount = closings.filter((c) => c.status === 'submitted').length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Closing</h1>
            <p className="text-sm text-gray-500 mt-1">End-of-day cash reconciliation and approval workflow</p>
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
            {showCreate ? 'Cancel' : 'New Closing'}
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
                <p className="text-xs text-slate-500 font-medium">Approved Net Total</p>
                <p className="text-lg font-bold text-slate-900">₹{fmt(totalNet)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Drafts</p>
                <p className="text-lg font-bold text-slate-900">{draftCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Awaiting Approval</p>
                <p className="text-lg font-bold text-slate-900">{submittedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Form */}
        {showCreate && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Create Daily Closing</h2>
            <p className="text-xs text-slate-500 mb-4">
              This will auto-calculate collections and expenses for the selected date
            </p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Closing Date</label>
                  <input
                    type="date"
                    value={formData.closingDate}
                    onChange={(e) => setFormData((p) => ({ ...p, closingDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Notes (optional)</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Any remarks for this closing..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
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
                    <CalendarCheck className="w-4 h-4" />
                  )}
                  Generate Closing
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Closings list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : closings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No daily closings yet</p>
            <p className="text-sm text-slate-400 mt-1">Click "New Closing" to generate one</p>
          </div>
        ) : (
          <div className="space-y-2">
            {closings.map((closing) => {
              const sc = STATUS_CONFIG[closing.status] || STATUS_CONFIG.draft;
              const StatusIcon = sc.icon;
              const isExpanded = expandedId === closing.id;
              const detail = details[closing.id];
              const totalReceived =
                Number(closing.totalCashReceived) +
                Number(closing.totalUpiReceived) +
                Number(closing.totalBankTransfer);

              return (
                <div
                  key={closing.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors"
                >
                  {/* Main row */}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Calendar className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-slate-900">
                                {new Date(closing.closingDate).toLocaleDateString('en-IN', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${sc.bg} ${sc.text}`}>
                                <StatusIcon className="w-3 h-3" />
                                {sc.label}
                              </span>
                            </div>
                            {closing.notes && (
                              <p className="text-xs text-slate-400 mt-1 truncate">{closing.notes}</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`text-lg font-bold ${Number(closing.netAmount) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              ₹{fmt(closing.netAmount)}
                            </p>
                            <p className="text-[11px] text-slate-400">Net</p>
                          </div>
                        </div>

                        {/* Payment method breakdown */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Banknote className="w-3.5 h-3.5 text-green-500" />
                            Cash ₹{fmt(closing.totalCashReceived)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Smartphone className="w-3.5 h-3.5 text-purple-500" />
                            UPI ₹{fmt(closing.totalUpiReceived)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-blue-500" />
                            Bank ₹{fmt(closing.totalBankTransfer)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <BadgeDollarSign className="w-3.5 h-3.5 text-red-400" />
                            Exp ₹{fmt(closing.totalExpenses)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                          {closing.status === 'draft' && (
                            <button
                              onClick={() => handleAction(closing.id, 'submit')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Submit for Approval
                            </button>
                          )}
                          {closing.status === 'submitted' && (
                            <>
                              <button
                                onClick={() => handleAction(closing.id, 'approve')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-100 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(closing.id, 'reject')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => toggleExpand(closing.id)}
                            className="ml-auto inline-flex items-center gap-1 px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && detail && (
                    <div className="px-4 pb-4 border-t border-slate-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        {/* Summary */}
                        <div className="bg-slate-50 rounded-lg p-3">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2">Summary</h4>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Total Collections</span>
                              <span className="font-medium text-emerald-600">₹{fmt(totalReceived)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Total Expenses</span>
                              <span className="font-medium text-red-600">- ₹{fmt(closing.totalExpenses)}</span>
                            </div>
                            <div className="flex justify-between pt-1.5 border-t border-slate-200">
                              <span className="font-medium text-slate-700">Net Amount</span>
                              <span className="font-bold text-slate-900">₹{fmt(closing.netAmount)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Payment methods */}
                        <div className="bg-slate-50 rounded-lg p-3">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2">
                            Payments ({detail.summary?.totalPayments || 0})
                          </h4>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="inline-flex items-center gap-1 text-slate-500">
                                <Banknote className="w-3 h-3 text-green-500" /> Cash
                              </span>
                              <span className="font-medium">{detail.summary?.paymentsByMethod?.cash || 0} txns</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="inline-flex items-center gap-1 text-slate-500">
                                <Smartphone className="w-3 h-3 text-purple-500" /> UPI
                              </span>
                              <span className="font-medium">{detail.summary?.paymentsByMethod?.upi || 0} txns</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="inline-flex items-center gap-1 text-slate-500">
                                <Building2 className="w-3 h-3 text-blue-500" /> Bank Transfer
                              </span>
                              <span className="font-medium">{detail.summary?.paymentsByMethod?.bank_transfer || 0} txns</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
