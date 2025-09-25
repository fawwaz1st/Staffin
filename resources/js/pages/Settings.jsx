import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Clock, LogOut, Settings, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { logout, user } = useAuth();
  const [form, setForm] = useState({
    default_start_time: '08:00',
    default_end_time: '17:00',
    max_leave_days: 12,
    timezone: 'Asia/Jakarta',
    working_days: '1,2,3,4,5',
  });

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (event) => {
    event.preventDefault();
    alert('Pengaturan berhasil disimpan (simulasi).');
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-primary dark:text-white">
          <Settings size={22} /> Pengaturan Sistem
        </h1>
        <p className="text-sm text-secondary">Atur preferensi operasional dan kendalikan sesi akun Anda.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Clock size={18} /> Konfigurasi Operasional
            </CardTitle>
            <CardDescription>Ubah parameter dasar yang akan diterapkan sebagai default bagi seluruh karyawan.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-secondary">Jam Mulai Default</label>
                <input
                  type="time"
                  value={form.default_start_time}
                  onChange={(e) => onChange('default_start_time', e.target.value)}
                  className="w-full rounded-2xl border border-divider bg-card px-3 py-2 text-primary shadow-soft focus:border-coffee focus:ring-2 focus:ring-coffee/40 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-secondary">Jam Selesai Default</label>
                <input
                  type="time"
                  value={form.default_end_time}
                  onChange={(e) => onChange('default_end_time', e.target.value)}
                  className="w-full rounded-2xl border border-divider bg-card px-3 py-2 text-primary shadow-soft focus:border-coffee focus:ring-2 focus:ring-coffee/40 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-secondary">Maksimal Hari Cuti</label>
                <input
                  type="number"
                  value={form.max_leave_days}
                  onChange={(e) => onChange('max_leave_days', e.target.value)}
                  className="w-full rounded-2xl border border-divider bg-card px-3 py-2 text-primary shadow-soft focus:border-coffee focus:ring-2 focus:ring-coffee/40 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-secondary">Timezone</label>
                <input
                  type="text"
                  value={form.timezone}
                  onChange={(e) => onChange('timezone', e.target.value)}
                  className="w-full rounded-2xl border border-divider bg-card px-3 py-2 text-primary shadow-soft focus:border-coffee focus:ring-2 focus:ring-coffee/40 dark:bg-slate-800"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-secondary">Working Days (0=Sun .. 6=Sat, pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={form.working_days}
                  onChange={(e) => onChange('working_days', e.target.value)}
                  className="w-full rounded-2xl border border-divider bg-card px-3 py-2 text-primary shadow-soft focus:border-coffee focus:ring-2 focus:ring-coffee/40 dark:bg-slate-800"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" variant="primary" className="px-6">
                  Simpan Pengaturan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col border border-warning-300 bg-warning-50/70 shadow-soft dark:border-warning-500/60 dark:bg-warning-500/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-warning-900 dark:text-warning-200">
              <ShieldCheck size={18} /> Sesi & Keamanan
            </CardTitle>
            <CardDescription className="text-warning-800/90 dark:text-warning-100/80">
              Pantau sesi aktif dan keluar dari aplikasi ketika selesai menggunakan perangkat ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-coffee to-coffee-light text-lg font-semibold text-white shadow-soft">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
              <div>
                <p className="text-sm font-semibold text-primary dark:text-white">{user?.name || 'Administrator'}</p>
                <p className="text-xs text-secondary">Terakhir login pada perangkat ini. Pastikan keluar setelah selesai.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-warning-200 bg-white/70 p-3 text-sm text-warning-900 shadow-soft dark:border-warning-500/30 dark:bg-slate-900/40 dark:text-warning-100">
              Logout akan menutup sesi admin segera. Anda dapat login kembali kapan saja menggunakan kredensial resmi.
            </div>
            <Button
              onClick={handleLogout}
              variant="danger"
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-2 shadow-soft hover:-translate-y-[1px] focus:ring-warning-200"
            >
              <LogOut size={16} /> Keluar dari Akun
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
