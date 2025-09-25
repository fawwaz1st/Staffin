import React from 'react';

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
  icon: 'p-3',
};

const variantClasses = {
  primary: 'bg-coffee text-white hover:bg-coffee-dark shadow-cream hover:shadow-lg',
  secondary: 'bg-coffee-light text-coffee-dark hover:bg-coffee-100 shadow-soft',
  danger: 'bg-pastel-red text-white hover:opacity-90',
  outline: 'border-2 border-coffee text-coffee hover:bg-coffee hover:text-white',
  ghost: 'text-coffee hover:bg-coffee-50',
  cream: 'bg-cream-200 text-coffee hover:bg-cream-300 shadow-soft',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-coffee-100 disabled:opacity-50 disabled:cursor-not-allowed';
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}

export default Button;
