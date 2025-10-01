import api from '@/api/axios';

export const fetchAdminDashboard = async () => {
  const { data } = await api.get('/dashboard/admin/summary');
  return data;
};

export default {
  fetchAdminDashboard,
};
