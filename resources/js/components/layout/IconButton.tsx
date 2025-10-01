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
        className={`relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-divider/40 bg-card text-primary shadow-sm transition-colors duration-200 hover:border-divider/30 hover:bg-soft focus:outline-none focus:ring-2 focus:ring-coffee-300 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        disabled={disabled}
        {...buttonProps}
      >
        <Icon className="h-5 w-5 text-current" aria-hidden="true" />
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
