import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Users,
  Calendar,
  Clock,
  FileText,
  DollarSign,
  Settings,
  Home,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AdminHeader from '@/components/layout/AdminHeader';
import { AdminDashboardProvider, useAdminDashboard } from '@/contexts/AdminDashboardContext';

interface NavItem {
  key: string;
  name: string;
  icon: LucideIcon;
  href: string;
}

const NAVIGATION_ITEMS: NavItem[] = [
  { key: 'dashboard', name: 'Dashboard', icon: Home, href: '/dashboard/admin' },
  { key: 'users', name: 'Karyawan', icon: Users, href: '/users' },
  { key: 'shifts', name: 'Shift', icon: Calendar, href: '/dashboard/admin/shifts' },
  { key: 'attendance', name: 'Absensi', icon: Clock, href: '/dashboard/admin/attendance' },
  { key: 'leaves', name: 'Cuti', icon: FileText, href: '/dashboard/admin/leaves' },
  { key: 'payroll', name: 'Payroll', icon: DollarSign, href: '/dashboard/admin/payroll' },
  { key: 'settings', name: 'Pengaturan', icon: Settings, href: '/settings' },
];

const normalizePath = (path = ''): string => {
  const cleaned = path.replace(/\/+/g, '/').replace(/\/$/, '');
  return cleaned || '/';
};

const isNavActive = (currentPath: string, targetPath: string): boolean => {
  const path = normalizePath(currentPath);
  const target = normalizePath(targetPath);

  if (target === '/dashboard/admin') {
    return path === target;
  }

  return path === target || path.startsWith(`${target}/`);
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayoutContent: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { data, refresh, isLoading: dashboardLoading } = useAdminDashboard();
  const location = useLocation();
  const [viewportWidth, setViewportWidth] = useState<number>(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));
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

  useEffect(() => {
    if (!loading && isApprovedAdmin) {
      void refresh();
    }
  }, [loading, isApprovedAdmin, refresh]);

  const notifications: Record<string, number> = useMemo(() => {
    if (!isApprovedAdmin || dashboardLoading || !data?.notifications) {
      return {};
    }
    return { ...data.notifications };
  }, [data?.notifications, dashboardLoading, isApprovedAdmin]);

  return (
    <div className="min-h-screen bg-app text-primary flex transition-colors">
      <div
        className={`hidden md:flex md:flex-shrink-0 transition-all duration-300 ${desktopSidebarCollapsed ? 'w-24' : 'w-72'}`}
      >
        <div className="flex flex-col w-full">
          <SidebarContent
            disableBadge={!isApprovedAdmin}
            collapsed={desktopSidebarCollapsed}
            notifications={notifications}
          />
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader
          isSidebarCollapsed={desktopSidebarCollapsed}
          showSidebarToggle={true}
          onToggleSidebar={() => setDesktopSidebarCollapsed((prev) => !prev)}
          userName={user?.name ?? ''}
          userInitial={user?.name?.charAt(0)?.toUpperCase() ?? 'A'}
        />

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
          notifications={notifications}
          isAdmin={isAdmin}
          isApproved={isApprovedAdmin}
          density={navDensity}
        />
      </div>
    </div>
  );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => (
  <AdminDashboardProvider>
    <AdminLayoutContent>{children}</AdminLayoutContent>
  </AdminDashboardProvider>
);

interface SidebarContentProps {
  disableBadge?: boolean;
  collapsed?: boolean;
  notifications?: Record<string, number>;
}

function SidebarContent({ disableBadge = false, collapsed = false, notifications = {} }: SidebarContentProps) {
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
            const count = notifications[item.key] ?? 0;
            const showBadge = !collapsed && count > 0 && !disableBadge;
            const ItemIcon = item.icon;

            return (
              <Link
                key={item.key}
                to={item.href}
                className={`group flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 sm:px-4 py-3 text-sm font-medium rounded-2xl transition-all ${
                  active ? 'bg-coffee text-white shadow-soft' : 'text-secondary hover:bg-soft hover:text-coffee'
                }`}
              >
                <span className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
                  <ItemIcon
                    className={`flex-shrink-0 h-5 w-5 ${active ? 'text-white' : 'text-coffee-light'} ${collapsed ? '' : 'mr-3'}`}
                  />
                  {!collapsed && <span className="font-medium">{item.name}</span>}
                </span>
                {showBadge && (
                  <span className="inline-flex items-center justify-center rounded-full bg-warning-500 px-2 text-xs font-semibold text-white">
                    {count}
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

interface MobileBottomNavProps {
  items: NavItem[];
  currentPath: string;
  notifications?: Record<string, number>;
  isAdmin: boolean;
  isApproved: boolean;
  density: 'comfortable' | 'cozy' | 'compact' | 'ultra';
}

function MobileBottomNav({ items, currentPath, notifications = {}, isAdmin, isApproved, density }: MobileBottomNavProps) {
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
  } as const;

  const preset = presets[density] || presets.comfortable;

  return (
    <nav className="md:hidden">
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-28 bg-bottom-gradient" />
      <div className="fixed bottom-5 inset-x-4 z-30">
        <div className={`nav-blur border border-divider/60 shadow-floating rounded-3xl ${preset.container}`}>
          <ul className="flex items-center overflow-x-auto no-scrollbar" role="tablist">
            {items.map((item) => {
              const active = isNavActive(currentPath, item.href);
              const ItemIcon = item.icon;
              const count = notifications[item.key] ?? 0;
              const showBadge = count > 0 && isApproved;

              return (
                <li key={item.key} className="flex-shrink-0" role="presentation">
                  <Link
                    to={item.href}
                    className={`flex flex-col items-center justify-center rounded-2xl transition-all duration-200 ${preset.item} ${
                      active ? 'bg-coffee text-white shadow-soft scale-95' : 'text-ink-light hover:bg-cream-200'
                    }`}
                  >
                    <span className="relative flex items-center justify-center">
                      <ItemIcon className={`${preset.icon} ${active ? 'text-white' : 'text-coffee-light'}`} />
                      {showBadge && (
                        <span className={`absolute -top-1 -right-1 inline-flex items-center justify-center ${preset.badge} px-1 rounded-full font-semibold bg-warning-500 text-white`}>
                          {count}
                        </span>
                      )}
                    </span>
                    <span className={`${preset.text} tracking-wide ${active ? 'text-white' : 'text-ink-light'}`}>
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

export default AdminLayout;
