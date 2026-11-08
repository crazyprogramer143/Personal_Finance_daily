import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/services/api';
import Layout from '@/components/Layout';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  X,
  Phone,
  MapPin,
  Store,
  ChevronRight,
  ArrowLeft,
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  UserCircle,
  Users,
  CalendarDays,
  FileText,
  Loader2,
  UserPlus,
  Shield,
  UserX,
  UserCheck,
} from 'lucide-react';

interface LoanCounts {
  active: number;
  closed: number;
  total: number;
}

interface Collector {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  assignedCustomers: { id: string; name: string; code: string }[];
  customerCount: number;
}

interface Customer {
  id: string;
  code: string;
  name: string;
  shopName?: string;
  businessType?: string;
  mobileNumber?: string;
  address?: string;
  language?: 'en' | 'ta';
  status: 'active' | 'inactive' | 'blocked';
  verificationStatus?: string;
  loanCounts: LoanCounts;
  collectors: { collectorId: string; collectorName: string }[];
  createdAt: string;
}

interface LoanItem {
  id: string;
  principalAmount: number;
  heldAmount: number;
  disbursedAmount: number;
  totalScheduledRepayment: number;
  durationDays: number;
  collectionFrequency: string;
  startDate?: string;
  endDate?: string;
  status: string;
  createdAt: string;
}

interface CustomerDetail extends Customer {
  loans: LoanItem[];
}

type TabFilter = 'all' | 'active' | 'inactive';

