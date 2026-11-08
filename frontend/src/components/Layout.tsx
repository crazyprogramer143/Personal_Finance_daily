import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Wallet,
  HandCoins,
  Receipt,
  Landmark,
  AlertTriangle,
  BarChart3,
  BadgeDollarSign,
  CalendarCheck,
  Package,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['accountant', 'collector'] },
  { label: 'Customers', path: '/customers', icon: Users, roles: ['accountant'] },
  { label: 'Loans', path: '/loans', icon: Wallet, roles: ['accountant', 'collector'] },
  { label: 'Loan Products', path: '/loan-products', icon: Package, roles: ['accountant'] },
  { label: 'Collections', path: '/collections', icon: HandCoins, roles: ['collector', 'accountant'] },
  { label: 'Accounts', path: '/accounts', icon: Landmark, roles: ['accountant'] },
  { label: 'Overdue', path: '/overdue-management', icon: AlertTriangle, roles: ['accountant'] },
  { label: 'Reports', path: '/reports', icon: BarChart3, roles: ['accountant'] },
  { label: 'Expenses', path: '/expenses', icon: BadgeDollarSign, roles: ['accountant'] },
  { label: 'Daily Closing', path: '/daily-closing', icon: CalendarCheck, roles: ['accountant'] },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredNav = navItems.filter((item) => item.roles.includes(user?.role || ''));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen
          bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800
          border-r border-slate-700/50
          flex flex-col
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo area */}
        <div className={`flex items-center h-16 px-4 border-b border-slate-700/50 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold text-sm truncate">Daily Finance</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-thin">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                title={collapsed ? item.label : undefined}
                className={`
                  w-full flex items-center gap-3 rounded-lg transition-all duration-200
                  ${collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}
                  ${active
                    ? 'bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/5'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }
                `}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-emerald-400' : ''}`} />
                {!collapsed && (
                  <span className={`text-sm truncate ${active ? 'font-medium' : ''}`}>{item.label}</span>
                )}
                {active && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className={`border-t border-slate-700/50 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {user?.role === 'accountant' ? 'A' : 'C'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {user?.role === 'accountant' ? 'Owner' : 'Collector'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.role === 'accountant' ? 'Full Access' : 'Limited Access'}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className={`
              flex items-center gap-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10
              transition-all duration-200
              ${collapsed ? 'w-10 h-10 justify-center' : 'w-full px-3 py-2'}
            `}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center px-4 lg:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden mr-3 p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-800">
              {filteredNav.find((item) => isActive(item.path))?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {user?.role === 'accountant' ? 'Owner / Accountant' : 'Collector'}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
