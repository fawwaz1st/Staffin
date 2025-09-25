import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { User, Mail, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user, } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [loading, setLoading] = useState(false);

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/profile', form);
      toast.success('Profil berhasil diperbarui');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink font-display flex items-center gap-3">
          <div className="p-2 bg-coffee-50 rounded-xl">
            <User size={24} className="text-coffee" />
          </div>
          Profil Pengguna
        </h1>
        <p className="text-ink-light mt-2">Kelola informasi akun Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-coffee to-coffee-light flex items-center justify-center mb-4">
                <span className="text-white text-3xl font-bold">{user?.name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <h3 className="text-xl font-semibold text-ink mb-1">{user?.name}</h3>
              <p className="text-sm text-ink-light mb-2">{user?.email}</p>
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-coffee-50 text-coffee">
                {user?.role === 'admin' ? 'Administrator' : 'Karyawan'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} className="text-coffee" />
              Informasi Akun
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nama Lengkap"
                  icon={<User size={18} />}
                  type="text"
                  value={form.name}
                  onChange={(e) => onChange('name', e.target.value)}
                  required
                />
                <Input
                  label="Email"
                  icon={<Mail size={18} />}
                  type="email"
                  value={form.email}
                  onChange={(e) => onChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
