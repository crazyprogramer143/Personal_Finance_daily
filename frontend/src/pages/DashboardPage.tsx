import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', roles: ['accountant', 'collector'] },
    { label: 'Customers', path: '/customers', roles: ['accountant'] },
    { label: 'Loan Products', path: '/loan-products', roles: ['accountant'] },
    { label: 'Accounts', path: '/accounts', roles: ['accountant'] },
  ];

  const filteredMenu = menuItems.filter((item) => item.roles.includes(user?.role || ''));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Daily Finance Management</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-md min-h-screen">
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              <strong>Role:</strong> {user?.role === 'accountant' ? 'Owner/Accountant' : 'Collector'}
            </p>
            <ul className="space-y-2">
              {filteredMenu.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className="w-full text-left px-4 py-2 rounded-md hover:bg-blue-100 text-gray-700 hover:text-blue-900"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Welcome to Dashboard</h2>

          <div className="space-y-4">
            <div>
              <p className="text-gray-600">
                <strong>Role:</strong> {user?.role === 'accountant' ? 'Owner/Accountant' : 'Collector'}
              </p>
            </div>

            {user?.role === 'accountant' && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-bold mb-4">Dashboard - Phase 1 Placeholder</h3>
                <p className="text-gray-600 mb-4">
                  This is a placeholder for the owner dashboard. In Phase 2+, you will see:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Key metrics (Total Principal, Held Amount, Outstanding)</li>
                  <li>Today's collections status</li>
                  <li>Quick action buttons</li>
                  <li>Collector performance overview</li>
                </ul>
              </div>
            )}

            {user?.role === 'collector' && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-bold mb-4">Collection Screen - Phase 1 Placeholder</h3>
                <p className="text-gray-600 mb-4">
                  This is a placeholder for the collector collection screen. In Phase 3, you will see:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Today's due customers list</li>
                  <li>Quick search by code, name, or phone</li>
                  <li>Payment recording form</li>
                  <li>Collection status tracker</li>
                </ul>
              </div>
            )}
          </div>

          {/* Auth Info */}
          <div className="mt-8 border-t pt-6">
            <p className="text-sm text-gray-500">
              <strong>Company ID:</strong> {user?.companyId}
            </p>
            <p className="text-sm text-gray-500">
              <strong>User ID:</strong> {user?.userId}
            </p>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}
