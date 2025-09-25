import { useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';

export default function ResetPassword() {
  const { token } = useParams();
  const [search] = useSearchParams();
  const emailQuery = search.get('email') || '';
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [form, setForm] = useState({
    email: emailQuery,
    password: '',
    password_confirmation: '',
    token,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (form.password.length < 8) {
      setError('Password minimal 8 karakter.');
      setLoading(false);
      return;
    }
    if (form.password !== form.password_confirmation) {
      setError('Konfirmasi password tidak cocok.');
      setLoading(false);
      return;
    }

    const res = await resetPassword(form);
    if (res.success) {
      toast.success('Password berhasil direset');
      setMessage(res.message || 'Password berhasil direset');
      setTimeout(() => navigate('/login', { replace: true }), 800);
    } else {
      toast.error(res.message || 'Gagal reset password');
      setError(res.message || 'Gagal reset password');
    }
    setLoading(false);
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Masukkan password baru Anda">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
      )}
      {message && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">{message}</div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink-600 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-[#EAD8C6] bg-white px-3 py-2 text-ink-600 placeholder-[#BDA793] focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
            value={form.email}
            onChange={onChange}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink-600 mb-1">
            Password Baru
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-xl border border-[#EAD8C6] bg-white px-3 py-2 text-ink-600 placeholder-[#BDA793] focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
            placeholder="Minimal 8 karakter"
            value={form.password}
            onChange={onChange}
          />
        </div>

        <div>
          <label htmlFor="password_confirmation" className="block text-sm font-medium text-ink-600 mb-1">
            Konfirmasi Password
          </label>
          <input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            required
            className="w-full rounded-xl border border-[#EAD8C6] bg-white px-3 py-2 text-ink-600 placeholder-[#BDA793] focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
            value={form.password_confirmation}
            onChange={onChange}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-coffee-500 hover:bg-coffee-600 active:scale-[.99] text-white font-semibold px-4 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          <span>{loading ? 'Memproses...' : 'Simpan Password Baru'}</span>
        </button>

        <div className="text-center text-sm text-ink-600">
          Kembali ke{' '}
          <Link to="/login" className="text-coffee-600 hover:text-coffee-500 font-medium">
            Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
