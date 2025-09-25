import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Users as UsersIcon, Search, UserPlus } from 'lucide-react';
import UserCard from '@/components/admin/users/UserCard';
import StatusBadge from '@/components/admin/users/StatusBadge';
import { fetchUsers, fetchUsersSummary } from '@/api/admin/users';
import { useAuth } from '@/contexts/AuthContext';

export default function UsersPage() {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isApprovedAdmin = isAdmin && user?.status === 'approved';
  const [filters, setFilters] = useState({ status: '', role: '', search: '' });
  const [data, setData] = useState({ data: [], meta: {} });
  const [summary, setSummary] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 9;

  const load = async () => {
    if (!isApprovedAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [list, sum] = await Promise.all([
        fetchUsers({ page, perPage, ...filters }),
        fetchUsersSummary(),
      ]);
      setData(list);
      setSummary(sum);
    } catch (error) {
      if (error.response?.status === 403) {
        // Tenangkan konsol khusus 403 (bukan error fatal di UI)
        setData({ data: [], meta: {} });
        setSummary({ total: 0, pending: 0, approved: 0, rejected: 0 });
      } else {
        console.error('Error loading users:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Tunggu auth siap
    if (authLoading) return;
    // Jika bukan admin, jangan panggil endpoint admin
    if (!isAdmin) {
      setLoading(false);
      setData({ data: [], meta: {} });
      setSummary({ total: 0, pending: 0, approved: 0, rejected: 0 });
      return;
    }
    if (!isApprovedAdmin) {
      setLoading(false);
      setData({ data: [], meta: {} });
      setSummary({ total: 0, pending: 0, approved: 0, rejected: 0 });
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.status, filters.role, authLoading, isAdmin, isApprovedAdmin]);

  const onCardChanged = (changedUser) => {
    setData((prev) => ({
      ...prev,
      data: prev.data.map((u) => (u.id === changedUser.id ? changedUser : u)),
    }));
    if (isApprovedAdmin) {
      fetchUsersSummary().then(setSummary).catch(console.error);
    }
  };

  const onCardRemoved = (removedUser) => {
    setData((prev) => ({
      ...prev,
      data: prev.data.filter((u) => u.id !== removedUser.id),
    }));
    if (isApprovedAdmin) {
      fetchUsersSummary().then(setSummary).catch(console.error);
    }
  };

  const pages = useMemo(() => {
    const total = data?.meta?.last_page || 1;
    return Array.from({ length: total }, (_, i) => i + 1);
  }, [data]);

  // Tampilkan pesan akses jika bukan admin
  if (!authLoading && isAdmin && !isApprovedAdmin) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary font-display flex items-center gap-3">
            <div className="p-2 bg-soft rounded-2xl shadow-soft">
              <UsersIcon size={24} className="text-coffee" />
            </div>
            Manajemen User
          </h1>
          <p className="text-secondary mt-2">Akun admin Anda belum disetujui. Hubungi super admin untuk melanjutkan.</p>
        </div>
        <Card subtle>
          <CardContent>
            <div className="py-12 text-center space-y-3">
              <UserPlus className="h-12 w-12 mx-auto text-muted" />
              <p className="text-secondary">Fitur ini baru aktif setelah akun disetujui.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!authLoading && !isAdmin) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary font-display flex items-center gap-3">
            <div className="p-2 bg-soft rounded-2xl shadow-soft">
              <UsersIcon size={24} className="text-coffee" />
            </div>
            Manajemen User
          </h1>
          <p className="text-secondary mt-2">Anda tidak memiliki akses ke halaman ini.</p>
        </div>
        <Card subtle>
          <CardContent>
            <div className="py-12 text-center space-y-3">
              <UserPlus className="h-12 w-12 mx-auto text-muted" />
              <p className="text-secondary">Halaman ini khusus Administrator.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary font-display flex items-center gap-3">
              <div className="p-2 bg-soft rounded-2xl shadow-soft">
                <UsersIcon size={24} className="text-coffee" />
              </div>
              Manajemen User
            </h1>
            <p className="text-secondary mt-2">Kelola pengguna dan persetujuan akun</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-2xl border border-divider/30 shadow-soft">
              <StatusBadge status="pending" /> 
              <span className="text-sm font-medium text-ink">{summary.pending}</span>
            </div>
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-2xl border border-divider/30 shadow-soft">
              <StatusBadge status="approved" /> 
              <span className="text-sm font-medium text-ink">{summary.approved}</span>
            </div>
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-2xl border border-divider/30 shadow-soft">
              <StatusBadge status="rejected" /> 
              <span className="text-sm font-medium text-ink">{summary.rejected}</span>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 overflow-visible">
          {/* Filters */}
          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-divider/20 bg-card/80 px-4 py-4 backdrop-blur-sm sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                placeholder="Cari nama atau email..."
                className="w-full rounded-2xl border border-transparent bg-soft/60 px-12 py-3 text-primary placeholder:text-muted focus:border-coffee focus:outline-none focus:ring-4 focus:ring-coffee/20 transition-shadow"
                value={filters.search}
                onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && load()}
              />
            </div>
            <select
              className="w-full rounded-2xl border border-transparent bg-soft/60 px-4 py-3 text-primary focus:border-coffee focus:outline-none focus:ring-4 focus:ring-coffee/20 transition-shadow"
              value={filters.status}
              onChange={(e) => { setPage(1); setFilters((p) => ({ ...p, status: e.target.value })); }}
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              className="w-full rounded-2xl border border-transparent bg-soft/60 px-4 py-3 text-primary focus:border-coffee focus:outline-none focus:ring-4 focus:ring-coffee/20 transition-shadow"
              value={filters.role}
              onChange={(e) => { setPage(1); setFilters((p) => ({ ...p, role: e.target.value })); }}
            >
              <option value="">Semua Role</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-2xl border border-divider/15 bg-soft/60 animate-pulse" />
              ))}
            </div>
          ) : data?.data?.length ? (
            <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
              {data.data.map((u) => (
                <UserCard key={u.id} user={u} onChanged={onCardChanged} onRemoved={onCardRemoved} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <UserPlus className="mx-auto mb-4 h-12 w-12 text-muted" />
              <p className="text-secondary">Belum ada pengguna</p>
            </div>
          )}

          {/* Pagination */}
          {pages.length > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {pages.map((p) => (
                <button
                  key={p}
                  className={`min-w-[40px] rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    p === page
                      ? 'bg-coffee text-white shadow-soft'
                      : 'border border-divider/30 text-secondary hover:border-coffee hover:bg-soft/60'
                  }`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
