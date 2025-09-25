import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useFetch } from '@/hooks/useFetch';
import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';

function formatDate(date) {
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(time) {
  if (!time) return '-';
  try {
    return new Date(`2000-01-01T${time}:00`).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return time;
  }
}

const EmployeeShifts = () => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Range minggu ini
  const { startOfWeek, endOfWeek } = useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0-6 Minggu=0
    const diffToMonday = (day + 6) % 7; // Senin sebagai awal
    const start = new Date(now);
    start.setDate(now.getDate() - diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const fmt = (d) => d.toISOString().split('T')[0];
    return { startOfWeek: fmt(start), endOfWeek: fmt(end) };
  }, []);

  const { data: todayData, loading: loadingToday } = useFetch('/shifts/my', {
    params: { date: todayStr, per_page: 1 },
  });

  const { data: weekData, loading: loadingWeek } = useFetch('/shifts/my', {
    params: { start_date: startOfWeek, end_date: endOfWeek, per_page: 50 },
  });

  const todayShift = Array.isArray(todayData?.data) ? todayData.data[0] : null;
  const weekShifts = Array.isArray(weekData?.data) ? weekData.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jadwal Saya</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Periode minggu ini</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today Card */}
        <Card>
          <CardHeader>
            <CardTitle>Shift Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingToday ? (
              <div className="animate-pulse space-y-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ) : todayShift ? (
              <div className="space-y-3">
                <div className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar size={16} /> {formatDate(todayShift.date)}
                </div>
                <div className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Clock size={16} /> {formatTime(todayShift.start_time)} - {formatTime(todayShift.end_time)}
                </div>
                <div className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <MapPin size={16} /> {todayShift.location || '-'}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded">
                <AlertCircle size={18} className="mt-0.5" />
                <div>
                  <div className="font-medium">Tidak ada shift hari ini.</div>
                  <div className="text-sm">Silakan hubungi admin untuk penjadwalan.</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Week Card */}
        <Card>
          <CardHeader>
            <CardTitle>Shift Minggu Ini</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingWeek ? (
              <div className="animate-pulse space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            ) : weekShifts.length === 0 ? (
              <div className="text-gray-500">Tidak ada jadwal shift dalam minggu ini.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tanggal</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Waktu</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Lokasi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {weekShifts.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatDate(s.date)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatTime(s.start_time)} - {formatTime(s.end_time)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">{s.location || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeShifts;
