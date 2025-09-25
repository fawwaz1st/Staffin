import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Calendar,
  Clock,
  FileText,
  Home,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import Button from '../components/ui/Button';

const navigation = [
  { name: 'Dashboard', icon: Home, href: '/dashboard/employee' },
  { name: 'Jadwal', icon: Calendar, href: '/dashboard/employee/shifts' },
  { name: 'Absensi', icon: Clock, href: '/dashboard/employee/attendance' },
  { name: 'Cuti', icon: FileText, href: '/dashboard/employee/leaves' },
  { name: 'Profil', icon: User, href: '/profile' },
];

export default function EmployeeLayout({ children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white shadow-lg"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-coffee" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar */}
        <div className="relative z-10 flex-shrink-0 flex h-20 bg-white shadow-soft">
          <button
            className="px-4 border-r border-cream-200 text-coffee hover:bg-cream-50 transition-colors md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-6 flex justify-between items-center">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-bold text-ink font-display">
                Dashboard Karyawan
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Profile */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-cream-200">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-coffee to-coffee-light flex items-center justify-center shadow-sm">
                      <span className="text-white font-semibold">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-semibold text-ink">{user?.name}</div>
                    <div className="text-xs text-ink-light">Karyawan</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-coffee hover:bg-cream-200"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto bg-cream-50">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent() {
  const location = useLocation();

  return (
    <div className="flex-1 flex flex-col h-full bg-white border-r border-cream-200">
      <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6 mb-8">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-coffee to-coffee-light flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white font-display">S</span>
            </div>
            <h1 className="ml-3 text-2xl font-bold text-ink font-display">Staffin</h1>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-2">
          {navigation.map((item) => {
            const active = location.pathname === item.href || 
              (item.href === '/dashboard/employee' && location.pathname.startsWith('/dashboard'));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  active
                    ? 'bg-coffee text-white shadow-md'
                    : 'text-ink-light hover:bg-cream-200 hover:text-coffee'
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    active ? 'text-white' : 'text-coffee-light'
                  }`}
                />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
