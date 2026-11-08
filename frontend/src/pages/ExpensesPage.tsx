import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

export default function ExpensesPage() {
  const [tab, setTab] = useState<'list' | 'create'>('list');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    category: '',
    amount: 0,
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadExpenses();
  }, [tab]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCompanyExpenses();
      setExpenses(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createExpense({
        ...formData,
        expenseDate: new Date(formData.expenseDate).toISOString(),
      });
      setFormData({
        category: '',
        amount: 0,
        description: '',
        expenseDate: new Date().toISOString().split('T')[0],
      });
      setTab('list');
      loadExpenses();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create expense');
    }
  };

  const handleApprove = async (expenseId: string) => {
    try {
      await apiClient.approveExpense(expenseId);
      loadExpenses();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to approve expense');
    }
  };

  const handleReject = async (expenseId: string) => {
    try {
      await apiClient.rejectExpense(expenseId);
      loadExpenses();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject expense');
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
          <h1 className="text-4xl font-bold text-gray-900">Expenses</h1>
          <button
            onClick={() => setTab(tab === 'list' ? 'create' : 'list')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {tab === 'list' ? 'New Expense' : 'Back to List'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {tab === 'create' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Create Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Travel, Rent, Salary"
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={formData.expenseDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expenseDate: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                Create Expense
              </button>
            </form>
          </div>
        )}

        {tab === 'list' && (
          <div className="space-y-4">
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <div key={expense.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold">{expense.category}</h3>
                      <p className="text-gray-600 text-sm">
                        {new Date(expense.expenseDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{Number(expense.amount).toLocaleString('en-IN')}
                      </p>
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          expense.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : expense.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {expense.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-3">{expense.description}</p>

                  {expense.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(expense.id)}
                        className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(expense.id)}
                        className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-xl">No expenses yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
