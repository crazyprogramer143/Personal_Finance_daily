import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

export default function CollectionsPage() {
  const [tab, setTab] = useState<'due' | 'customers' | 'stats'>('due');
  const [dueSchedules, setDueSchedules] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    loanId: '',
    scheduleIds: [] as string[],
    amountReceived: 0,
    paymentMethod: 'cash' as 'cash' | 'upi' | 'bank_transfer',
  });

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      if (tab === 'due') {
        const schedules = await apiClient.getDueSchedules();
        setDueSchedules(schedules);
      } else if (tab === 'stats') {
        const collectionStats = await apiClient.getCollectionStats();
        setStats(collectionStats);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };


  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const allocations = paymentForm.scheduleIds.map((scheduleId) => ({
        scheduleId,
        amountAllocated: paymentForm.amountReceived / paymentForm.scheduleIds.length,
      }));

      await apiClient.recordPayment({
        loanId: paymentForm.loanId,
        amountReceived: paymentForm.amountReceived,
        paymentMethod: paymentForm.paymentMethod,
        paymentDate: new Date().toISOString(),
        allocations,
      });

      setRecordingPayment(false);
      setPaymentForm({
        loanId: '',
        scheduleIds: [],
        amountReceived: 0,
        paymentMethod: 'cash',
      });

      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to record payment');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Collections</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setTab('due')}
            className={`px-6 py-2 rounded-lg font-medium ${
              tab === 'due'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Due Schedules
          </button>
          <button
            onClick={() => setTab('customers')}
            className={`px-6 py-2 rounded-lg font-medium ${
              tab === 'customers'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Find Customer
          </button>
          <button
            onClick={() => setTab('stats')}
            className={`px-6 py-2 rounded-lg font-medium ${
              tab === 'stats'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            My Stats
          </button>
        </div>

        {/* Due Schedules Tab */}
        {tab === 'due' && (
          <div className="space-y-4">
            {dueSchedules.length > 0 ? (
              dueSchedules.map((schedule) => (
                <div key={schedule.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">
                        {schedule.Loan?.Customer?.name || 'Customer'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Code: {schedule.Loan?.Customer?.code}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Mobile: {schedule.Loan?.Customer?.mobileNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">
                        ₹{Number(schedule.remainingDue).toLocaleString('en-IN')}
                      </p>
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          schedule.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : schedule.status === 'due'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {schedule.status}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
                    <p>
                      <strong>Due Date:</strong>{' '}
                      {new Date(schedule.dueDate).toLocaleDateString('en-IN')}
                    </p>
                    <p>
                      <strong>Scheduled Amount:</strong> ₹
                      {Number(schedule.scheduledAmount).toLocaleString('en-IN')}
                    </p>
                    <p>
                      <strong>Received:</strong> ₹
                      {Number(schedule.amountAllocated).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setRecordingPayment(true);
                      setPaymentForm({
                        loanId: schedule.Loan?.id || '',
                        scheduleIds: [schedule.id],
                        amountReceived: 0,
                        paymentMethod: 'cash',
                      });
                    }}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  >
                    Record Payment
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-xl">No due schedules today!</p>
              </div>
            )}
          </div>
        )}

        {/* Find Customer Tab */}
        {tab === 'customers' && (
          <div className="space-y-6">
            {/* Assigned customers */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">My Assigned Customers</h2>
              <div className="space-y-2">
                {/* Customer list would go here - placeholder */}
                <p className="text-gray-600">
                  Select a customer to view their due loans
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {tab === 'stats' && stats && (
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Total Collected Today</p>
              <p className="text-3xl font-bold text-green-600">
                ₹{Number(stats.totalCollected).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Collections Count</p>
              <p className="text-3xl font-bold text-blue-600">{stats.collectionCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Average Per Collection</p>
              <p className="text-3xl font-bold text-purple-600">
                ₹{Number(stats.averageCollection).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}

        {/* Payment Recording Modal */}
        {recordingPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Record Payment</h2>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                  <input
                    type="number"
                    value={paymentForm.amountReceived}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        amountReceived: Number(e.target.value),
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        paymentMethod: e.target.value as any,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  >
                    Record
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecordingPayment(false)}
                    className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
