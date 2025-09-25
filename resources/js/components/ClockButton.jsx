import React from 'react';
import { Button } from '@/components/ui/Button';

export default function ClockButton({
  onClick,
  loading = false,
  disabled = false,
  variant = 'default',
  className = '',
  children,
  icon: Icon,
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant={variant}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
      ) : (
        Icon ? <Icon size={16} /> : null
      )}
      {children}
    </Button>
  );
}
