import React from 'react';

export default function AttendanceTable({
  rows = [],
  loading = false,
  isAdmin = false,
}) {
  const formatTime = (time) => {
    if (!time) return '-';
    return new Date(`2000-01-01 ${time}`).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      hadir: { bg: 'bg-pastel-green bg-opacity-25 text-green-700 dark:text-green-300', text: 'Hadir' },
      telat: { bg: 'bg-warning-100 bg-opacity-30 text-warning-700 dark:text-warning-300', text: 'Telat' },
      izin: { bg: 'bg-pastel-blue bg-opacity-25 text-blue-700 dark:text-blue-300', text: 'Izin' },
      sakit: { bg: 'bg-secondary-200 bg-opacity-25 text-secondary-600 dark:text-secondary-300', text: 'Sakit' },
      alfa: { bg: 'bg-pastel-red bg-opacity-25 text-red-700 dark:text-red-300', text: 'Alfa' },
    };
    const cfg = statusConfig[status] || { bg: 'bg-soft text-secondary', text: status || '-' };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg}`}>
        {cfg.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse h-10 bg-soft rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Tidak ada data absensi.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-soft border-b border-divider/60">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Tanggal</th>
            {isAdmin && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Karyawan</th>
            )}
            <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Shift</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Clock In</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Clock Out</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Catatan</th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-divider/40">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-soft transition-colors">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-primary">{formatDate(row.date)}</td>
              {isAdmin && (
                <td className="px-4 py-3 whitespace-nowrap text-sm text-primary">{row.user?.name || '-'}</td>
              )}
              <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary">
                {row.shift ? `${row.shift.start_time} - ${row.shift.end_time}` : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary">{formatTime(row.clock_in)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary">{formatTime(row.clock_out)}</td>
              <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(row.status)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary">{row.notes || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
