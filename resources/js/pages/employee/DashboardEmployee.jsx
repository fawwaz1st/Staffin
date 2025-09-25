import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import { 
    Clock, 
    Calendar, 
    DollarSign, 
    TrendingUp, 
    LogIn,
    LogOut,
    CheckCircle,
    XCircle,
    AlertCircle,
    Award
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardEmployee = () => {
    const [summary] = useState({
        today_shift: {
            start_time: '09:00',
            end_time: '17:00',
            location: 'Kantor Pusat'
        },
        today_attendance: {
            status: 'present',
            clock_in: '08:55',
            clock_out: null,
            working_hours: 4.5
        },
        monthly_salary: 5000000,
        performance_score: 85,
        present_days: 18,
        absent_days: 2,
        total_hours: 144,
        attendance_rate: 90,
        can_clock_in: false,
        can_clock_out: true
    });

    const [monthlyData] = useState([
        { date: '1 Des', hadir: 8, target: 8 },
        { date: '5 Des', hadir: 7.5, target: 8 },
        { date: '10 Des', hadir: 8, target: 8 },
        { date: '15 Des', hadir: 8.5, target: 8 },
        { date: '20 Des', hadir: 7, target: 8 },
        { date: '23 Des', hadir: 8, target: 8 },
    ]);

    const formatTime = (time) => {
        if (!time) return '-';
        return new Date(`2000-01-01 ${time}`).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present':
                return <CheckCircle className="h-4 w-4 text-pastel-green" />;
            case 'absent':
                return <XCircle className="h-4 w-4 text-pastel-red" />;
            case 'leave':
                return <AlertCircle className="h-4 w-4 text-pastel-yellow" />;
            default:
                return <Clock className="h-4 w-4 text-ink-lighter" />;
        }
    };


    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-ink font-display">
                    Dashboard Karyawan
                </h1>
                <p className="text-ink-light mt-2">
                    Selamat datang! Berikut adalah informasi kehadiran dan aktivitas Anda.
                </p>
            </div>

            {/* Quick Actions & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Shift & Attendance */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar size={20} className="text-coffee" />
                            Shift Hari Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {summary?.today_shift ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-pastel-blue bg-opacity-20 rounded-2xl">
                                    <div>
                                        <p className="text-sm font-medium text-ink">
                                            Jadwal: {formatTime(summary.today_shift.start_time)} - {formatTime(summary.today_shift.end_time)}
                                        </p>
                                        <p className="text-sm text-ink-light">
                                            Lokasi: {summary.today_shift.location}
                                        </p>
                                    </div>
                                </div>

                                {summary.today_attendance && (
                                    <div className="flex items-center justify-between p-4 bg-cream-200 rounded-2xl">
                                        <div className="flex items-center space-x-3">
                                            {getStatusIcon(summary.today_attendance.status)}
                                            <div>
                                                <p className="text-sm font-medium text-ink">
                                                    Status Kehadiran
                                                </p>
                                                <p className="text-sm text-ink-light">
                                                    Clock In: {formatTime(summary.today_attendance.clock_in)} | 
                                                    Clock Out: {formatTime(summary.today_attendance.clock_out)}
                                                </p>
                                            </div>
                                        </div>
                                        {summary.today_attendance.working_hours && (
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-ink">
                                                    {summary.today_attendance.working_hours} jam
                                                </p>
                                                <p className="text-xs text-ink-lighter">
                                                    Jam kerja
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Button 
                                        variant="primary"
                                        className="flex-1"
                                        disabled={!summary.can_clock_in}
                                    >
                                        <LogIn size={16} />
                                        Clock In
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="flex-1"
                                        disabled={!summary.can_clock_out}
                                    >
                                        <LogOut size={16} />
                                        Clock Out
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-ink-light">
                                <Calendar size={48} className="mx-auto mb-4 text-cream-300" />
                                <p>Tidak ada shift hari ini</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="space-y-4">
                    <StatCard
                        title="Payroll Bulan Ini"
                        value={`Rp ${(summary?.monthly_salary || 0).toLocaleString('id-ID')}`}
                        icon={DollarSign}
                        color="green"
                    />
                    <StatCard
                        title="Performance Score"
                        value={`${summary?.performance_score || 0}/100`}
                        trendValue="Berdasarkan kehadiran"
                        icon={Award}
                        color="yellow"
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Hari Hadir"
                    value={summary?.present_days || 0}
                    trendValue="Bulan ini"
                    icon={CheckCircle}
                    color="green"
                    trend="up"
                />
                <StatCard
                    title="Hari Tidak Hadir"
                    value={summary?.absent_days || 0}
                    trendValue="Bulan ini"
                    icon={XCircle}
                    color="red"
                />
                <StatCard
                    title="Total Jam Kerja"
                    value={`${summary?.total_hours || 0}h`}
                    trendValue="Bulan ini"
                    icon={Clock}
                    color="blue"
                    trend="up"
                />
                <StatCard
                    title="Tingkat Kehadiran"
                    value={`${summary?.attendance_rate || 0}%`}
                    trendValue="Bulan ini"
                    icon={TrendingUp}
                    color="coffee"
                    trend="up"
                />
            </div>

            {/* Monthly Attendance Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar size={20} className="text-coffee" />
                        Ringkasan Kehadiran Bulanan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={monthlyData}>
                            <defs>
                                <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#B8E6B8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#B8E6B8" stopOpacity={0.1}/>
                                </linearGradient>
                                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#B8D4FF" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#B8D4FF" stopOpacity={0.1}/>
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
                                name="Jam Kerja"
                            />
                            <Area
                                type="monotone" 
                                dataKey="target" 
                                stroke="#B8D4FF" 
                                fillOpacity={1}
                                fill="url(#colorTarget)"
                                strokeWidth={2}
                                name="Target"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardEmployee;
