import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  Calendar,
  Clock,
  FileText,
  DollarSign,
  Settings,
  Bell,
  Home,
  PanelLeftClose,
  PanelRightOpen,
} from 'lucide-react';
import { fetchUsersSummary } from '@/api/admin/users';
import ThemeToggle from '@/components/ui/ThemeToggle';

const NAVIGATION_ITEMS = [
  { key: 'dashboard', name: 'Dashboard', icon: Home, href: '/dashboard/admin' },
  { key: 'users', name: 'Karyawan', icon: Users, href: '/users' },
  { key: 'shifts', name: 'Shift', icon: Calendar, href: '/dashboard/admin/shifts' },
  { key: 'attendance', name: 'Absensi', icon: Clock, href: '/dashboard/admin/attendance' },
  { key: 'leaves', name: 'Cuti', icon: FileText, href: '/dashboard/admin/leaves' },
  { key: 'payroll', name: 'Payroll', icon: DollarSign, href: '/dashboard/admin/payroll' },
  { key: 'settings', name: 'Pengaturan', icon: Settings, href: '/settings' },
];

const normalizePath = (path = '') => path.replace(/\/+$/, '') || '/';

const isNavActive = (currentPath, targetPath) => {
  const path = normalizePath(currentPath);
  const target = normalizePath(targetPath);

  if (target === '/dashboard/admin') {
    return path === target;
  }

  return path === target || path.startsWith(`${target}/`);
};

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const location = useLocation();
  const timerRef = useRef(null);
  const stopPollingRef = useRef(false);
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isApprovedAdmin = isAdmin && user?.status === 'approved';

  const navigation = useMemo(() => NAVIGATION_ITEMS, []);
  const showPendingAlert = isAdmin && !isApprovedAdmin;

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navDensity = useMemo(() => {
    if (viewportWidth <= 340) return 'ultra';
    if (viewportWidth <= 380) return 'compact';
    if (viewportWidth <= 430) return 'cozy';
    return 'comfortable';
  }, [viewportWidth]);

  // Fetch pending users summary untuk badge (hanya admin)
  useEffect(() => {
    let mounted = true;
    if (loading) return;
    if (!isApprovedAdmin) {
      setPendingCount(0);
      // Hentikan polling bila sebelumnya berjalan
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    stopPollingRef.current = false;
    const load = async () => {
      try {
        const sum = await fetchUsersSummary();
        if (mounted) setPendingCount(sum?.pending || 0);
      } catch (err) {
        // Jika 403, hentikan polling agar tidak spam console/network
        if (err?.response?.status === 403) {
          stopPollingRef.current = true;
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
      }
    };
    load();
    timerRef.current = setInterval(() => {
      if (!stopPollingRef.current) load();
    }, 30000);
    return () => {
      mounted = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [loading, isApprovedAdmin]);

  return (
    <div className="min-h-screen bg-app text-primary flex transition-colors">
      {/* Sidebar desktop with toggle */}
      <div
        className={`hidden md:flex md:flex-shrink-0 transition-all duration-300 ${
          desktopSidebarCollapsed ? 'w-24' : 'w-72'
        }`}
      >
        <div className="flex flex-col w-full">
          <SidebarContent
            pendingCount={pendingCount}
            disableBadge={!isApprovedAdmin}
            collapsed={desktopSidebarCollapsed}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar */}
        <div className="relative z-10 flex-shrink-0 border-b border-divider/40 bg-card/90 backdrop-blur-md">
          <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setDesktopSidebarCollapsed((prev) => !prev)}
                className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-divider/50 bg-soft text-coffee transition-colors hover:border-divider hover:bg-soft/80"
                aria-label="Toggle sidebar"
              >
                {desktopSidebarCollapsed ? <PanelRightOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              </button>
              <div className="min-w-0">
                <p className="hidden text-xs uppercase tracking-wide text-muted md:block">Admin Area</p>
                <h1 className="truncate text-lg font-semibold text-primary sm:text-2xl">
                  Admin Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle ariaLabel="Ganti tema tampilan" variant="icon" />
              {isApprovedAdmin && (
                <Link
                  to="/users"
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-divider/60 bg-card text-coffee shadow-sm transition-all hover:border-divider hover:bg-soft"
                  aria-label="Menu karyawan"
                >
                  <Bell className="h-5 w-5" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-warning-500 px-1 text-[10px] font-semibold text-white shadow-sm">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              )}
              <div className="flex items-center gap-2 rounded-full border border-divider/60 bg-card px-3 py-2 text-left shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-coffee to-coffee-light text-sm font-semibold text-white">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
                <div className="hidden md:flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-primary">{user?.name}</span>
                  <span className="text-xs text-secondary">Administrator</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto bg-app">
          <div className="py-6 sm:py-8 pb-28 md:pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {showPendingAlert && (
                <div className="mb-6">
                  <div className="rounded-2xl border border-warning-300 bg-warning-100/60 px-5 py-4 shadow-soft text-warning-900">
                    <p className="font-semibold">Akun admin Anda belum disetujui.</p>
                    <p className="text-sm mt-1 text-warning-800">Hubungi super admin untuk aktivasi. Fitur admin akan tersedia penuh setelah disetujui.</p>
                  </div>
                </div>
              )}
              {children}
            </div>
          </div>
        </main>

        <MobileBottomNav
          items={navigation}
          currentPath={location.pathname}
          pendingCount={pendingCount}
          isAdmin={isAdmin}
          isApproved={isApprovedAdmin}
          density={navDensity}
        />
      </div>
    </div>
  );
}

function SidebarContent({ pendingCount, disableBadge = false, collapsed = false }) {
  const location = useLocation();

  return (
    <div className="flex-1 flex flex-col h-full bg-card border-r border-divider/40 transition-all duration-300">
      <div className="flex-1 flex flex-col pt-8 pb-6 overflow-y-auto">
        <div className={`flex items-center flex-shrink-0 px-6 mb-10 transition-all duration-300 ${collapsed ? 'justify-center' : 'justify-start'}`}>
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-coffee to-coffee-light flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white font-display">S</span>
            </div>
            {!collapsed && <h1 className="ml-3 text-2xl font-bold text-primary font-display">Staffin</h1>}
          </div>
        </div>
        <nav className={`flex-1 ${collapsed ? 'px-2 space-y-1' : 'px-3 space-y-2'}`}>
          {NAVIGATION_ITEMS.map((item) => {
            const active = isNavActive(location.pathname, item.href);
            return (
              <Link
                key={item.key}
                to={item.href}
                className={`group flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 sm:px-4 py-3 text-sm font-medium rounded-2xl transition-all ${
                  active
                    ? 'bg-coffee text-white shadow-soft'
                    : 'text-secondary hover:bg-soft hover:text-coffee'
                }`}
              >
                <span className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
                  <item.icon
                    className={`flex-shrink-0 h-5 w-5 ${
                      active ? 'text-white' : 'text-coffee-light'
                    } ${collapsed ? '' : 'mr-3'}`}
                  />
                  {!collapsed && <span className="font-medium">{item.name}</span>}
                </span>
                {!collapsed && item.key === 'users' && pendingCount > 0 && !disableBadge && (
                  <span className={`inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full text-xs font-semibold ${
                    active ? 'bg-white/20 text-white' : 'bg-warning-100 text-warning-700'
                  }`}>
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function MobileBottomNav({ items, currentPath, pendingCount, isAdmin, density }) {
  if (!isAdmin) return null;

  const presets = {
    comfortable: {
      container: 'px-4 py-3 gap-2',
      item: 'px-3 py-2',
      icon: 'h-5 w-5',
      text: 'mt-1 text-[11px] font-semibold',
      badge: 'text-[10px] min-w-[16px] h-4',
    },
    cozy: {
      container: 'px-3.5 py-2.5 gap-1.5',
      item: 'px-2.5 py-1.5',
      icon: 'h-[18px] w-[18px]',
      text: 'mt-1 text-[10px] font-semibold',
      badge: 'text-[9px] min-w-[15px] h-4',
    },
    compact: {
      container: 'px-3 py-2 gap-1.5',
      item: 'px-2 py-1.5',
      icon: 'h-[16px] w-[16px]',
      text: 'mt-1 text-[9.5px] font-semibold',
      badge: 'text-[9px] min-w-[14px] h-[14px]',
    },
    ultra: {
      container: 'px-3 py-1.5 gap-1',
      item: 'px-1.5 py-1.5',
      icon: 'h-4 w-4',
      text: 'mt-[2px] text-[9px] font-semibold',
      badge: 'text-[8px] min-w-[12px] h-[14px]',
    },
  };

  const preset = presets[density] || presets.comfortable;

  return (
    <nav className="md:hidden">
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-28 bg-bottom-gradient" />
      <div className="fixed bottom-5 inset-x-4 z-30">
        <div className={`nav-blur border border-divider/60 shadow-floating rounded-3xl ${preset.container}`}>
          <ul className="flex items-center overflow-x-auto no-scrollbar" role="tablist">
            {items.map((item) => {
              const active = isNavActive(currentPath, item.href);
              return (
                <li key={item.key} className="flex-shrink-0" role="presentation">
                  <Link
                    to={item.href}
                    className={`flex flex-col items-center justify-center rounded-2xl transition-all duration-200 ${preset.item} ${
                      active
                        ? 'bg-coffee text-white shadow-soft scale-95'
                        : 'text-ink-light hover:bg-cream-200'
                    }`}
                  >
                    <span className="relative flex items-center justify-center">
                      <item.icon className={`${preset.icon} ${active ? 'text-white' : 'text-coffee-light'}`} />
                      {item.key === 'users' && pendingCount > 0 && (
                        <span className={`absolute -top-1 -right-1 inline-flex items-center justify-center ${preset.badge} px-1 rounded-full font-semibold ${
                          active ? 'bg-white/90 text-coffee' : 'bg-warning-400 text-white'
                        }`}>
                          {pendingCount}
                        </span>
                      )}
                    </span>
                    <span className={`${preset.text} tracking-wide ${
                      active ? 'text-white' : 'text-ink-light'
                    }`}>
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
