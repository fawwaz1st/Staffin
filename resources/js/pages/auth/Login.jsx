import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);
    if (result.success) {
      toast.success('Login berhasil!');
      const to = location.state?.from?.pathname || result.redirectTo || '/';
      setTimeout(() => navigate(to, { replace: true }), 500);
    } else {
      setError(result.message || 'Email atau password salah');
      toast.error(result.message || 'Email atau password salah');
    }

    setLoading(false);
  };

  return (
    <AuthLayout
      title={<span>Selamat Datang <span className="text-[#D9A979]">di Staffin</span></span>}
      subtitle="Kelola karyawan dan shift dengan mudah setiap hari"
    >
      <form onSubmit={handleSubmit} className="space-y-7">
        {error && (
          <div className="rounded-2xl border border-[#FCD9CF] bg-[#FFF1ED] px-4 py-3 text-sm text-[#A84A3A] shadow-[0_6px_18px_-12px_rgba(168,74,58,0.35)]">
            {error}
          </div>
        )}

        <div className="inline-flex items-center gap-2 bg-[#F0E1CF] border border-[#E4D5C4] text-[#7A5D45] text-xs font-semibold uppercase tracking-[0.18em] px-3 py-1 rounded-full">
          Login
        </div>

        <div className="space-y-4">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            icon={<Mail size={18} />}
            placeholder="nama@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            icon={<Lock size={18} />}
            placeholder="Minimal 8 karakter"
            value={formData.password}
            onChange={handleChange}
            minLength={8}
            required
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center cursor-pointer">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="w-4 h-4 text-[#A6774D] bg-white border-2 border-[#E4D5C4] rounded-md focus:ring-[#D9A979] focus:ring-2 focus:ring-opacity-50 transition-all"
              checked={formData.remember}
              onChange={handleChange}
            />
            <span className="ml-2 text-sm text-[#746151]">Ingat saya</span>
          </label>

          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-[#A6774D] hover:text-[#8B5937] transition-colors"
          >
            Lupa Password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full bg-[#A6774D] hover:bg-[#8B5937] rounded-2xl text-base font-semibold shadow-[0_12px_35px_-18px_rgba(166,119,77,0.65)]"
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Sedang Masuk...' : 'Login'}
        </Button>

        <div className="text-center pt-6 border-t border-[#F1E0CA]">
          <p className="text-sm text-[#7A675B]">
            Belum punya akun?{' '}
            <Link 
              to="/register" 
              className="font-semibold text-[#A6774D] hover:text-[#8B5937] transition-colors"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
