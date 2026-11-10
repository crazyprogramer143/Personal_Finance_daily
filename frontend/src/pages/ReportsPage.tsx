import { useState } from 'react';
import { apiClient } from '@/services/api';
import Layout from '@/components/Layout';
import {
  BarChart3,
  Users,
  Briefcase,
  AlertTriangle,
  Calendar,
  TrendingUp,
  IndianRupee,
  Banknote,
  Smartphone,
  Building2,
  RefreshCw,
} from 'lucide-react';

const REPORTS = [
  { id: 'collection-performance', label: 'Collection Performance', desc: 'Daily collection totals and payment method breakdown', icon: BarChart3, color: 'emerald' },
  { id: 'collector-comparison', label: 'Collector Comparison', desc: 'Compare collectors by total collected and efficiency', icon: Users, color: 'blue' },
  { id: 'loan-portfolio', label: 'Loan Portfolio', desc: 'Overview of all loans, principal, disbursed, and outstanding', icon: Briefcase, color: 'violet' },
  { id: 'overdue-analysis', label: 'Overdue Analysis', desc: 'Overdue amounts bucketed by days past due', icon: AlertTriangle, color: 'red' },
] as const;

const colorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
  violet: { bg: 'bg-violet-500', text: 'text-violet-600', border: 'border-violet-200', light: 'bg-violet-50' },
  red: { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-200', light: 'bg-red-50' },
};

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<string>('collection-performance');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
  });

  const generateReport = async (reportType: string) => {
    try {
      setLoading(true);
      setError('');
      setReportData(null);

      const fromDate = new Date(dateRange.fromDate);
      const toDate = new Date(dateRange.toDate);

      let data: any;
      switch (reportType) {
        case 'collection-performance':
          data = await apiClient.getCollectionPerformanceReport(fromDate, toDate);
          break;
        case 'collector-comparison':
          data = await apiClient.getCollectorComparisonReport(fromDate, toDate);
          break;
        case 'loan-portfolio':
          data = await apiClient.getLoanPortfolioReport();
          break;
        case 'overdue-analysis':
          data = await apiClient.getOverdueAnalysisReport();
          break;
        default:
          throw new Error('Unknown report type');
      }
      setReportData(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const activeConfig = REPORTS.find(r => r.id === activeReport)!;
  const colors = colorMap[activeConfig.color];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Generate and view financial and collection reports</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Report Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {REPORTS.map(report => {
            const c = colorMap[report.color];
            const isActive = activeReport === report.id;
            return (
              <button
                key={report.id}
                onClick={() => { setActiveReport(report.id); setReportData(null); }}
                className={`text-left p-4 rounded-2xl border-2 transition-all ${
                  isActive
                    ? `${c.border} ${c.light} shadow-sm`
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl ${isActive ? c.bg : 'bg-gray-100'} flex items-center justify-center mb-3`}>
                  <report.icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <p className={`font-semibold text-sm ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>{report.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{report.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Date Range & Generate */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">From Date</label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateRange.fromDate}
                    onChange={e => setDateRange(p => ({ ...p, fromDate: e.target.value }))}
                    className="text-sm font-medium text-gray-700 focus:outline-none bg-transparent flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">To Date</label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateRange.toDate}
                    onChange={e => setDateRange(p => ({ ...p, toDate: e.target.value }))}
                    className="text-sm font-medium text-gray-700 focus:outline-none bg-transparent flex-1"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => generateReport(activeReport)}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2.5 ${colors.bg} text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 shadow-sm`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Report Results */}
        {reportData && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className={`${colors.light} px-6 py-4 border-b ${colors.border}`}>
              <h2 className="text-lg font-bold text-gray-900">{activeConfig.label}</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {dateRange.fromDate} to {dateRange.toDate}
              </p>
            </div>

            <div className="p-6">
              {/* Collection Performance */}
              {activeReport === 'collection-performance' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard icon={IndianRupee} label="Total Collected" value={`₹${Number(reportData.totalCollected).toLocaleString('en-IN')}`} color="emerald" />
                    <StatCard icon={TrendingUp} label="Collections" value={reportData.collectionCount} color="blue" />
                    <StatCard icon={BarChart3} label="Avg per Collection" value={`₹${Math.round(Number(reportData.averagePerCollection)).toLocaleString('en-IN')}`} color="violet" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Methods</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-3">
                        <Banknote className="w-5 h-5 text-amber-600" />
                        <div>
                          <p className="text-xs text-gray-500">Cash</p>
                          <p className="font-bold text-gray-900">{reportData.paymentMethods.cash}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-500">UPI</p>
                          <p className="font-bold text-gray-900">{reportData.paymentMethods.upi}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                        <Building2 className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-500">Bank Transfer</p>
                          <p className="font-bold text-gray-900">{reportData.paymentMethods.bank_transfer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {reportData.paymentsByDate && Object.keys(reportData.paymentsByDate).length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Daily Breakdown</h3>
                      <div className="space-y-1.5">
                        {Object.entries(reportData.paymentsByDate)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([date, amount]: any) => (
                            <div key={date} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                              <span className="text-sm text-gray-600">
                                {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' })}
                              </span>
                              <span className="text-sm font-semibold text-gray-900">₹{Number(amount).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Collector Comparison */}
              {activeReport === 'collector-comparison' && (
                <div>
                  {Array.isArray(reportData) && reportData.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Collector</th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Collected</th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Collections</th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Average</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.map((collector: any, i: number) => (
                            <tr key={collector.collectorId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-4 text-sm text-gray-400">{i + 1}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-blue-500" />
                                  </div>
                                  <span className="font-medium text-sm text-gray-900">{collector.collectorName}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right font-semibold text-sm text-emerald-600">
                                ₹{Number(collector.totalCollected).toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 px-4 text-right text-sm text-gray-700">{collector.collectionCount}</td>
                              <td className="py-3 px-4 text-right text-sm text-gray-700">
                                ₹{Math.round(Number(collector.averagePerCollection)).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No data for the selected period.</p>
                  )}
                </div>
              )}

              {/* Loan Portfolio */}
              {activeReport === 'loan-portfolio' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatCard icon={Briefcase} label="Total Loans" value={reportData.totalLoans} color="blue" />
                  <StatCard icon={TrendingUp} label="Active Loans" value={reportData.activeLoans} color="emerald" />
                  <StatCard icon={BarChart3} label="Closed Loans" value={reportData.closedLoans} color="gray" />
                  <StatCard icon={IndianRupee} label="Total Principal" value={`₹${Number(reportData.totalPrincipal).toLocaleString('en-IN')}`} color="violet" />
                  <StatCard icon={IndianRupee} label="Total Disbursed" value={`₹${Number(reportData.totalDisbursed).toLocaleString('en-IN')}`} color="amber" />
                  <StatCard icon={AlertTriangle} label="Outstanding" value={`₹${Number(reportData.totalOutstanding).toLocaleString('en-IN')}`} color="red" />
                </div>
              )}

              {/* Overdue Analysis */}
              {activeReport === 'overdue-analysis' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard icon={IndianRupee} label="Total Overdue" value={`₹${Number(reportData.totalOverdueAmount).toLocaleString('en-IN')}`} color="red" />
                    <StatCard icon={AlertTriangle} label="Overdue Installments" value={reportData.totalOverdueCount} color="amber" />
                  </div>
                  {reportData.overdueByDays && Object.keys(reportData.overdueByDays).length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Overdue by Age</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(reportData.overdueByDays).map(([bucket, amount]: any) => (
                          <div key={bucket} className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                            <p className="text-xs font-medium text-red-500 mb-1">{bucket} days</p>
                            <p className="text-lg font-bold text-red-700">₹{Number(amount).toLocaleString('en-IN')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

        {!reportData && !loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Select a Report</h3>
            <p className="text-sm text-gray-500">Choose a report type above and click Generate</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

const statColorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', iconBg: 'bg-violet-100' },
  red: { bg: 'bg-red-50', text: 'text-red-700', iconBg: 'bg-red-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', iconBg: 'bg-amber-100' },
  gray: { bg: 'bg-gray-50', text: 'text-gray-700', iconBg: 'bg-gray-100' },
};

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: any; color: string }) {
  const c = statColorMap[color] || statColorMap.gray;
  return (
    <div className={`${c.bg} rounded-xl p-4 border border-opacity-50`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg ${c.iconBg} flex items-center justify-center`}>
          <Icon className={`w-3.5 h-3.5 ${c.text}`} />
        </div>
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <p className={`text-xl font-bold ${c.text}`}>{value}</p>
    </div>
  );
}
