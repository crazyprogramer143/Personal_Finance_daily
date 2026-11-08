import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

export default function LoansPage() {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [loans, setLoans] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customerId: '',
    loanProductId: '',
    principalAmount: 0,
    heldAmount: 0,
    durationDays: 30,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [customersData, productsData] = await Promise.all([
        apiClient.getCustomers(),
        apiClient.getLoanProducts(),
      ]);
      setCustomers(customersData);
      setProducts(productsData);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.createLoan(formData);
      setLoans([...loans, response]);
      setFormData({
        customerId: '',
        loanProductId: '',
        principalAmount: 0,
        heldAmount: 0,
        durationDays: 30,
      });
      setView('list');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create loan');
    }
  };

  const handleApprove = async (loanId: string) => {
    try {
      await apiClient.approveLoan(loanId);
      if (selectedLoan?.id === loanId) {
        setSelectedLoan((prev: any) => ({ ...prev, status: 'approved' }));
      }
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to approve loan');
    }
  };

  const handleDisburse = async (loanId: string) => {
    try {
      await apiClient.disburseLoan(loanId, {
        disbursementDate: new Date().toISOString(),
        disbursementMethod: 'cash',
      });
      if (selectedLoan?.id === loanId) {
        setSelectedLoan((prev: any) => ({ ...prev, status: 'active' }));
      }
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to disburse loan');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['principalAmount', 'heldAmount', 'durationDays'].includes(name)
        ? Number(value)
        : value,
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
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Loans Management</h1>
          {view === 'list' && (
            <button
              onClick={() => setView('create')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Loan
            </button>
          )}
          {view === 'create' && (
            <button
              onClick={() => setView('list')}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to List
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {view === 'create' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Create New Loan</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <select
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers.map((cust) => (
                      <option key={cust.id} value={cust.id}>
                        {cust.name} ({cust.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loan Product</label>
                  <select
                    name="loanProductId"
                    value={formData.loanProductId}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Principal Amount (₹)</label>
                  <input
                    type="number"
                    name="principalAmount"
                    value={formData.principalAmount}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Held Amount (₹)</label>
                  <input
                    type="number"
                    name="heldAmount"
                    value={formData.heldAmount}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (Days)</label>
                  <input
                    type="number"
                    name="durationDays"
                    value={formData.durationDays}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                  />
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <p className="text-sm text-gray-600">
                  <strong>Disburse Amount:</strong> ₹{(formData.principalAmount - formData.heldAmount).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Create Loan
              </button>
            </form>
          </div>
        )}

        {view === 'list' && (
          <div className="space-y-6">
            {loans.length > 0 ? (
              loans.map((loan) => (
                <div key={loan.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">Loan #{loan.id.slice(0, 8)}</h3>
                      <p className="text-gray-600">Customer: {loan.customerId}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-4 py-2 rounded-full font-medium ${
                          loan.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : loan.status === 'approved'
                              ? 'bg-blue-100 text-blue-800'
                              : loan.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {loan.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4 bg-gray-50 p-4 rounded">
                    <div>
                      <p className="text-gray-600 text-sm">Principal</p>
                      <p className="text-lg font-semibold">₹{Number(loan.principalAmount).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Held Amount</p>
                      <p className="text-lg font-semibold">₹{Number(loan.heldAmount).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Disbursed</p>
                      <p className="text-lg font-semibold">
                        ₹{(Number(loan.principalAmount) - Number(loan.heldAmount)).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Duration</p>
                      <p className="text-lg font-semibold">{loan.durationDays} days</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {loan.status === 'draft' && (
                      <button
                        onClick={() => handleApprove(loan.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Approve
                      </button>
                    )}
                    {loan.status === 'approved' && (
                      <button
                        onClick={() => handleDisburse(loan.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Disburse
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedLoan(loan)}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-xl">No loans yet. Create one to get started!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
