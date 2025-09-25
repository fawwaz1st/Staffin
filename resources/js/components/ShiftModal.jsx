import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import api from '@/api/axios';
import { toast } from 'react-hot-toast';
import { X, Calendar, Clock, MapPin, User, FileText } from 'lucide-react';

const ShiftModal = ({ shift, employees, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        user_id: '',
        date: '',
        start_time: '',
        end_time: '',
        status: 'open',
        location: '',
        notes: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [availableEmployees, setAvailableEmployees] = useState([]);

    // Initialize form data
    useEffect(() => {
        if (shift) {
            setFormData({
                user_id: shift.user_id || '',
                date: shift.date || '',
                start_time: shift.start_time || '',
                end_time: shift.end_time || '',
                status: shift.status || 'open',
                location: shift.location || '',
                notes: shift.notes || ''
            });
        } else {
            // Set default values for new shift
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setFormData(prev => ({
                ...prev,
                date: tomorrow.toISOString().split('T')[0],
                start_time: '09:00',
                end_time: '17:00'
            }));
        }
    }, [shift]);

    // Fetch available employees when date changes
    useEffect(() => {
        if (formData.date) {
            fetchAvailableEmployees();
        }
    }, [formData.date]);

    const fetchAvailableEmployees = async () => {
        try {
            const response = await api.get('/shifts/available-employees', {
                params: { date: formData.date }
            });
            setAvailableEmployees(response.data.data || []);
        } catch (error) {
            console.error('Error fetching available employees:', error);
            setAvailableEmployees(employees || []);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!formData.date) {
            newErrors.date = 'Tanggal wajib diisi';
        }
        if (!formData.start_time) {
            newErrors.start_time = 'Waktu mulai wajib diisi';
        }
        if (!formData.end_time) {
            newErrors.end_time = 'Waktu selesai wajib diisi';
        }
        if (!formData.location) {
            newErrors.location = 'Lokasi wajib diisi';
        }

        // Date validation - can't be in the past (except for editing existing shifts)
        if (formData.date && !shift) {
            const selectedDate = new Date(formData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                newErrors.date = 'Tanggal tidak boleh di masa lalu';
            }
        }

        // Time validation
        if (formData.start_time && formData.end_time) {
            if (formData.start_time >= formData.end_time) {
                newErrors.end_time = 'Waktu selesai harus lebih besar dari waktu mulai';
            }
        }

        // Employee assignment validation
        if (formData.user_id && formData.status === 'assigned') {
            const isEmployeeAvailable = availableEmployees.some(emp => emp.id.toString() === formData.user_id.toString());
            if (!isEmployeeAvailable && !shift) {
                newErrors.user_id = 'Karyawan tidak tersedia pada tanggal ini';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }

        // Auto-update status based on user assignment
        if (field === 'user_id') {
            setFormData(prev => ({
                ...prev,
                status: value ? 'assigned' : 'open'
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        
        try {
            const payload = {
                ...formData,
                user_id: formData.user_id || null
            };

            if (shift) {
                await api.put(`/shifts/${shift.id}`, payload);
                toast.success('Shift berhasil diperbarui');
            } else {
                await api.post('/shifts', payload);
                toast.success('Shift berhasil ditambahkan');
            }
            
            onSave();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Terjadi kesalahan';
            const fieldErrors = error.response?.data?.errors || {};
            
            setErrors(fieldErrors);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {shift ? 'Edit Shift' : 'Tambah Shift Baru'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <Calendar size={16} className="inline mr-2" />
                            Tanggal
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleInputChange('date', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                                errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                        />
                        {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                    </div>

                    {/* Employee Assignment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <User size={16} className="inline mr-2" />
                            Karyawan (Opsional)
                        </label>
                        <select
                            value={formData.user_id}
                            onChange={(e) => handleInputChange('user_id', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                                errors.user_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                        >
                            <option value="">Pilih Karyawan (Shift Terbuka)</option>
                            {availableEmployees.map(employee => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.name}
                                </option>
                            ))}
                        </select>
                        {errors.user_id && <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>}
                        {formData.date && availableEmployees.length === 0 && (
                            <p className="mt-1 text-sm text-yellow-600">
                                Tidak ada karyawan yang tersedia pada tanggal ini
                            </p>
                        )}
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <Clock size={16} className="inline mr-2" />
                                Waktu Mulai
                            </label>
                            <input
                                type="time"
                                value={formData.start_time}
                                onChange={(e) => handleInputChange('start_time', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                                    errors.start_time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                            />
                            {errors.start_time && <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Waktu Selesai
                            </label>
                            <input
                                type="time"
                                value={formData.end_time}
                                onChange={(e) => handleInputChange('end_time', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                                    errors.end_time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                            />
                            {errors.end_time && <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>}
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <MapPin size={16} className="inline mr-2" />
                            Lokasi
                        </label>
                        <select
                            value={formData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                                errors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                        >
                            <option value="">Pilih Lokasi</option>
                            <option value="Office A">Office A</option>
                            <option value="Office B">Office B</option>
                            <option value="Remote">Remote</option>
                            <option value="Store">Store</option>
                            <option value="Client Site">Client Site</option>
                        </select>
                        {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="open">Terbuka</option>
                            <option value="assigned">Ditugaskan</option>
                            <option value="completed">Selesai</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <FileText size={16} className="inline mr-2" />
                            Catatan (Opsional)
                        </label>
                        <textarea
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder="Tambahkan catatan untuk shift ini..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex items-center"
                        >
                            {loading && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            )}
                            {shift ? 'Perbarui' : 'Tambah'} Shift
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShiftModal;
