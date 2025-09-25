import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import { Users, Calendar, Clock, DollarSign, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/api/axios';

const DashboardAdmin = () => {
  const [stats] = useState({
    totalEmployees: 12,
    todayShifts: 14,
    attendance: 92,
    totalPayroll: 45000000
  });
  
  const [attendanceData] = useState([
    { date: '17 Des', hadir: 45, izin: 3 },
    { date: '18 Des', hadir: 42, izin: 5 },
    { date: '19 Des', hadir: 47, izin: 2 },
    { date: '20 Des', hadir: 44, izin: 4 },
    { date: '21 Des', hadir: 46, izin: 3 },
    { date: '22 Des', hadir: 43, izin: 6 },
    { date: '23 Des', hadir: 48, izin: 1 },
  ]);

  const [leaveData] = useState([
    { name: 'Disetujui', value: 12 },
    { name: 'Menunggu', value: 5 },
    { name: 'Ditolak', value: 3 },
    { name: 'Dibatalkan', value: 2 },
  ]);

  const [recentLeaves] = useState([
    { id: 1, employeeName: 'John Doe', department: 'IT', date: '23 Des 2024', duration: '3 hari', status: 'pending' },
    { id: 2, employeeName: 'Jane Smith', department: 'HR', date: '22 Des 2024', duration: '1 hari', status: 'approved' },
    { id: 3, employeeName: 'Mike Johnson', department: 'Finance', date: '21 Des 2024', duration: '2 hari', status: 'rejected' },
    { id: 4, employeeName: 'Sarah Wilson', department: 'Marketing', date: '20 Des 2024', duration: '5 hari', status: 'pending' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard/admin/summary');
        // Update stats with real data when available
        if (response.data) {
          console.log('Dashboard data loaded:', response.data);
        }
      } catch (error) {
        console.log('Using dummy data - API error:', error.response?.status);
        if (error.response?.status === 403) {
          console.warn('Access forbidden - user may not have admin permissions');
        }
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink font-display">Dashboard Overview</h1>
        <p className="text-ink-light mt-2">Selamat datang! Berikut ringkasan aktivitas hari ini.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Karyawan"
          value={stats.totalEmployees}
          icon={Users}
          color="coffee"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="Shift Hari Ini"
          value={stats.todayShifts}
          icon={Calendar}
          color="blue"
          trend="up"
          trendValue="8 pagi, 4 siang"
        />
        <StatCard
          title="Kehadiran Hari Ini"
          value={`${stats.attendance}%`}
          icon={Clock}
          color="green"
          trend="down"
          trendValue="-5%"
        />
        <StatCard
          title="Total Payroll"
          value={`Rp ${(stats.totalPayroll / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          color="yellow"
          trend="up"
          trendValue="Bulan ini"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Kehadiran (7 Hari)</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Leave Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status Cuti Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
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
                  {leaveData.map((entry, index) => {
                    const pastelColors = ['#B8E6B8', '#FFE4B8', '#FFB8B8', '#B8D4FF'];
                    return <Cell key={`cell-${index}`} fill={pastelColors[index % pastelColors.length]} />;
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFF9F0', border: '1px solid #E6C89B', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
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
                {recentLeaves.map((leave) => (
                  <tr key={leave.id} className="border-b border-cream-100 hover:bg-cream-50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium text-ink">{leave.employeeName}</p>
                        <p className="text-xs text-ink-light">{leave.department}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-ink-light">{leave.date}</td>
                    <td className="py-4 px-4 text-sm text-ink-light">{leave.duration}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        leave.status === 'approved' ? 'bg-pastel-green bg-opacity-20 text-green-700' :
                        leave.status === 'pending' ? 'bg-pastel-yellow bg-opacity-20 text-yellow-700' :
                        'bg-pastel-red bg-opacity-20 text-red-700'
                      }`}>
                        {leave.status === 'approved' ? 'Disetujui' : leave.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {leave.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="rounded-xl px-4 py-2 text-sm font-semibold text-coffee-dark shadow-soft transition-all hover:-translate-y-[1px] hover:bg-cream-200"
                          >
                            Setuju
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl px-4 py-2 text-sm font-semibold text-coffee border-coffee/50 transition-all hover:bg-coffee/10 hover:text-coffee-dark"
                          >
                            Tolak
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardAdmin;
