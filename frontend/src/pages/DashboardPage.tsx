import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import {
  Users,
  Wallet,
  HandCoins,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  IndianRupee,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    { label: 'Customers', path: '/customers', icon: Users, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50' },
    { label: 'Loans', path: '/loans', icon: Wallet, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' },
    { label: 'Collections', path: '/collections', icon: HandCoins, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
    { label: 'Reports', path: '/reports', icon: TrendingUp, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Welcome section */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 sm:p-8 mb-6 text-white">
          <h2 className="text-xl sm:text-2xl font-bold">
            Welcome back{user?.role === 'accountant' ? ', Owner' : ''}
          </h2>
          <p className="text-slate-300 mt-1 text-sm">
            {user?.role === 'accountant'
              ? 'Here\'s an overview of your business today.'
              : 'Ready for today\'s collections.'}
          </p>
        </div>

        {/* Quick actions */}
        {user?.role === 'accountant' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 p-5 text-left transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-semibold text-slate-800 text-sm">{action.label}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Placeholder cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-500">Today's Collection</h3>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">--</p>
            <p className="text-xs text-slate-400 mt-1">Data loads with active loans</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-500">Pending</h3>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">--</p>
            <p className="text-xs text-slate-400 mt-1">Customers due today</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-500">Overdue</h3>
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">--</p>
            <p className="text-xs text-slate-400 mt-1">Overdue installments</p>
          </div>
        </div>

        {/* Info about dashboard */}
        <div className="mt-6 bg-blue-50/50 border border-blue-100 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Dashboard metrics will populate with real data</p>
              <p className="text-xs text-blue-600 mt-1">
                Start by adding customers and creating loans. The dashboard will automatically show
                collection stats, overdue amounts, and financial summaries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
