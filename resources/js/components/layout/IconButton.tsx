import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  badge?: number;
  badgeSrLabel?: string;
  badgeClassName?: string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, badge, badgeSrLabel, badgeClassName, className = '', disabled, ...buttonProps }, ref) => {
    const showBadge = typeof badge === 'number' && badge > 0;
    const appliedBadgeClass = badgeClassName ?? 'bg-warning-500';

    return (
      <button
        ref={ref}
        type="button"
        className={`relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-coffee-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 ${className}`}
        disabled={disabled}
        {...buttonProps}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
        {showBadge && (
          <span className={`absolute -top-1 -right-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white shadow-sm ${appliedBadgeClass}`}>
            {badge}
            {badgeSrLabel && <span className="sr-only">{badgeSrLabel}</span>}
          </span>
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
