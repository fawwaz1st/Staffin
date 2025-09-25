import api from '@/api/axios';

const handleForbidden = (error, fallback = {}) => {
  if (error.response?.status === 403) {
    return fallback;
  }
  throw error;
};

export const fetchUsers = async ({ page = 1, perPage = 10, status = '', role = '', search = '' } = {}) => {
  const params = new URLSearchParams();
  if (page) params.set('page', page);
  if (perPage) params.set('per_page', perPage);
  if (status) params.set('status', status);
  if (role) params.set('role', role);
  if (search) params.set('search', search);
  try {
    const { data } = await api.get(`/admin/users?${params.toString()}`);
    return data;
  } catch (error) {
    return handleForbidden(error, { data: [], meta: {} });
  }
};

export const fetchUsersSummary = async () => {
  try {
    const { data } = await api.get('/admin/users/summary');
    return data;
  } catch (error) {
    return handleForbidden(error, { total: 0, pending: 0, approved: 0, rejected: 0 });
  }
};

export const approveUser = async (id) => {
  const { data } = await api.patch(`/admin/users/${id}/approve`);
  return data;
};

export const rejectUser = async (id) => {
  const { data } = await api.patch(`/admin/users/${id}/reject`);
  return data;
};

export const updateUserRole = async (id, role) => {
  const { data } = await api.patch(`/admin/users/${id}/role`, { role });
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};
