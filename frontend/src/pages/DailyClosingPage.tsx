import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

export default function DailyClosingPage() {
  const [closings, setClosings] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const handleCreateClosing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createDailyClosing({
        closingDate: new Date(formData.closingDate).toISOString(),
        notes: formData.notes,
      });
      setFormData({ closingDate: new Date().toISOString().split('T')[0], notes: '' });
      setShowCreateForm(false);
      loadClosings();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create closing');
    }
  };

  const handleStatusChange = async (closingId: string, action: 'submit' | 'approve' | 'reject') => {
    try {
      if (action === 'submit') await apiClient.submitClosing(closingId);
      else if (action === 'approve') await apiClient.approveClosing(closingId);
      else if (action === 'reject') await apiClient.rejectClosing(closingId);
      loadClosings();
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${action} closing`);
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Daily Closing</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : 'New Closing'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Create Daily Closing</h2>
            <form onSubmit={handleCreateClosing} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Closing Date</label>
                <input
                  type="date"
                  value={formData.closingDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, closingDate: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                />
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                Create Closing
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {closings.length > 0 ? (
            closings.map((closing) => (
              <div key={closing.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">
                      {new Date(closing.closingDate).toLocaleDateString('en-IN')}
                    </h3>
                    <p className="text-gray-600 text-sm">Net: ₹{Number(closing.netAmount).toLocaleString('en-IN')}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      closing.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : closing.status === 'submitted'
                          ? 'bg-blue-100 text-blue-800'
                          : closing.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {closing.status}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Cash</p>
                    <p className="font-semibold">₹{Number(closing.totalCashReceived).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">UPI</p>
                    <p className="font-semibold">₹{Number(closing.totalUpiReceived).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Bank</p>
                    <p className="font-semibold">₹{Number(closing.totalBankTransfer).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expenses</p>
                    <p className="font-semibold">₹{Number(closing.totalExpenses).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {closing.notes && (
                  <p className="text-gray-600 text-sm mb-4 border-l-4 border-gray-300 pl-3">{closing.notes}</p>
                )}

                <div className="flex gap-2">
                  {closing.status === 'draft' && (
                    <button
                      onClick={() => handleStatusChange(closing.id, 'submit')}
                      className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                      Submit
                    </button>
                  )}
                  {closing.status === 'submitted' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(closing.id, 'approve')}
                        className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(closing.id, 'reject')}
                        className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500 text-xl">No daily closings yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
