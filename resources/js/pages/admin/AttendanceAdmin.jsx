import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AttendanceTable from '@/components/AttendanceTable';
import useDebounce from '@/hooks/useDebounce';
import { useFetch } from '@/hooks/useFetch';
import api from '@/api/axios';
import { Calendar, Users, Download } from 'lucide-react';

export default function AttendanceAdmin() {
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    status: '',
    user_id: '',
    page: 1,
    per_page: 15,
  });

  const debounced = useDebounce(filters, 400);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (debounced.start_date) p.set('start_date', debounced.start_date);
    if (debounced.end_date) p.set('end_date', debounced.end_date);
    if (debounced.status) p.set('status', debounced.status);
    if (debounced.user_id) p.set('user_id', debounced.user_id);
    p.set('page', String(debounced.page || 1));
    p.set('per_page', String(debounced.per_page || 15));
    return p.toString();
  }, [debounced]);

  const { data, loading, refetch } = useFetch(`/attendance?${qs}`);
  const { data: employees } = useFetch('/users?role=employee');

  const rows = data?.data || [];
  const meta = data || {};

  const handleChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val, page: 1 }));
  };

  const exportCsv = () => {
    const url = `/attendance/export?${qs}`;
    const full = (api.defaults.baseURL || '') + url;
    window.open(full, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Manajemen Absensi</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} className="flex items-center gap-2">
            <Download size={16} /> Export CSV
          </Button>
        </div>
      </div>

      <Card subtle>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-secondary mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
                className="w-full px-4 py-3 bg-card border border-divider/60 rounded-2xl text-primary focus:outline-none focus:ring-4 focus:ring-coffee-50 focus:border-coffee transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Tanggal Selesai</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
                className="w-full px-4 py-3 bg-card border border-divider/60 rounded-2xl text-primary focus:outline-none focus:ring-4 focus:ring-coffee-50 focus:border-coffee transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-3 bg-card border border-divider/60 rounded-2xl text-primary focus:outline-none focus:ring-4 focus:ring-coffee-50 focus:border-coffee transition-all"
              >
                <option value="">Semua</option>
                <option value="hadir">Hadir</option>
                <option value="telat">Telat</option>
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
                <option value="alfa">Alfa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Karyawan</label>
              <select
                value={filters.user_id}
                onChange={(e) => handleChange('user_id', e.target.value)}
                className="w-full px-4 py-3 bg-card border border-divider/60 rounded-2xl text-primary focus:outline-none focus:ring-4 focus:ring-coffee-50 focus:border-coffee transition-all"
              >
                <option value="">Semua</option>
                {(employees || []).map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar size={18} /> Daftar Absensi</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceTable rows={rows} loading={loading} isAdmin />

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-secondary">
              Halaman {meta.current_page || 1} dari {meta.last_page || 1}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={(meta.current_page || 1) <= 1} onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) - 1 }))}>
                Prev
              </Button>
              <Button variant="outline" disabled={(meta.current_page || 1) >= (meta.last_page || 1)} onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) + 1 }))}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
