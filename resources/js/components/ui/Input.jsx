import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  icon, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-ink mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D7A6B]">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3.5
            ${icon ? 'pl-12' : ''} 
            bg-[#F3E7D8]
            border border-[#E1D1C0]
            rounded-2xl
            text-[#3C2A21]
            placeholder:text-[#9C8573]
            focus:outline-none 
            focus:ring-4
            focus:ring-[#EAD8C6]
            focus:border-[#A6774D]
            transition-all duration-200
            ${error ? 'border-pastel-red focus:ring-red-100' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-pastel-red">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
