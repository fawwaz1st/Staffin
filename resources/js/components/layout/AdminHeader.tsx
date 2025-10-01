import React from 'react';
import { PanelLeftClose, PanelRightOpen } from 'lucide-react';
import IconButton from './IconButton';
import ThemeToggle from '@/components/ui/ThemeToggle';

export interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  isSidebarCollapsed?: boolean;
  showSidebarToggle?: boolean;
  onToggleSidebar?: () => void;
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
  userName,
  userInitial,
  className = '',
}) => {
  const initial = userInitial || userName?.charAt(0)?.toUpperCase() || 'A';

  return (
    <header
      className={`sticky top-0 z-40 border-b border-divider/40 bg-card/90 backdrop-blur-md shadow-sm transition-colors duration-300 ${className}`}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 text-primary">
        <div className="flex items-center gap-3 min-w-0">
          {showSidebarToggle && (
            <IconButton
              icon={isSidebarCollapsed ? PanelRightOpen : PanelLeftClose}
              onClick={onToggleSidebar}
              aria-label="Toggle sidebar"
              className="hidden md:inline-flex"
            />
          )}
          <div className="min-w-0 text-primary">
            <p className="hidden text-xs uppercase tracking-wide text-muted md:block">Admin Area</p>
            <h1 className="truncate text-lg font-semibold sm:text-2xl">
              {title}
            </h1>
            {subtitle && <p className="mt-0.5 truncate text-sm text-secondary">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle ariaLabel="Ganti tema tampilan" variant="icon" />

          <div className="inline-flex h-11 items-center gap-2 rounded-full border border-divider/40 bg-card px-3 py-2 text-left shadow-sm transition-all hover:border-divider/30 hover:bg-soft focus:outline-none focus:ring-2 focus:ring-coffee-300">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-coffee to-coffee-light text-sm font-semibold text-white">
              {initial}
            </span>
            <span className="hidden flex-col leading-tight md:flex">
              <span className="text-sm font-semibold text-primary">{userName || 'Pengguna'}</span>
              <span className="text-xs text-secondary">Administrator</span>
            </span>
          </div>

        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
