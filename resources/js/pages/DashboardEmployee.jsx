import { Calendar, Clock, DollarSign, TrendingUp, MapPin, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CardSkeleton } from '../components/ui/Skeleton';
import { useFetch } from '../hooks/useFetch';

export default function DashboardEmployee() {
  const { data: summary, loading, error } = useFetch('/dashboard/employee/summary');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Karyawan</h2>
          <p className="text-gray-600 dark:text-gray-400">Lihat jadwal shift, riwayat absensi, dan informasi personal.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  const shift = summary?.shift_today;
  const attendance = summary?.attendance_today;
  const payroll = summary?.latest_payroll;
  const monthlyAttendance = summary?.this_month_attendance;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Karyawan</h2>
        <p className="text-gray-600 dark:text-gray-400">Lihat jadwal shift, riwayat absensi, dan informasi personal.</p>
      </div>

      {/* Today's Shift */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Jadwal Shift Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shift ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Waktu Kerja</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{shift.start_time} - {shift.end_time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Pause className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Istirahat</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{shift.break_time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lokasi</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{shift.location}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Tidak ada jadwal shift hari ini</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Attendance Today */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Absensi Hari Ini</h3>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                attendance?.status === 'present' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {attendance?.status === 'present' ? 'Hadir' : 'Belum Absen'}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Clock In:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {attendance?.clock_in || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Clock Out:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {attendance?.clock_out || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Jam Kerja:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {attendance?.working_hours || 0}h
                </span>
              </div>
            </div>
            {!attendance?.clock_in && (
              <Button className="w-full mt-4" size="sm">
                <Play className="h-4 w-4 mr-2" />
                Clock In
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Latest Payroll */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Gaji Terakhir</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Periode: {payroll?.period || 'N/A'}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Rp {(payroll?.amount || 0).toLocaleString('id-ID')}
                </p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                payroll?.status === 'paid' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
              }`}>
                {payroll?.status === 'paid' ? 'Sudah Dibayar' : 'Pending'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Performance Score */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Performa Bulan Ini</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Skor</span>
                    <span className="text-sm font-medium">{summary?.performance_score || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${summary?.performance_score || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Berdasarkan ketepatan waktu dan kualitas kerja
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Absensi Bulan Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyAttendance ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{monthlyAttendance.present_days}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Hari Hadir</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{monthlyAttendance.total_days}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Hari</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{monthlyAttendance.percentage}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Persentase Kehadiran</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Data absensi tidak tersedia</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
