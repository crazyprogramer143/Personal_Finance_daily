import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/services/api';
import Layout from '@/components/Layout';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Package,
  Calendar,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface LoanProduct {
  id: string;
  name: string;
  interestRatePercent?: number;
  minPrincipal?: number;
  maxPrincipal?: number;
  durationDays: number;
  collectionFrequency: 'daily' | 'weekly' | 'monthly';
  status: 'active' | 'inactive';
  description?: string;
  createdAt: string;
}

type FilterTab = 'all' | 'active' | 'inactive';

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
};

const frequencyLabel: Record<string, { label: string; color: string }> = {
  daily: { label: 'Daily', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  weekly: { label: 'Weekly', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  monthly: { label: 'Monthly', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const emptyForm = {
  name: '',
  interestRatePercent: '',
  minPrincipal: '',
  maxPrincipal: '',
  durationDays: '',
  collectionFrequency: 'daily' as 'daily' | 'weekly' | 'monthly',
  description: '',
};

export default function LoanProductsPage() {
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LoanProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LoanProduct | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getLoanProducts();
      setProducts(data);
    } catch {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeTab !== 'all') {
      result = result.filter((p) => p.status === activeTab);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.collectionFrequency.includes(q)
      );
    }
    return result;
  }, [products, activeTab, searchQuery]);

  const tabCounts = useMemo(() => ({
    all: products.length,
    active: products.filter((p) => p.status === 'active').length,
    inactive: products.filter((p) => p.status === 'inactive').length,
  }), [products]);

  const openCreate = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (product: LoanProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      interestRatePercent: product.interestRatePercent != null ? String(product.interestRatePercent) : '',
      minPrincipal: product.minPrincipal != null ? String(product.minPrincipal) : '',
      maxPrincipal: product.maxPrincipal != null ? String(product.maxPrincipal) : '',
      durationDays: String(product.durationDays),
      collectionFrequency: product.collectionFrequency,
      description: product.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const payload = {
        name: formData.name,
        interestRatePercent: parseFloat(formData.interestRatePercent) || 0,
        minPrincipal: parseFloat(formData.minPrincipal) || 0,
        maxPrincipal: parseFloat(formData.maxPrincipal) || 0,
        durationDays: parseInt(formData.durationDays) || 30,
        collectionFrequency: formData.collectionFrequency,
      };

      if (editingProduct) {
        await apiClient.updateLoanProduct(editingProduct.id, payload);
        showToast('Product updated successfully', 'success');
      } else {
        await apiClient.createLoanProduct(payload);
        showToast('Product created successfully', 'success');
      }
      setShowModal(false);
      setFormData(emptyForm);
      await loadProducts();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save product', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await apiClient.deactivateLoanProduct(deleteTarget.id);
      showToast('Product deactivated successfully', 'success');
      setDeleteTarget(null);
      await loadProducts();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to deactivate', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const computedExample = useMemo(() => {
    const principal = parseFloat(formData.maxPrincipal) || parseFloat(formData.minPrincipal) || 10000;
    const days = parseInt(formData.durationDays) || 30;
    const freq = formData.collectionFrequency;
    const total = principal;
    const installments = freq === 'daily' ? days : freq === 'weekly' ? Math.ceil(days / 7) : Math.ceil(days / 30);
    const perInstallment = installments > 0 ? total / installments : 0;
    return { principal, total, installments, perInstallment, freq };
  }, [formData]);

  if (loading && products.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 animate-[slide-in_0.3s_ease-out] ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Loan Products</h1>
            <p className="text-sm text-slate-500 mt-1">Define loan templates with interest rates and collection rules</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or frequency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 text-sm"
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {(['all', 'active', 'inactive'] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab} {tabCounts[tab] > 0 && <span className="ml-1 text-[10px] opacity-60">{tabCounts[tab]}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              {searchQuery || activeTab !== 'all' ? 'No products found' : 'No loan products yet'}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              {searchQuery || activeTab !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first loan product to start issuing loans'}
            </p>
            {!searchQuery && activeTab === 'all' && (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const freq = frequencyLabel[product.collectionFrequency];
              const installments = product.collectionFrequency === 'daily'
                ? product.durationDays
                : product.collectionFrequency === 'weekly'
                  ? Math.ceil(product.durationDays / 7)
                  : Math.ceil(product.durationDays / 30);

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl border hover:shadow-md transition-all ${
                    product.status === 'inactive' ? 'border-slate-200 opacity-60' : 'border-slate-100'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          product.status === 'active'
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                            : 'bg-slate-300'
                        }`}>
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 text-sm">{product.name}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border mt-0.5 ${freq.color}`}>
                            <Clock className="w-2.5 h-2.5" />
                            {freq.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {product.status === 'active' && (
                          <>
                            <button
                              onClick={() => openEdit(product)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(product)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Deactivate"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <span className={`ml-1 w-2 h-2 rounded-full ${product.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      </div>
                    </div>

                    {/* Interest Rate - Hero */}
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-3xl font-bold text-slate-900">
                        {product.interestRatePercent != null ? Number(product.interestRatePercent) : 0}
                      </span>
                      <span className="text-lg font-medium text-slate-400">%</span>
                      <span className="text-xs text-slate-500 ml-1">interest</span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 rounded-xl px-3 py-2">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Principal Range</p>
                        <p className="text-xs font-semibold text-slate-900 mt-0.5">
                          {formatCurrency(product.minPrincipal || 0)} - {formatCurrency(product.maxPrincipal || 0)}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-xl px-3 py-2">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Duration</p>
                        <p className="text-xs font-semibold text-slate-900 mt-0.5">
                          {product.durationDays} days &middot; {installments} inst.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="border-t border-slate-50 px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(product.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                      product.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  {editingProduct ? <Edit3 className="w-5 h-5 text-emerald-600" /> : <Plus className="w-5 h-5 text-emerald-600" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingProduct ? 'Edit Product' : 'Create Loan Product'}
                  </h2>
                  <p className="text-xs text-slate-500">Define the terms for a type of loan</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Daily 100, Weekly 30"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Interest Rate (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.interestRatePercent}
                      onChange={(e) => setFormData((prev) => ({ ...prev, interestRatePercent: e.target.value }))}
                      placeholder="e.g. 10"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Duration (Days) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.durationDays}
                      onChange={(e) => setFormData((prev) => ({ ...prev, durationDays: e.target.value }))}
                      placeholder="e.g. 100"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Min Principal (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.minPrincipal}
                      onChange={(e) => setFormData((prev) => ({ ...prev, minPrincipal: e.target.value }))}
                      placeholder="e.g. 5000"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Max Principal (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.maxPrincipal}
                      onChange={(e) => setFormData((prev) => ({ ...prev, maxPrincipal: e.target.value }))}
                      placeholder="e.g. 50000"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Collection Frequency <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, collectionFrequency: freq }))}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${
                          formData.collectionFrequency === freq
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                {formData.name && formData.durationDays && (
                  <div className="bg-gradient-to-r from-slate-50 to-emerald-50/50 rounded-xl p-4 border border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Example Calculation
                    </h4>
                    <p className="text-[11px] text-slate-500 mb-2">
                      For a loan of {formatCurrency(computedExample.principal)}:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Collection</span>
                        <span className="font-bold text-slate-900">{formatCurrency(computedExample.total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Installments</span>
                        <span className="font-medium">{computedExample.installments}</span>
                      </div>
                      <div className="flex justify-between col-span-2">
                        <span className="text-slate-500">Per {computedExample.freq === 'daily' ? 'day' : computedExample.freq === 'weekly' ? 'week' : 'month'}</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(computedExample.perInstallment)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Deactivate Product?</h3>
            <p className="text-sm text-slate-500 mb-6">
              <strong>{deleteTarget.name}</strong> will be deactivated. Existing loans using this product won't be affected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-medium flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
