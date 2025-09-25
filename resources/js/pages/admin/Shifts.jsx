import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useFetch } from '@/hooks/useFetch';
import api from '@/api/axios';
import ShiftModal from '@/components/ShiftModal';
import { toast } from 'react-hot-toast';
import { 
    Plus, 
    Edit, 
    Trash2, 
    Search,
    Calendar,
    Clock,
    MapPin,
    Users,
    Filter,
    ChevronDown,
} from 'lucide-react';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Shifts = () => {
    const { user, loading: authLoading } = useAuth();
    const isAdmin = user?.role === 'admin';
    const isApprovedAdmin = isAdmin && user?.status === 'approved';

    const [showModal, setShowModal] = useState(false);
    const [editShift, setEditShift] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        date: '',
        start_date: '',
        end_date: '',
        status: '',
        user_id: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [shiftsPerPage] = useState(10);

    const { data: shiftsData, loading, error, refetch } = useFetch('/shifts', {
        params: {
            q: filters.search || undefined,
            date: filters.date || undefined,
            start_date: filters.start_date || undefined,
            end_date: filters.end_date || undefined,
            status: filters.status || undefined,
            user_id: filters.user_id || undefined,
            page: currentPage,
            per_page: shiftsPerPage
        },
        enabled: !authLoading && isApprovedAdmin
    });

    const { data: employees } = useFetch('/users?role=employee', {
        enabled: !authLoading && isApprovedAdmin
    });

    const shifts = shiftsData?.data || [];
    const pagination = shiftsData?.meta || {};

    const handleCreateShift = () => {
        setEditShift(null);
        setShowModal(true);
    };

    const handleEditShift = (shift) => {
        setEditShift(shift);
        setShowModal(true);
    };

    const handleDeleteShift = async (shiftId) => {
        if (!confirm('Apakah Anda yakin ingin menghapus shift ini?')) {
            return;
        }

        try {
            await api.delete(`/shifts/${shiftId}`);
            toast.success('Shift berhasil dihapus');
            refetch();
        } catch (error) {
            toast.error('Gagal menghapus shift');
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setFilters({
            search: '',
            date: '',
            start_date: '',
            end_date: '',
            status: '',
            user_id: ''
        });
        setCurrentPage(1);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            open: { bg: 'bg-pastel-blue bg-opacity-20 text-blue-700', text: 'Terbuka' },
            assigned: { bg: 'bg-pastel-green bg-opacity-20 text-green-700', text: 'Ditugaskan' },
            completed: { bg: 'bg-cream-300 text-ink-light', text: 'Selesai' },
        };

        const config = statusConfig[status] || statusConfig.open;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg}`}>
                {config.text}
            </span>
        );
    };

    const formatTime = (time) => {
        return time ? time.substring(0, 5) : '';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (!authLoading && !isApprovedAdmin) {
        const title = isAdmin ? 'Akun Admin Belum Aktif' : 'Akses Terbatas';
        const description = isAdmin
            ? 'Silakan hubungi super admin untuk menyetujui akun Anda sebelum mengelola shift.'
            : 'Manajemen shift hanya tersedia untuk administrator.';

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

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-ink font-display flex items-center gap-3">
                            <div className="p-2 bg-coffee-50 rounded-xl">
                                <Calendar size={24} className="text-coffee" />
                            </div>
                            Manajemen Shift
                        </h1>
                        <p className="text-ink-light mt-2">Kelola jadwal dan shift karyawan</p>
                    </div>
                    <Button onClick={handleCreateShift} variant="primary">
                        <Plus size={18} />
                        Tambah Shift
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter size={18} className="text-coffee" />
                        Filter & Pencarian
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="rounded-2xl border border-divider/25 bg-card/80 px-4 py-5 backdrop-blur-sm">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                            <div className="relative">
                                <label className="mb-2 block text-sm font-medium text-ink">Pencarian</label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                    <input
                                        type="text"
                                        placeholder="Cari karyawan atau lokasi..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full rounded-2xl border border-transparent bg-soft/70 px-10 py-2.5 text-sm text-primary placeholder:text-muted shadow-soft transition-all focus:border-coffee focus:outline-none focus:ring-2 focus:ring-coffee/20"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-ink">Tanggal</label>
                                <input
                                    type="date"
                                    value={filters.date}
                                    onChange={(e) => handleFilterChange('date', e.target.value)}
                                    className="w-full rounded-2xl border border-transparent bg-soft/70 px-4 py-2.5 text-sm text-primary shadow-soft transition-all focus:border-coffee focus:outline-none focus:ring-2 focus:ring-coffee/20"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-ink">Tgl Mulai</label>
                                <input
                                    type="date"
                                    value={filters.start_date}
                                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                    className="w-full rounded-2xl border border-transparent bg-soft/70 px-4 py-2.5 text-sm text-primary shadow-soft transition-all focus:border-coffee focus:outline-none focus:ring-2 focus:ring-coffee/20"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-ink">Tgl Selesai</label>
                                <input
                                    type="date"
                                    value={filters.end_date}
                                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                    className="w-full rounded-2xl border border-transparent bg-soft/70 px-4 py-2.5 text-sm text-primary shadow-soft transition-all focus:border-coffee focus:outline-none focus:ring-2 focus:ring-coffee/20"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-ink">Status</label>
                                <div className="relative">
                                    <select
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="w-full appearance-none rounded-2xl border border-transparent bg-soft/70 px-4 py-2.5 pr-12 text-sm text-primary shadow-soft transition-all focus:border-coffee focus:outline-none focus:ring-2 focus:ring-coffee/20"
                                    >
                                        <option value="">Semua Status</option>
                                        <option value="open">Terbuka</option>
                                        <option value="assigned">Ditugaskan</option>
                                        <option value="completed">Selesai</option>
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-ink">Karyawan</label>
                                <div className="relative">
                                    <select
                                        value={filters.user_id}
                                        onChange={(e) => handleFilterChange('user_id', e.target.value)}
                                        className="w-full appearance-none rounded-2xl border border-transparent bg-soft/70 px-4 py-2.5 pr-12 text-sm text-primary shadow-soft transition-all focus:border-coffee focus:outline-none focus:ring-2 focus:ring-coffee/20"
                                    >
                                        <option value="">Semua Karyawan</option>
                                        {employees?.map(employee => (
                                            <option key={employee.id} value={employee.id}>
                                                {employee.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            onClick={resetFilters}
                            className="rounded-xl border-coffee/40 px-5 py-2 text-coffee transition-all hover:bg-coffee/10 hover:text-coffee-dark"
                        >
                            Reset Filter
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Shifts Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6">
                            <div className="animate-pulse space-y-3">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-12 bg-cream-200 rounded-xl"></div>
                                ))}
                            </div>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-pastel-red">
                            Error: {String(error)}
                        </div>
                    ) : shifts.length === 0 ? (
                        <div className="p-16 text-center">
                            <Calendar size={48} className="mx-auto mb-4 text-cream-300" />
                            <p className="text-ink-light mb-4">Belum ada shift</p>
                            <p className="text-sm text-ink-lighter">Klik tombol "Tambah Shift" untuk membuat jadwal baru</p>
                            <Button onClick={handleCreateShift} className="inline-flex items-center gap-2">
                                <Plus size={16} /> Tambah Shift
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-cream-50 border-b border-cream-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-ink uppercase tracking-wider">
                                            Tanggal
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-ink uppercase tracking-wider">
                                            Karyawan
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-ink uppercase tracking-wider">
                                            Waktu
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-ink uppercase tracking-wider">
                                            Lokasi
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-ink uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-ink uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-cream-100">
                                    {shifts.map((shift) => (
                                        <tr key={shift.id} className="hover:bg-cream-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Calendar size={16} className="text-coffee-light mr-2" />
                                                    <div className="text-sm font-medium text-ink">
                                                        {formatDate(shift.date)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Users size={16} className="text-coffee-light mr-2" />
                                                    <div className="text-sm text-ink-light">
                                                        {shift.user ? shift.user.name : 'Belum ditugaskan'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Clock size={16} className="text-coffee-light mr-2" />
                                                    <div className="text-sm text-ink-light">
                                                        {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <MapPin size={16} className="text-coffee-light mr-2" />
                                                    <div className="text-sm text-ink-light">
                                                        {shift.location}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(shift.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleEditShift(shift)}
                                                        className="p-2 rounded-lg hover:bg-cream-200 text-coffee transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteShift(shift.id)}
                                                        className="p-2 rounded-lg hover:bg-pastel-red hover:bg-opacity-20 text-pastel-red transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Menampilkan {pagination.from || 0} sampai {pagination.to || 0} dari {pagination.total || 0} data
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Sebelumnya
                                    </Button>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {currentPage} dari {pagination.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.last_page))}
                                        disabled={currentPage === pagination.last_page}
                                    >
                                        Selanjutnya
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal will be implemented separately */}
            {showModal && (
                <ShiftModal
                    shift={editShift}
                    employees={employees}
                    onClose={() => setShowModal(false)}
                    onSave={() => {
                        setShowModal(false);
                        refetch();
                    }}
                />
            )}
        </div>
    );
};


export default Shifts;
