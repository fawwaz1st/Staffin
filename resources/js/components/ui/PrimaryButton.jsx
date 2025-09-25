import React from 'react';
import { Button } from './Button';

export default function PrimaryButton({ children, className = '', ...props }) {
  return (
    <Button {...props} className={`bg-primary-600 hover:bg-primary-700 text-white ${className}`} />
  );
}
