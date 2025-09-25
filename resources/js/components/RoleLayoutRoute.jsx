import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import EmployeeLayout from '@/layouts/EmployeeLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function RoleLayoutRoute({ children }) {
  const { user } = useAuth();
  if (!user) return children;
  if (user.role === 'admin') {
    return <AdminLayout>{children}</AdminLayout>;
  }
  return <EmployeeLayout>{children}</EmployeeLayout>;
}
