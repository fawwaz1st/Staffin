import React, { useState } from 'react';
import { updateUserRole } from '@/api/admin/users';
import { toast } from 'react-hot-toast';

export default function RoleDropdown({ user, onChanged, disabled = false }) {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(user.role);

  const onChange = async (e) => {
    const newRole = e.target.value;
    setRole(newRole);
    setLoading(true);
    try {
      const res = await updateUserRole(user.id, newRole);
      toast.success('Role diperbarui');
      onChanged?.(res.user);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui role');
      setRole(user.role);
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={role}
      onChange={onChange}
      disabled={loading || disabled}
      className="rounded-xl border border-divider/30 bg-soft/70 px-4 py-2 text-sm font-medium text-coffee shadow-soft transition-all focus:border-coffee focus:outline-none focus:ring-2 focus:ring-coffee/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <option value="employee">Employee</option>
      <option value="admin">Admin</option>
    </select>
  );
}
