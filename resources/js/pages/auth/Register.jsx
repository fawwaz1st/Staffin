import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

function PasswordStrengthMeter({ password }) {
  const getStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const strength = getStrength();
  const strengthText = ['Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'][strength - 1] || '';
  const strengthColors = [
    'bg-pastel-red',
    'bg-pastel-yellow', 
    'bg-pastel-blue',
    'bg-pastel-green'
  ];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < strength ? strengthColors[strength - 1] : 'bg-cream-200'
            }`}
          />
        ))}
      </div>
      {strengthText && (
        <p className="text-xs text-ink-light font-medium">Kekuatan: {strengthText}</p>
      )}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'employee',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.password_confirmation) {
      setError('Konfirmasi password tidak cocok');
      toast.error('Konfirmasi password tidak cocok');
      setLoading(false);
      return;
    }

    const result = await register(formData);
    if (result.success) {
      setSuccess(result.message || 'Pendaftaran berhasil, menunggu persetujuan admin.');
      toast.success('Pendaftaran berhasil!');
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
      });
    } else {
      setError(result.message || 'Registrasi gagal');
      toast.error(result.message || 'Registrasi gagal');
    }

    setLoading(false);
  };

  return (
    <AuthLayout
      title={<span>Selamat Datang <span className="text-[#D9A979]">di Staffin</span></span>}
      subtitle="Daftar dan kelola tim Anda di Staffin"
    >
      {success && (
        <div className="rounded-2xl border border-[#CFE8D4] bg-[#F2FBF4] px-5 py-4 text-center shadow-[0_8px_24px_-18px_rgba(16,185,129,0.5)]">
          <p className="text-sm text-[#0E7A55] font-medium">{success}</p>
          <Link to="/login" className="mt-3 inline-flex text-sm font-semibold text-[#A6774D] hover:text-[#8B5937] transition-colors">
            Kembali ke Login
          </Link>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="inline-flex items-center gap-2 bg-[#F0E1CF] border border-[#E4D5C4] text-[#7A5D45] text-xs font-semibold uppercase tracking-[0.18em] px-3 py-1 rounded-full">
            Register
          </div>

          {error && (
            <div className="rounded-2xl border border-[#FCD9CF] bg-[#FFF1ED] px-4 py-3 text-sm text-[#A84A3A] shadow-[0_6px_18px_-12px_rgba(168,74,58,0.35)]">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              id="name"
              name="name"
              type="text"
              label="Nama Lengkap"
              icon={<User size={18} />}
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              icon={<Mail size={18} />}
              placeholder="nama@email.com"
              value={formData.email}
              onChange={handleChange}
              error={error && error.includes('email') ? error : ''}
              required
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              icon={<Lock size={18} />}
              placeholder="Min. 8 karakter, huruf besar & angka"
              value={formData.password}
              onChange={handleChange}
              error={error && error.includes('password') && !error.includes('konfirmasi') ? error : ''}
              minLength={8}
              required
            />
            <PasswordStrengthMeter password={formData.password} />

            <Input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              label="Konfirmasi Password"
              icon={<Shield size={18} />}
              placeholder="Ulangi password"
              value={formData.password_confirmation}
              onChange={handleChange}
              error={error && error.includes('konfirmasi') ? error : ''}
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-[#3C2A21] mb-2">
              Peran
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-2xl border border-[#E4D5C4] bg-white px-4 py-3 text-[#3C2A21] focus:outline-none focus:ring-4 focus:ring-[#EFDCC7] focus:border-[#A6774D] transition-all"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full bg-[#A6774D] hover:bg-[#8B5937] rounded-2xl text-base font-semibold shadow-[0_12px_35px_-18px_rgba(166,119,77,0.65)]"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </Button>

          <div className="text-center pt-6 border-top border-[#F1E0CA] border-t">
            <p className="text-sm text-[#7A675B]">
              Sudah punya akun?{' '}
              <Link 
                to="/login" 
                className="font-semibold text-[#A6774D] hover:text-[#8B5937] transition-colors"
              >
                Login disini
              </Link>
            </p>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
