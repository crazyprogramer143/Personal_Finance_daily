import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash' as 'cash' | 'bank' | 'upi',
    currency: 'INR',
    bankName: '',
    accountNumber: '',
    upiId: '',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCompanyAccounts();
      setAccounts(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createAccount(formData);
      setFormData({
        name: '',
        type: 'cash',
        currency: 'INR',
        bankName: '',
        accountNumber: '',
        upiId: '',
      });
      setShowForm(false);
      loadAccounts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create account');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Accounts</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Create Account'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Create New Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>

                {formData.type === 'bank' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Number</label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                      />
                    </div>
                  </>
                )}

                {formData.type === 'upi' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">UPI ID</label>
                    <input
                      type="email"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                      placeholder="user@bank"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Create Account
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-6">
          {accounts.map((account) => (
            <div key={account.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{account.name}</h3>
                  <p className="text-gray-600 capitalize">{account.type} Account</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    account.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {account.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Available Balance</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {account.currency} {(Number(account.balance) - Number(account.heldAmount)).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Total Balance</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {account.currency} {Number(account.balance).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Held Amount</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {account.currency} {Number(account.heldAmount).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {account.type === 'bank' && (
                <div className="text-sm text-gray-600">
                  <p>Bank: {account.bankName}</p>
                  <p>Account: {account.accountNumber}</p>
                </div>
              )}

              {account.type === 'upi' && (
                <div className="text-sm text-gray-600">
                  <p>UPI ID: {account.upiId}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {accounts.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-xl">No accounts yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
