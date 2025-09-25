import { Users, Clock, FileText, DollarSign, TrendingUp, Calendar, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Chart } from '../components/ui/Chart';
import { CardSkeleton, ChartSkeleton, TableSkeleton } from '../components/ui/Skeleton';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardAdmin() {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isApprovedAdmin = isAdmin && user?.status === 'approved';

  const {
    data: summary,
    loading,
    error,
  } = useFetch('/dashboard/admin/summary', {
    enabled: !authLoading && isApprovedAdmin,
    transform: (data) => data ?? {},
  });

  if (!authLoading && !isApprovedAdmin) {
    const title = isAdmin ? 'Akun Admin Belum Aktif' : 'Akses Terbatas';
    const description = isAdmin
      ? 'Silakan hubungi super admin untuk menyetujui akun Anda sebelum mengakses ringkasan.'
      : 'Halaman ringkasan ini hanya tersedia untuk pengguna dengan peran administrator.';
    return (
      <div className="space-y-6">
        <Card subtle>
          <CardContent className="py-12 text-center space-y-3">
            <ShieldAlert className="mx-auto h-12 w-12 text-warning-500" />
            <h2 className="text-xl font-semibold text-primary">{title}</h2>
            <p className="text-secondary max-w-lg mx-auto">{description}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-primary">Dashboard Admin</h2>
          <p className="text-secondary">Ringkasan metrik dan akses fitur khusus admin.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-danger-500">Error: {error}</p>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Karyawan',
      value: summary?.total_employees || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Shift Hari Ini',
      value: summary?.shifts_today || 0,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Absensi Hari Ini',
      value: summary?.attendance_today || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      title: 'Payroll Pending',
      value: summary?.payroll_pending || 0,
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary">Dashboard Admin</h2>
        <p className="text-secondary">Ringkasan metrik dan akses fitur khusus admin.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">{stat.title}</p>
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Absensi Mingguan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              type="bar"
              data={summary?.weekly_attendance || []}
              dataKey="count"
              xKey="day"
              color="#3b82f6"
              height={250}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              type="line"
              data={summary?.monthly_performance || []}
              dataKey="performance"
              xKey="month"
              color="#10b981"
              height={250}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Leaves Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Permintaan Cuti Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary?.recent_leaves?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-divider/40">
                    <th className="text-left py-2 text-sm font-medium text-secondary uppercase tracking-wide">Karyawan</th>
                    <th className="text-left py-2 text-sm font-medium text-secondary uppercase tracking-wide">Jenis</th>
                    <th className="text-left py-2 text-sm font-medium text-secondary uppercase tracking-wide">Tanggal</th>
                    <th className="text-left py-2 text-sm font-medium text-secondary uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recent_leaves.map((leave, index) => (
                    <tr key={index} className="border-b border-divider/30 row-hover">
                      <td className="py-3 text-sm text-primary">{leave.employee}</td>
                      <td className="py-3 text-sm text-secondary capitalize">{leave.type}</td>
                      <td className="py-3 text-sm text-secondary">{leave.start_date} - {leave.end_date}</td>
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          leave.status === 'approved' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : leave.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-secondary">
              Belum ada permintaan cuti terbaru
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
