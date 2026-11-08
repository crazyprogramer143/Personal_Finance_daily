import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

export default function LoanProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    interestRatePercent: 0,
    minPrincipal: 0,
    maxPrincipal: 0,
    durationDays: 30,
    collectionFrequency: 'daily',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getLoanProducts();
      setProducts(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createLoanProduct(formData);
      setFormData({
        name: '',
        interestRatePercent: 0,
        minPrincipal: 0,
        maxPrincipal: 0,
        durationDays: 30,
        collectionFrequency: 'daily',
      });
      setShowForm(false);
      loadProducts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create product');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['interestRatePercent', 'minPrincipal', 'maxPrincipal', 'durationDays'].includes(name)
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Loan Products</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Create Product'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Create Loan Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
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
                  <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
                  <input
                    type="number"
                    name="interestRatePercent"
                    value={formData.interestRatePercent}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Min Principal</label>
                  <input
                    type="number"
                    name="minPrincipal"
                    value={formData.minPrincipal}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Principal</label>
                  <input
                    type="number"
                    name="maxPrincipal"
                    value={formData.maxPrincipal}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                    required
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
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Collection Frequency</label>
                  <select
                    name="collectionFrequency"
                    value={formData.collectionFrequency}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Create Product
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-2">{product.name}</h3>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Interest Rate</p>
                  <p className="font-semibold">{product.interestRatePercent}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Min Principal</p>
                  <p className="font-semibold">₹{Number(product.minPrincipal).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Max Principal</p>
                  <p className="font-semibold">₹{Number(product.maxPrincipal).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="font-semibold">{product.durationDays} days</p>
                </div>
                <div>
                  <p className="text-gray-600">Collection Frequency</p>
                  <p className="font-semibold">{product.collectionFrequency}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className={`font-semibold ${product.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {product.status}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-xl">No loan products yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
