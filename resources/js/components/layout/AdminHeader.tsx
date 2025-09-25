import React from 'react';
import { Bell, PanelLeftClose, PanelRightOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import IconButton from './IconButton';
import ThemeToggle from '@/components/ui/ThemeToggle';

export interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  isSidebarCollapsed?: boolean;
  showSidebarToggle?: boolean;
  onToggleSidebar?: () => void;
  pendingCount?: number;
  isApprovedAdmin?: boolean;
  userName?: string | null;
  userInitial?: string;
  className?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  title = 'Admin Dashboard',
  subtitle,
  isSidebarCollapsed = false,
  showSidebarToggle = true,
  onToggleSidebar,
  pendingCount = 0,
  isApprovedAdmin = false,
  userName,
  userInitial,
  className = '',
}) => {
  const initial = userInitial || userName?.charAt(0)?.toUpperCase() || 'A';

  return (
    <header
      className={`sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm dark:border-slate-800 dark:bg-slate-950/90 ${className}`}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          {showSidebarToggle && (
            <IconButton
              icon={isSidebarCollapsed ? PanelRightOpen : PanelLeftClose}
              onClick={onToggleSidebar}
              aria-label="Toggle sidebar"
              className="hidden md:inline-flex"
            />
          )}
          <div className="min-w-0">
            <p className="hidden text-xs uppercase tracking-wide text-muted md:block">Admin Area</p>
            <h1 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-50 sm:text-2xl">
              {title}
            </h1>
            {subtitle && <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle ariaLabel="Ganti tema tampilan" variant="icon" />

          {isApprovedAdmin && (
            <Link to="/users" aria-label="Lihat daftar karyawan menunggu persetujuan">
              <IconButton
                icon={Bell}
                badge={pendingCount}
                badgeSrLabel="Permintaan pengguna menunggu persetujuan"
                className="border-transparent bg-card hover:bg-soft"
              />
            </Link>
          )}

          <div className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition-all hover:border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-coffee-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-coffee to-coffee-light text-sm font-semibold text-white">
              {initial}
            </span>
            <span className="hidden flex-col leading-tight md:flex">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">{userName || 'Pengguna'}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Administrator</span>
            </span>
          </div>

        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
