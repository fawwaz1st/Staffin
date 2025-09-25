import React from 'react';

export default function Modal({ open, title, children, onClose, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-overlay" onClick={onClose} />
      <div className="relative bg-card border border-divider/30 rounded-3xl shadow-floating w-full max-w-lg mx-4">
        {title && (
          <div className="px-6 py-5 border-b border-divider/40 text-lg font-semibold text-primary">
            {title}
          </div>
        )}
        <div className="px-6 py-5 text-secondary">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-divider/40 bg-soft rounded-b-3xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
