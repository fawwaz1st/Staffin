import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const res = await forgotPassword({ email });
    if (res.success) {
      setMessage(res.message || 'Tautan reset dikirim ke email');
      toast.success('Tautan reset dikirim');
    } else {
      setError(res.message || 'Gagal mengirim tautan reset');
      toast.error(res.message || 'Gagal mengirim tautan reset');
    }

    setLoading(false);
  };

  return (
    <AuthLayout title="Lupa Password" subtitle="Kami akan mengirimkan tautan reset ke email Anda">
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
            type="email"
            required
            className="w-full rounded-xl border border-[#EAD8C6] bg-white px-3 py-2 text-ink-600 placeholder-[#BDA793] focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-coffee-500 hover:bg-coffee-600 active:scale-[.99] text-white font-semibold px-4 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          <span>{loading ? 'Mengirim...' : 'Kirim Tautan Reset'}</span>
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