const emptyForm = {
  code: '',
  name: '',
  shopName: '',
  businessType: '',
  mobileNumber: '',
  address: '',
  language: 'en' as 'en' | 'ta',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [tabFilter, setTabFilter] = useState<TabFilter>('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Detail view
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Collector management
  const [showCollectorPanel, setShowCollectorPanel] = useState(false);
  const [showCreateCollector, setShowCreateCollector] = useState(false);
  const [collectorForm, setCollectorForm] = useState({ username: '', password: '' });
  const [creatingCollector, setCreatingCollector] = useState(false);
  const [deletingCollector, setDeletingCollector] = useState<string | null>(null);

  // Assign collector modal
  const [assignTarget, setAssignTarget] = useState<Customer | null>(null);
  const [selectedCollectorIds, setSelectedCollectorIds] = useState<string[]>([]);
  const [originalCollectorIds, setOriginalCollectorIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadCustomers();
    loadCollectors();
  }, []);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCustomers();
      setCustomers(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const loadCollectors = async () => {
    try {
      const data = await apiClient.getCollectors();
      setCollectors(data);
    } catch {
      // collectors may not load if not accountant
    }
  };

  const filteredCustomers = useMemo(() => {
    let list = customers;
    if (tabFilter !== 'all') {
      list = list.filter((c) => c.status === tabFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          (c.shopName && c.shopName.toLowerCase().includes(q)) ||
          (c.mobileNumber && c.mobileNumber.includes(q)) ||
          (c.collectors && c.collectors.some(col => col.collectorName.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [customers, tabFilter, search]);

  const counts = useMemo(() => ({
    all: customers.length,
    active: customers.filter((c) => c.status === 'active').length,
    inactive: customers.filter((c) => c.status === 'inactive').length,
  }), [customers]);

  const openAdd = () => {
    setEditingCustomer(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      code: customer.code,
      name: customer.name,
      shopName: customer.shopName || '',
      businessType: customer.businessType || '',
      mobileNumber: customer.mobileNumber || '',
      address: customer.address || '',
      language: (customer.language || 'en') as 'en' | 'ta',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCustomer) {
        await apiClient.updateCustomer(editingCustomer.id, formData);
        setSuccess('Customer updated successfully');
      } else {
        await apiClient.createCustomer(formData);
        setSuccess('Customer created successfully');
      }
      setShowModal(false);
      setFormData(emptyForm);
      const editedId = editingCustomer?.id;
      setEditingCustomer(null);
      loadCustomers();
      if (selectedCustomer && editedId) {
        await refreshSelectedCustomer(editedId);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.deleteCustomer(deleteTarget.id);
      setSuccess('Customer deactivated successfully');
      setDeleteTarget(null);
      loadCustomers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to deactivate customer');
    } finally {
      setDeleting(false);
    }
  };

  const openDetail = async (customer: Customer) => {
    setLoadingDetail(true);
    try {
      const detail = await apiClient.getCustomerDetails(customer.id);
      setSelectedCustomer({ ...detail, collectors: customer.collectors });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load customer details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCollector = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCollector(true);
    try {
      await apiClient.createCollector(collectorForm);
      setSuccess('Collector created successfully');
      setCollectorForm({ username: '', password: '' });
      setShowCreateCollector(false);
      loadCollectors();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create collector');
    } finally {
      setCreatingCollector(false);
    }
  };

  const handleDeleteCollector = async (collectorId: string) => {
    setDeletingCollector(collectorId);
    try {
      await apiClient.deleteCollector(collectorId);
      setSuccess('Collector deleted successfully');
      loadCollectors();
      loadCustomers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete collector');
    } finally {
      setDeletingCollector(null);
    }
  };

  const refreshSelectedCustomer = async (customerId: string) => {
    const allCustomers = await apiClient.getCustomers();
    const updated = allCustomers.find((c: Customer) => c.id === customerId);
    if (updated && selectedCustomer) {
      const detail = await apiClient.getCustomerDetails(customerId);
      setSelectedCustomer({ ...detail, collectors: updated.collectors });
    }
  };

  const openAssignModal = (customer: Customer) => {
    const currentIds = (customer.collectors || []).map(c => c.collectorId);
    setOriginalCollectorIds(currentIds);
    setSelectedCollectorIds([...currentIds]);
    setAssignTarget(customer);
  };

  const toggleCollectorSelection = (collectorId: string) => {
    setSelectedCollectorIds(prev =>
      prev.includes(collectorId)
        ? prev.filter(id => id !== collectorId)
        : [...prev, collectorId]
    );
  };

  const handleSaveCollectorAssignments = async () => {
    if (!assignTarget) return;
    setAssigning(true);
    try {
      const toAdd = selectedCollectorIds.filter(id => !originalCollectorIds.includes(id));
      const toRemove = originalCollectorIds.filter(id => !selectedCollectorIds.includes(id));

      for (const collectorId of toAdd) {
        await apiClient.assignCollector(assignTarget.id, collectorId);
      }
      for (const collectorId of toRemove) {
        await apiClient.unassignCollector(assignTarget.id, collectorId);
      }

      if (toAdd.length > 0 || toRemove.length > 0) {
        setSuccess(`Collector assignments updated`);
      }
      const targetId = assignTarget.id;
      setAssignTarget(null);
      loadCustomers();
      if (selectedCustomer) {
        await refreshSelectedCustomer(targetId);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update collector assignments');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignCollector = async (customerId: string, collectorId?: string) => {
    try {
      await apiClient.unassignCollector(customerId, collectorId);
      setSuccess('Collector unassigned');
      loadCustomers();
      if (selectedCustomer) {
        await refreshSelectedCustomer(customerId);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to unassign collector');
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const avatarColors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-indigo-500 to-blue-600',
  ];

  const getAvatarColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  // --- DETAIL VIEW ---
  if (selectedCustomer) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => setSelectedCustomer(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Back to Customers</span>
          </button>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-8">
              <div className="flex items-start gap-5">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarColor(selectedCustomer.id)} flex items-center justify-center shadow-lg`}>
                  <span className="text-white text-xl font-bold">{getInitials(selectedCustomer.name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold text-white">{selectedCustomer.name}</h2>
                    <span className="px-2.5 py-0.5 bg-white/15 backdrop-blur-sm rounded-full text-xs font-mono text-white/90">
                      {selectedCustomer.code}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedCustomer.status === 'active'
                        ? 'bg-emerald-400/20 text-emerald-300'
                        : 'bg-red-400/20 text-red-300'
                    }`}>
                      {selectedCustomer.status}
                    </span>
                  </div>
                  {selectedCustomer.shopName && (
                    <p className="text-slate-300 mt-1.5 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5" />
                      {selectedCustomer.shopName}
                    </p>
                  )}
                  <div className="flex items-center gap-5 mt-3 text-sm text-slate-400">
                    {selectedCustomer.mobileNumber && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {selectedCustomer.mobileNumber}
                      </span>
                    )}
                    {selectedCustomer.address && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">{selectedCustomer.address}</span>
                      </span>
                    )}
                  </div>
                  {/* Collector badges in detail view */}
                  {selectedCustomer.collectors && selectedCustomer.collectors.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {selectedCustomer.collectors.map(col => (
                        <div key={col.collectorId} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/20 rounded-lg group">
                          <Shield className="w-3.5 h-3.5 text-violet-300" />
                          <span className="text-xs font-medium text-violet-300">
                            {col.collectorName}
                          </span>
                          <button
                            onClick={() => handleUnassignCollector(selectedCustomer.id, col.collectorId)}
                            className="ml-1 text-violet-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                            title="Unassign collector"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAssignModal(selectedCustomer)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Assign Collector
                  </button>
                  <button
                    onClick={() => openEdit(selectedCustomer)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-100">
              <div className="px-6 py-4 text-center">
                <p className="text-2xl font-bold text-slate-800">{selectedCustomer.loanCounts?.total || selectedCustomer.loans?.length || 0}</p>
                <p className="text-xs text-slate-500 mt-0.5">Total Loans</p>
              </div>
              <div className="px-6 py-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">{selectedCustomer.loanCounts?.active || selectedCustomer.loans?.filter((l: any) => l.status === 'active' || l.status === 'approved').length || 0}</p>
                <p className="text-xs text-slate-500 mt-0.5">Active</p>
              </div>
              <div className="px-6 py-4 text-center">
                <p className="text-2xl font-bold text-slate-500">{selectedCustomer.loanCounts?.closed || selectedCustomer.loans?.filter((l: any) => l.status === 'closed').length || 0}</p>
                <p className="text-xs text-slate-500 mt-0.5">Closed</p>
              </div>
            </div>
          </div>

          <div className="mb-2">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              Loans
            </h3>
          </div>

          {selectedCustomer.loans && selectedCustomer.loans.length > 0 ? (
            <div className="space-y-3">
              {selectedCustomer.loans.map((loan: LoanItem) => (
                <div key={loan.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        loan.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                        loan.status === 'closed' ? 'bg-slate-100 text-slate-500' :
                        loan.status === 'approved' ? 'bg-blue-50 text-blue-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {loan.status === 'active' ? <Wallet className="w-5 h-5" /> :
                         loan.status === 'closed' ? <CheckCircle2 className="w-5 h-5" /> :
                         loan.status === 'approved' ? <FileText className="w-5 h-5" /> :
                         <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{formatCurrency(Number(loan.principalAmount))}</p>
                        <p className="text-xs text-slate-500">{loan.collectionFrequency} &middot; {loan.durationDays} days</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      loan.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' :
                      loan.status === 'closed' ? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' :
                      loan.status === 'approved' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' :
                      'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                    }`}>
                      {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Principal</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{formatCurrency(Number(loan.principalAmount))}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Held</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{formatCurrency(Number(loan.heldAmount))}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Disbursed</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{formatCurrency(Number(loan.disbursedAmount))}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Total Repay</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{formatCurrency(Number(loan.totalScheduledRepayment))}</p>
                    </div>
                  </div>

                  {(loan.startDate || loan.endDate) && (
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {loan.startDate && <span>Start: {formatDate(loan.startDate)}</span>}
                      {loan.endDate && <span>End: {formatDate(loan.endDate)}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No loans yet</p>
              <p className="text-sm text-slate-400 mt-1">Create a loan for this customer from the Loans page</p>
            </div>
          )}
        </div>

        {/* Toast notifications in detail view */}
        {success && (
          <div className="fixed top-20 right-6 z-[60] animate-slide-in">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="text-sm font-medium">{success}</span>
            </div>
          </div>
        )}
        {error && (
          <div className="fixed top-20 right-6 z-[60] animate-slide-in">
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Edit Customer Modal (detail view) */}
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">Edit Customer</h2>
                    <p className="text-xs text-slate-500">Update customer information</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Customer Code <span className="text-red-400">*</span></label>
                    <input type="text" name="code" value={formData.code} onChange={handleChange} placeholder="e.g. C001" disabled={!!editingCustomer}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-400" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Customer name"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all placeholder:text-slate-400" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Shop Name</label>
                    <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} placeholder="Shop or business name"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all placeholder:text-slate-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Business Type</label>
                    <input type="text" name="businessType" value={formData.businessType} onChange={handleChange} placeholder="e.g. Grocery, Textiles"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all placeholder:text-slate-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Mobile Number <span className="text-red-400">*</span></label>
                    <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="+91 XXXXX XXXXX"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all placeholder:text-slate-400" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Language</label>
                    <select name="language" value={formData.language} onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all">
                      <option value="en">English</option>
                      <option value="ta">Tamil</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows={3} placeholder="Shop or business address"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all resize-none placeholder:text-slate-400" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors disabled:opacity-60">
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Update Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Collector Modal (detail view) */}
        {assignTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAssignTarget(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">Assign Collectors</h2>
                    <p className="text-xs text-slate-500">for {assignTarget.name} ({assignTarget.code})</p>
                  </div>
                </div>
                <button onClick={() => setAssignTarget(null)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                {collectors.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-slate-500">No collectors available</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-500 mb-3">Select collectors to assign. Deselecting removes the assignment.</p>
                    <div className="space-y-2 mb-5">
                      {collectors.map((col) => {
                        const isSelected = selectedCollectorIds.includes(col.id);
                        return (
                          <button
                            key={col.id}
                            onClick={() => toggleCollectorSelection(col.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                              isSelected
                                ? 'border-violet-400 bg-violet-50 ring-2 ring-violet-200'
                                : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/50'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected ? 'bg-violet-600 border-violet-600' : 'border-slate-300'
                            }`}>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">{col.username.slice(0, 2).toUpperCase()}</span>
                            </div>
                            <div className="text-left flex-1">
                              <p className="text-sm font-semibold text-slate-800">{col.username}</p>
                              <p className="text-[11px] text-slate-400">{col.customerCount} customers</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-end gap-3">
                      <button onClick={() => setAssignTarget(null)}
                        className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                        Cancel
                      </button>
                      <button onClick={handleSaveCollectorAssignments} disabled={assigning}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-sm transition-colors disabled:opacity-60">
                        {assigning && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Layout>
    );
  }

  // --- MAIN LIST VIEW ---
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Toast notifications */}
        {success && (
          <div className="fixed top-20 right-6 z-[60] animate-slide-in">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="text-sm font-medium">{success}</span>
            </div>
          </div>
        )}
        {error && (
          <div className="fixed top-20 right-6 z-[60] animate-slide-in">
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Customers</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage customers and assign collectors</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCollectorPanel(!showCollectorPanel)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                showCollectorPanel
                  ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-600'
              }`}
            >
              <Shield className="w-4 h-4" />
              Collectors
              {collectors.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-violet-500 text-white text-[10px] font-bold rounded-full">
                  {collectors.length}
                </span>
              )}
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-sm shadow-emerald-200 transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Customer
            </button>
          </div>
        </div>

        {/* Collector Management Panel */}
        {showCollectorPanel && (
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-200 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Shield className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Collectors</h3>
                  <p className="text-xs text-slate-500">Manage collection agents for your company</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateCollector(true)}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                New Collector
              </button>
            </div>

            {collectors.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-7 h-7 text-violet-400" />
                </div>
                <p className="text-sm text-slate-600 font-medium">No collectors yet</p>
                <p className="text-xs text-slate-400 mt-1">Create a collector to start assigning customers</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {collectors.map((col) => (
                  <div key={col.id} className="bg-white rounded-xl border border-violet-100 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {col.username.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{col.username}</p>
                          <p className="text-[11px] text-slate-400">
                            {col.customerCount} customer{col.customerCount !== 1 ? 's' : ''} assigned
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCollector(col.id)}
                        disabled={deletingCollector === col.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete Collector"
                      >
                        {deletingCollector === col.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {col.assignedCustomers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {col.assignedCustomers.slice(0, 3).map((c) => (
                          <span key={c.id} className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-md text-[10px] font-medium">
                            {c.name}
                          </span>
                        ))}
                        {col.assignedCustomers.length > 3 && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px]">
                            +{col.assignedCustomers.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search + filter bar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, code, shop, phone or collector..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              {(['all', 'active', 'inactive'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTabFilter(tab)}
                  className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
                    tabFilter === tab
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className={`ml-1.5 ${tabFilter === tab ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {counts[tab]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Customer list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">
              {search ? 'No results found' : 'No customers yet'}
            </h3>
            <p className="text-sm text-slate-400 mt-1.5 max-w-sm mx-auto">
              {search
                ? `No customers match "${search}". Try a different search.`
                : 'Get started by adding your first customer.'}
            </p>
            {!search && (
              <button
                onClick={openAdd}
                className="mt-5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Add Your First Customer
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className="flex items-center p-4 gap-4">
                  {/* Avatar */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarColor(customer.id)} flex items-center justify-center flex-shrink-0 shadow-sm`}
                  >
                    <span className="text-white text-sm font-bold">{getInitials(customer.name)}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openDetail(customer)}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-slate-800 truncate">{customer.name}</h3>
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-500 flex-shrink-0">
                        {customer.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {customer.shopName && (
                        <span className="flex items-center gap-1 truncate">
                          <Store className="w-3 h-3 flex-shrink-0" />
                          {customer.shopName}
                        </span>
                      )}
                      {customer.mobileNumber && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          {customer.mobileNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Collector badges */}
                  <div className="hidden md:flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                    {customer.collectors && customer.collectors.length > 0 ? (
                      <>
                        {customer.collectors.map(col => (
                          <div key={col.collectorId} className="flex items-center gap-1 px-2 py-1 bg-violet-50 rounded-lg group/col">
                            <Shield className="w-3 h-3 text-violet-500" />
                            <span className="text-[11px] font-medium text-violet-700">{col.collectorName}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUnassignCollector(customer.id, col.collectorId); }}
                              className="ml-0.5 p-0.5 rounded text-violet-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/col:opacity-100 transition-all"
                              title="Unassign"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={(e) => { e.stopPropagation(); openAssignModal(customer); }}
                          className="p-1 rounded-lg text-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                          title="Add Collector"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); openAssignModal(customer); }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-violet-50 rounded-lg text-xs text-slate-400 hover:text-violet-600 transition-colors"
                        title="Assign Collector"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Assign</span>
                      </button>
                    )}
                  </div>

                  {/* Loan indicators */}
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    {customer.loanCounts.active > 0 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-lg" title="Active Loans">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-700">{customer.loanCounts.active}</span>
                        <span className="text-[10px] text-emerald-600">active</span>
                      </div>
                    )}
                    {customer.loanCounts.closed > 0 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg" title="Closed Loans">
                        <CheckCircle2 className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-600">{customer.loanCounts.closed}</span>
                        <span className="text-[10px] text-slate-500">closed</span>
                      </div>
                    )}
                    {customer.loanCounts.total === 0 && (
                      <span className="text-[10px] text-slate-400 px-2">No loans</span>
                    )}
                  </div>

                  {/* Status */}
                  <span className={`hidden md:inline-flex px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${
                    customer.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : 'bg-red-50 text-red-600 ring-1 ring-red-200'
                  }`}>
                    {customer.status}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(customer); }}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {customer.status === 'active' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(customer); }}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Deactivate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => openDetail(customer)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                      title="View Details"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mobile row: collectors + loan indicators */}
                <div className="sm:hidden flex items-center gap-2 px-4 pb-3 flex-wrap">
                  {customer.collectors && customer.collectors.length > 0 ? (
                    <>
                      {customer.collectors.map(col => (
                        <div key={col.collectorId} className="flex items-center gap-1 px-2 py-1 bg-violet-50 rounded-md">
                          <Shield className="w-3 h-3 text-violet-500" />
                          <span className="text-[10px] font-medium text-violet-700">{col.collectorName}</span>
                        </div>
                      ))}
                      <button
                        onClick={() => openAssignModal(customer)}
                        className="p-1 rounded-md text-violet-400 hover:text-violet-600"
                        title="Add Collector"
                      >
                        <UserPlus className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => openAssignModal(customer)}
                      className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-md text-[10px] text-slate-400"
                    >
                      <UserPlus className="w-3 h-3" /> Assign
                    </button>
                  )}
                  {customer.loanCounts.active > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-semibold text-emerald-700">{customer.loanCounts.active} active</span>
                    </div>
                  )}
                  {customer.loanCounts.closed > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] text-slate-500">{customer.loanCounts.closed} closed</span>
                    </div>
                  )}
                  <span className={`ml-auto px-2 py-0.5 rounded text-[10px] font-medium ${
                    customer.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                  }`}>
                    {customer.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading detail overlay */}
        {loadingDetail && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
              <p className="text-sm text-slate-600">Loading customer details...</p>
            </div>
          </div>
        )}
      </div>

      {/* ===== ADD/EDIT CUSTOMER MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  editingCustomer ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {editingCustomer ? <Edit3 className="w-5 h-5" /> : <UserCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {editingCustomer ? 'Update customer information' : 'Fill in the customer details below'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Customer Code <span className="text-red-400">*</span>
                  </label>
                  <input type="text" name="code" value={formData.code} onChange={handleChange} placeholder="e.g. C001" disabled={!!editingCustomer}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-400" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Customer name"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all placeholder:text-slate-400" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Shop Name</label>
                  <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} placeholder="Shop or business name"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all placeholder:text-slate-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Business Type</label>
                  <input type="text" name="businessType" value={formData.businessType} onChange={handleChange} placeholder="e.g. Grocery, Textiles"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all placeholder:text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Mobile Number <span className="text-red-400">*</span>
                  </label>
                  <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="+91 XXXXX XXXXX"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all placeholder:text-slate-400" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Language</label>
                  <select name="language" value={formData.language} onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all">
                    <option value="en">English</option>
                    <option value="ta">Tamil</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows={3} placeholder="Shop or business address"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all resize-none placeholder:text-slate-400" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl shadow-sm shadow-emerald-200 transition-all disabled:opacity-60">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCustomer ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 text-center">Deactivate Customer?</h3>
            <p className="text-sm text-slate-500 text-center mt-2">
              <strong>{deleteTarget.name}</strong> ({deleteTarget.code}) will be marked as inactive.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-60">
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CREATE COLLECTOR MODAL ===== */}
      {showCreateCollector && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateCollector(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">New Collector</h2>
                  <p className="text-xs text-slate-500">Create a collector login</p>
                </div>
              </div>
              <button onClick={() => setShowCreateCollector(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCollector} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Username <span className="text-red-400">*</span>
                </label>
                <input type="text" value={collectorForm.username}
                  onChange={(e) => setCollectorForm((p) => ({ ...p, username: e.target.value }))}
                  placeholder="e.g. collector1"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all placeholder:text-slate-400"
                  required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <input type="password" value={collectorForm.password}
                  onChange={(e) => setCollectorForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Set a password"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all placeholder:text-slate-400"
                  required minLength={6} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateCollector(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={creatingCollector}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-sm transition-colors disabled:opacity-60">
                  {creatingCollector && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Collector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== ASSIGN COLLECTOR MODAL ===== */}
      {assignTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAssignTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Assign Collectors</h2>
                  <p className="text-xs text-slate-500">for {assignTarget.name} ({assignTarget.code})</p>
                </div>
              </div>
              <button onClick={() => setAssignTarget(null)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {collectors.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-500">No collectors available</p>
                  <button
                    onClick={() => { setAssignTarget(null); setShowCollectorPanel(true); setShowCreateCollector(true); }}
                    className="mt-3 px-4 py-2 bg-violet-100 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-200 transition-colors"
                  >
                    Create a Collector First
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-500 mb-3">Select collectors to assign. Deselecting removes the assignment.</p>
                  <div className="space-y-2 mb-5">
                    {collectors.map((col) => {
                      const isSelected = selectedCollectorIds.includes(col.id);
                      return (
                        <button
                          key={col.id}
                          onClick={() => toggleCollectorSelection(col.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'border-violet-400 bg-violet-50 ring-2 ring-violet-200'
                              : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected ? 'bg-violet-600 border-violet-600' : 'border-slate-300'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{col.username.slice(0, 2).toUpperCase()}</span>
                          </div>
                          <div className="text-left flex-1">
                            <p className="text-sm font-semibold text-slate-800">{col.username}</p>
                            <p className="text-[11px] text-slate-400">{col.customerCount} customers</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setAssignTarget(null)}
                      className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSaveCollectorAssignments} disabled={assigning}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-sm transition-colors disabled:opacity-60">
                      {assigning && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
