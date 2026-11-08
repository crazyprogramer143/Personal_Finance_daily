import { useState } from 'react';
import { apiClient } from '@/services/api';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<string>('collection-performance');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Reports & Analytics</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Report Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { id: 'collection-performance', label: 'Collection Performance' },
            { id: 'collector-comparison', label: 'Collector Comparison' },
            { id: 'loan-portfolio', label: 'Loan Portfolio' },
            { id: 'overdue-analysis', label: 'Overdue Analysis' },
          ].map((report) => (
            <button
              key={report.id}
              onClick={() => {
                setActiveReport(report.id);
                setReportData(null);
              }}
              className={`p-4 rounded-lg text-left transition ${
                activeReport === report.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-900 hover:shadow-md'
              }`}
            >
              <p className="font-bold">{report.label}</p>
              <p className={`text-sm ${activeReport === report.id ? 'text-blue-100' : 'text-gray-600'}`}>
                Click to view this report
              </p>
            </button>
          ))}
        </div>

        {/* Date Range Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Date Range</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">From Date</label>
              <input
                type="date"
                value={dateRange.fromDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, fromDate: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">To Date</label>
              <input
                type="date"
                value={dateRange.toDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, toDate: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 border p-2"
              />
            </div>
          </div>
          <button
            onClick={() => generateReport(activeReport)}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        {/* Report Display */}
        {reportData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeReport === 'collection-performance' && reportData && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Collection Performance Report</h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded border border-green-200">
                    <p className="text-gray-600 text-sm">Total Collected</p>
                    <p className="text-3xl font-bold text-green-600">
                      ₹{Number(reportData.totalCollected).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <p className="text-gray-600 text-sm">Collection Count</p>
                    <p className="text-3xl font-bold text-blue-600">{reportData.collectionCount}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded border border-purple-200">
                    <p className="text-gray-600 text-sm">Average per Collection</p>
                    <p className="text-3xl font-bold text-purple-600">
                      ₹{Number(reportData.averagePerCollection).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-orange-50 p-4 rounded">
                    <p className="font-bold">Cash: {reportData.paymentMethods.cash}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded">
                    <p className="font-bold">UPI: {reportData.paymentMethods.upi}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="font-bold">Bank: {reportData.paymentMethods.bank_transfer}</p>
                  </div>
                </div>
              </div>
            )}

            {activeReport === 'collector-comparison' && reportData && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Collector Comparison Report</h2>
                <table className="w-full">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left">Collector</th>
                      <th className="px-4 py-2 text-right">Total Collected</th>
                      <th className="px-4 py-2 text-right">Collections</th>
                      <th className="px-4 py-2 text-right">Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((collector: any) => (
                      <tr key={collector.collectorId} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{collector.collectorName}</td>
                        <td className="px-4 py-3 text-right font-semibold">
                          ₹{Number(collector.totalCollected).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right">{collector.collectionCount}</td>
                        <td className="px-4 py-3 text-right">
                          ₹{Number(collector.averagePerCollection).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeReport === 'loan-portfolio' && reportData && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Loan Portfolio Report</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded">
                    <p className="text-gray-600">Total Loans</p>
                    <p className="text-3xl font-bold text-blue-600">{reportData.totalLoans}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-gray-600">Active Loans</p>
                    <p className="text-3xl font-bold text-green-600">{reportData.activeLoans}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded">
                    <p className="text-gray-600">Total Principal</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ₹{Number(reportData.totalPrincipal).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded">
                    <p className="text-gray-600">Total Disbursed</p>
                    <p className="text-2xl font-bold text-orange-600">
                      ₹{Number(reportData.totalDisbursed).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded">
                    <p className="text-gray-600">Outstanding</p>
                    <p className="text-2xl font-bold text-red-600">
                      ₹{Number(reportData.totalOutstanding).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-gray-600">Closed Loans</p>
                    <p className="text-3xl font-bold text-gray-600">{reportData.closedLoans}</p>
                  </div>
                </div>
              </div>
            )}

            {activeReport === 'overdue-analysis' && reportData && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Overdue Analysis Report</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-red-50 p-4 rounded border border-red-200">
                    <p className="text-gray-600 text-sm">Total Overdue Amount</p>
                    <p className="text-3xl font-bold text-red-600">
                      ₹{Number(reportData.totalOverdueAmount).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded border border-red-200">
                    <p className="text-gray-600 text-sm">Overdue Count</p>
                    <p className="text-3xl font-bold text-red-600">
                      {reportData.totalOverdueCount}
                    </p>
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-3">Overdue by Days</h3>
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(reportData.overdueByDays).map(([bucket, amount]: any) => (
                    <div key={bucket} className="bg-gray-50 p-3 rounded text-center">
                      <p className="text-sm text-gray-600">{bucket} days</p>
                      <p className="font-bold">₹{Number(amount).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
