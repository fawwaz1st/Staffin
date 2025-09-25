import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useFetch } from '@/hooks/useFetch';
import api from '@/api/axios';
import { toast } from 'react-hot-toast';
import ClockButton from '@/components/ClockButton';
import useDebounce from '@/hooks/useDebounce';
import { 
    Clock, 
    LogIn, 
    LogOut, 
    Calendar, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    FileText,
    BarChart3
} from 'lucide-react';

const Attendance = () => {
    const [todayStatus, setTodayStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [rows, setRows] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
    const [loadingMore, setLoadingMore] = useState(false);
    const [filters, setFilters] = useState({ start_date: '', end_date: '' });
    const debounced = useDebounce(filters, 400);
    
    const { data: monthlyStats, refetch: refetchStats } = useFetch('/attendances/monthly-stats');

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Fetch today's status
    const fetchTodayStatus = async () => {
        try {
            const response = await api.get('/attendances/today-status');
            setTodayStatus(response.data);
        } catch (error) {
            console.error('Error fetching today status:', error);
        }
    };

    useEffect(() => {
        fetchTodayStatus();
    }, []);

    // Fetch history helpers
    const fetchHistory = async (page = 1) => {
        const params = new URLSearchParams();
        if (debounced.start_date) params.set('start_date', debounced.start_date);
        if (debounced.end_date) params.set('end_date', debounced.end_date);
        params.set('page', String(page));
        params.set('per_page', '7');

        const { data } = await api.get(`/attendance/me?${params.toString()}`);
        if (page === 1) {
            setRows(data.data || []);
        } else {
            setRows((prev) => [...prev, ...(data.data || [])]);
        }
        setMeta({ current_page: data.current_page, last_page: data.last_page });
    };

    const reloadHistory = async () => {
        await fetchHistory(1);
    };

    const loadMore = async () => {
        if ((meta.current_page || 1) >= (meta.last_page || 1)) return;
        setLoadingMore(true);
        try {
            await fetchHistory((meta.current_page || 1) + 1);
        } finally {
            setLoadingMore(false);
        }
    };

    // Initial load and when filters change (debounced)
    useEffect(() => {
        reloadHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounced.start_date, debounced.end_date]);

    // Non-auto infinite scroll: hanya via tombol "Muat lebih banyak"

    const handleClockIn = async () => {
        if (!todayStatus?.can_clock_in) {
            toast.error('Anda tidak dapat clock-in saat ini');
            return;
        }

        setLoading(true);
        try {
            await api.post('/attendance/clock-in');
            toast.success('Clock-in berhasil!');
            fetchTodayStatus();
            reloadHistory();
            refetchStats();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Gagal clock-in';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClockOut = async () => {
        if (!todayStatus?.can_clock_out) {
            toast.error('Anda tidak dapat clock-out saat ini');
            return;
        }

        setLoading(true);
        try {
            await api.post('/attendance/clock-out');
            toast.success('Clock-out berhasil!');
            fetchTodayStatus();
            reloadHistory();
            refetchStats();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Gagal clock-out';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (time) => {
        if (!time) return '-';
        return new Date(`2000-01-01 ${time}`).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            hadir: { bg: 'bg-green-100 text-green-800', text: 'Hadir', icon: <CheckCircle size={14} /> },
            telat: { bg: 'bg-yellow-100 text-yellow-800', text: 'Telat', icon: <AlertCircle size={14} /> },
            izin: { bg: 'bg-blue-100 text-blue-800', text: 'Izin', icon: <AlertCircle size={14} /> },
            sakit: { bg: 'bg-purple-100 text-purple-800', text: 'Sakit', icon: <AlertCircle size={14} /> },
            alfa: { bg: 'bg-red-100 text-red-800', text: 'Alfa', icon: <XCircle size={14} /> },
            belum: { bg: 'bg-gray-100 text-gray-800', text: 'Belum Absen', icon: <Clock size={14} /> },
        };

        const config = statusConfig[status] || statusConfig.belum;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg}`}>
                {config.icon}
                {config.text}
            </span>
        );
    };

    const getCurrentDateTime = () => {
        return currentTime.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Kehadiran Karyawan
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {getCurrentDateTime()}
                </p>
            </div>

            {/* Today's Attendance Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock size={20} />
                            Status Kehadiran Hari Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {todayStatus ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                                    {getStatusBadge(todayStatus.status)}
                                </div>

                                {todayStatus.clock_in && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Clock In:</span>
                                        <span className="font-medium text-green-600">
                                            {formatTime(todayStatus.clock_in)}
                                        </span>
                                    </div>
                                )}

                                {todayStatus.clock_out && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Clock Out:</span>
                                        <span className="font-medium text-red-600">
                                            {formatTime(todayStatus.clock_out)}
                                        </span>
                                    </div>
                                )}

                                {todayStatus.working_hours && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Jam Kerja:</span>
                                        <span className="font-medium text-blue-600">
                                            {todayStatus.working_hours} jam
                                        </span>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <ClockButton
                                        onClick={handleClockIn}
                                        disabled={!todayStatus.can_clock_in}
                                        loading={loading}
                                        className="flex-1"
                                        icon={LogIn}
                                        variant={todayStatus.can_clock_in ? 'default' : 'outline'}
                                    >
                                        Clock In
                                    </ClockButton>
                                    <ClockButton
                                        onClick={handleClockOut}
                                        disabled={!todayStatus.can_clock_out}
                                        loading={loading}
                                        className="flex-1"
                                        icon={LogOut}
                                        variant={todayStatus.can_clock_out ? 'destructive' : 'outline'}
                                    >
                                        Clock Out
                                    </ClockButton>
                                </div>

                                {todayStatus.message && (
                                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                                        <FileText size={14} className="inline mr-2" />
                                        {todayStatus.message}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                Memuat status kehadiran...
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Monthly Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 size={20} />
                            Statistik Bulan Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {monthlyStats ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Hari Kerja:</span>
                                    <span className="font-semibold">{monthlyStats.working_days}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Hari Hadir:</span>
                                    <span className="font-semibold text-green-600">{monthlyStats.present_days}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Hari Tidak Hadir:</span>
                                    <span className="font-semibold text-red-600">{monthlyStats.absent_days}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Hari Cuti:</span>
                                    <span className="font-semibold text-yellow-600">{monthlyStats.leave_days}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Tingkat Kehadiran:</span>
                                    <span className="font-semibold text-blue-600">{monthlyStats.attendance_rate}%</span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Jam Kerja:</span>
                                    <span className="font-semibold">{monthlyStats.total_working_hours} jam</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                Memuat statistik...
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Attendance History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar size={20} />
                        Riwayat Kehadiran
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Tanggal Mulai</label>
                            <input type="date" value={filters.start_date} onChange={(e) => setFilters((p) => ({...p, start_date: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Tanggal Selesai</label>
                            <input type="date" value={filters.end_date} onChange={(e) => setFilters((p) => ({...p, end_date: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                    </div>

                    {rows && rows.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Clock In</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Clock Out</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jam Kerja</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {rows.map((attendance) => (
                                        <tr key={attendance.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatDate(attendance.date)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap">{getStatusBadge(attendance.status)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatTime(attendance.clock_in)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatTime(attendance.clock_out)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{attendance.working_hours ? `${attendance.working_hours} jam` : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Sentinel dihapus: tidak ada auto-infinite scroll */}
                            <div className="flex justify-center py-4">
                                <Button variant="outline" onClick={() => loadMore()} disabled={loadingMore || (meta.current_page || 1) >= (meta.last_page || 1)}>
                                    {loadingMore ? 'Memuat...' : ((meta.current_page || 1) < (meta.last_page || 1) ? 'Muat lebih banyak' : 'Sudah semua')}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                            <p>Belum ada riwayat kehadiran</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Attendance;
