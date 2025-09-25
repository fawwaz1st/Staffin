import React from 'react';

const STYLES = {
  pending: 'bg-soft text-warning-500 border-divider/30',
  approved: 'bg-soft text-success-500 border-divider/30',
  rejected: 'bg-soft text-danger-500 border-divider/30',
};

export default function StatusBadge({ status }) {
  const cls = STYLES[status] || 'bg-soft text-secondary border-divider/20';
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  );
}
