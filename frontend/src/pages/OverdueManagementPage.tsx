import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

export default function OverdueManagementPage() {
  const [overdueStats, setOverdueStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [action, setAction] = useState<'waiver' | 'grace' | null>(null);
  const [formData, setFormData] = useState({
    reason: '',
    graceDays: 7,
  });

  useEffect(() => {
    loadOverdueStats();
  }, []);

  const loadOverdueStats = async () => {
    try {
      setLoading(true);
      const stats = await apiClient.getOverdueStats();
      setOverdueStats(stats);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load overdue stats');
    } finally {
      setLoading(false);
    }
  };

  const handleWaiver = async () => {
    try {
      await apiClient.waiverInstallment(selectedSchedule.id, formData.reason);
      loadOverdueStats();
      setSelectedSchedule(null);
      setAction(null);
      setFormData({ reason: '', graceDays: 7 });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to waive installment');
    }
  };

  const handleGracePeriod = async () => {
    try {
      await apiClient.applyGracePeriod(selectedSchedule.id, formData.graceDays, formData.reason);
      loadOverdueStats();
      setSelectedSchedule(null);
      setAction(null);
      setFormData({ reason: '', graceDays: 7 });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to apply grace period');
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Overdue Management</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Total Overdue Amount</p>
            <p className="text-3xl font-bold text-red-600">
              ₹{Number(overdueStats?.totalOverdueAmount || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Overdue Installments</p>
            <p className="text-3xl font-bold text-red-600">
              {overdueStats?.overdueInstallmentCount || 0}
            </p>
          </div>
        </div>

        {/* Overdue Schedules List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-red-50 p-4 border-b">
            <h2 className="text-xl font-bold text-red-900">Overdue Installments</h2>
          </div>

          {overdueStats?.overdueSchedules && overdueStats.overdueSchedules.length > 0 ? (
            <div className="divide-y">
              {overdueStats.overdueSchedules.map((schedule: any) => (
                <div key={schedule.id} className="p-6 hover:bg-gray-50">
                  <div className="grid grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 text-sm">Customer</p>
                      <p className="font-semibold">{schedule.Loan?.Customer?.name}</p>
                      <p className="text-sm text-gray-600">{schedule.Loan?.Customer?.code}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Due Date</p>
                      <p className="font-semibold">
                        {new Date(schedule.dueDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Scheduled Amount</p>
                      <p className="font-semibold">
                        ₹{Number(schedule.scheduledAmount).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Remaining Due</p>
                      <p className="font-semibold text-red-600">
                        ₹{Number(schedule.remainingDue).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Status</p>
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          schedule.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {schedule.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setAction('waiver');
                      }}
                      className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
                    >
                      Waive Installment
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setAction('grace');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Apply Grace Period
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-xl">No overdue installments!</p>
            </div>
          )}
        </div>

        {/* Action Modal */}
        {selectedSchedule && action && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">
                {action === 'waiver' ? 'Waive Installment' : 'Apply Grace Period'}
              </h2>

              <div className="bg-gray-50 p-4 rounded mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Customer:</strong> {selectedSchedule.Loan?.Customer?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Amount:</strong> ₹
                  {Number(selectedSchedule.remainingDue).toLocaleString('en-IN')}
                </p>
              </div>

              <form className="space-y-4">
                {action === 'grace' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Grace Days</label>
                    <input
                      type="number"
                      value={formData.graceDays}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          graceDays: Number(e.target.value),
                        }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                      min="1"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => (action === 'waiver' ? handleWaiver() : handleGracePeriod())}
                    className={`flex-1 text-white py-2 rounded ${
                      action === 'waiver'
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSchedule(null);
                      setAction(null);
                      setFormData({ reason: '', graceDays: 7 });
                    }}
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
