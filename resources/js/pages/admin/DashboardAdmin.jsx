import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import { Users, Calendar, Clock, DollarSign, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAdminDashboard } from '@/contexts/AdminDashboardContext';

const DashboardAdmin = () => {
  const { data, isLoading } = useAdminDashboard();

  const stats = useMemo(() => ({
    totalEmployees: data?.total_employees ?? 0,
    todayShifts: data?.shifts_today ?? 0,
    attendance: data?.attendance_percentage ?? 0,
    totalPayroll: data?.total_payroll ?? 0,
    payrollPending: data?.payroll_pending ?? 0,
    leavesPending: data?.leaves_pending ?? 0,
  }), [data]);

  const attendanceData = useMemo(() => (data?.weekly_attendance ?? []).map((item) => ({
    date: item.date,
    hadir: item.hadir,
    izin: item.izin,
  })), [data?.weekly_attendance]);

  const leaveData = useMemo(() => data?.leave_status ?? [], [data?.leave_status]);

  const recentLeaves = useMemo(() => data?.recent_leaves ?? [], [data?.recent_leaves]);

  const attendanceBreakdown = useMemo(() => ({
    hadir: data?.attendance_breakdown?.hadir ?? 0,
    telat: data?.attendance_breakdown?.telat ?? 0,
    izin: data?.attendance_breakdown?.izin ?? 0,
    sakit: data?.attendance_breakdown?.sakit ?? 0,
    alfa: data?.attendance_breakdown?.alfa ?? 0,
  }), [data?.attendance_breakdown]);

  const formatCurrency = (value = 0) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusMeta = (status) => {
    switch (status) {
      case 'approved':
        return { label: 'Disetujui', className: 'bg-pastel-green bg-opacity-20 text-green-700' };
      case 'pending':
        return { label: 'Menunggu', className: 'bg-pastel-yellow bg-opacity-20 text-yellow-700' };
      case 'rejected':
        return { label: 'Ditolak', className: 'bg-pastel-red bg-opacity-20 text-red-700' };
      case 'cancelled':
        return { label: 'Dibatalkan', className: 'bg-slate-200 text-slate-600' };
      default:
        return { label: status, className: 'bg-slate-200 text-slate-600' };
    }
  };

  const pastelColors = ['#B8E6B8', '#FFE4B8', '#FFB8B8', '#B8D4FF'];

  if (isLoading && !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const totalBreakdown = Object.values(attendanceBreakdown).reduce((acc, value) => acc + value, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink font-display">Dashboard Overview</h1>
        <p className="text-ink-light mt-2">
          Selamat datang! Semua metrik di bawah ini diperbarui langsung dari database realtime.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
        <StatCard
          title="Total Karyawan"
          value={stats.totalEmployees}
          icon={Users}
          color="coffee"
          trend={stats.totalEmployees > 0 ? 'up' : undefined}
          trendValue={stats.totalEmployees > 0 ? `${stats.totalEmployees} aktif` : undefined}
        />
        <StatCard
          title="Shift Hari Ini"
          value={stats.todayShifts}
          icon={Calendar}
          color="blue"
          trend={stats.todayShifts > 0 ? 'up' : undefined}
          trendValue={stats.todayShifts > 0 ? `${stats.todayShifts} shift terjadwal` : 'Tidak ada shift'}
        />
        <StatCard
          title="Kehadiran Hari Ini"
          value={`${stats.attendance}%`}
          icon={Clock}
          color="green"
          trend={stats.attendance >= 90 ? 'up' : undefined}
          trendValue={`Hadir ${attendanceBreakdown.hadir + attendanceBreakdown.telat}/${stats.totalEmployees || '-'}`}
        />
        <StatCard
          title="Total Payroll"
          value={stats.totalPayroll ? formatCurrency(stats.totalPayroll) : 'Rp 0'}
          icon={DollarSign}
          color="yellow"
          trend={stats.totalPayroll ? 'up' : undefined}
          trendValue="Payroll dibayar bulan ini"
        />
        <StatCard
          title="Menunggu Persetujuan"
          value={`${stats.leavesPending} cuti • ${stats.payrollPending} payroll`}
          icon={FileText}
          color="red"
          trend={stats.leavesPending + stats.payrollPending > 0 ? 'down' : undefined}
          trendValue="Segera tindak lanjuti"
        />
      </div>

      {/* Attendance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Kehadiran Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Hadir', key: 'hadir', color: 'text-green-700', chip: 'bg-pastel-green/40 text-green-700' },
              { label: 'Telat', key: 'telat', color: 'text-yellow-700', chip: 'bg-pastel-yellow/60 text-yellow-800' },
              { label: 'Izin', key: 'izin', color: 'text-blue-700', chip: 'bg-pastel-blue/60 text-blue-700' },
              { label: 'Sakit', key: 'sakit', color: 'text-purple-700', chip: 'bg-purple-100 text-purple-700' },
              { label: 'Alfa', key: 'alfa', color: 'text-red-700', chip: 'bg-pastel-red/60 text-red-700' },
            ].map((item) => {
              const count = attendanceBreakdown[item.key] ?? 0;
              const percentage = totalBreakdown > 0 ? Math.round((count / totalBreakdown) * 100) : 0;
              return (
                <div
                  key={item.key}
                  className="rounded-2xl border border-cream-200 bg-cream-50/60 p-4 shadow-soft transition-colors hover:border-cream-300"
                >
                  <p className="text-sm font-semibold text-ink">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-ink font-display">{count}</p>
                  <span className={`mt-2 inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${item.chip}`}>
                    {percentage}% dari total
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Kehadiran (7 Hari)</CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceData.length === 0 ? (
              <p className="py-12 text-center text-sm text-ink-light">
                Belum ada data kehadiran pada rentang waktu ini.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={attendanceData}>
                  <defs>
                    <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B8E6B8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#B8E6B8" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorIzin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFE4B8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FFE4B8" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5EBDF" />
                  <XAxis dataKey="date" stroke="#9A9A9A" />
                  <YAxis stroke="#9A9A9A" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFF9F0', border: '1px solid #E6C89B', borderRadius: '12px' }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="hadir" 
                    stroke="#B8E6B8" 
                    fillOpacity={1}
                    fill="url(#colorHadir)"
                    strokeWidth={2}
                    name="Hadir"
                  />
                  <Area
                    type="monotone" 
                    dataKey="izin" 
                    stroke="#FFE4B8" 
                    fillOpacity={1}
                    fill="url(#colorIzin)"
                    strokeWidth={2}
                    name="Izin"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Leave Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status Cuti Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            {leaveData.length === 0 ? (
              <p className="py-12 text-center text-sm text-ink-light">
                Belum ada pengajuan cuti pada periode ini.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leaveData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {leaveData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pastelColors[index % pastelColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFF9F0', border: '1px solid #E6C89B', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Leaves Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pengajuan Cuti Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-ink">Karyawan</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-ink">Tanggal</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-ink">Durasi</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-ink">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-ink">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {recentLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-sm text-ink-light">
                      Belum ada pengajuan cuti terbaru.
                    </td>
                  </tr>
                ) : (
                  recentLeaves.map((leave) => {
                    const meta = getStatusMeta(leave.status);
                    return (
                      <tr key={leave.id} className="border-b border-cream-100 hover:bg-cream-50 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm font-medium text-ink">{leave.employee_name}</p>
                            <p className="text-xs text-ink-light">{leave.department ?? 'Departemen tidak tersedia'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-ink-light">
                          {leave.start_date} - {leave.end_date}
                        </td>
                        <td className="py-4 px-4 text-sm text-ink-light">{leave.duration_days} hari</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${meta.className}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="rounded-xl px-4 py-2 text-sm font-semibold text-coffee-dark shadow-soft transition-all hover:-translate-y-[1px] hover:bg-cream-200"
                              disabled
                            >
                              Setuju
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl px-4 py-2 text-sm font-semibold text-coffee border-coffee/50 transition-all hover:bg-coffee/10 hover:text-coffee-dark"
                              disabled
                            >
                              Tolak
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardAdmin;
