import { createContext, useContext, useState, useEffect } from 'react';
import api, { web } from '../api/axios';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Helper: tentukan redirect dashboard sesuai role
  const redirectPathFor = (role) => (role === 'admin' ? '/dashboard/admin' : '/dashboard/employee');

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Coba ambil sesi yang ada
        const response = await api.get('me');
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      // Dapatkan CSRF cookie, lalu login sesi
      await web.get('/sanctum/csrf-cookie');
      const response = await web.post('/session/login', credentials);
      const { user: userData } = response.data;
      setUser(userData);
      return { success: true, redirectTo: redirectPathFor(userData.role) };
    } catch (error) {
      const msg =
        error.response?.data?.errors?.email?.[0] ||
        error.response?.data?.message ||
        'Login gagal';
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      await web.get('/sanctum/csrf-cookie');
      const response = await web.post('/session/register', userData);
      const { user: newUser } = response.data;
      // Tidak auto-login; user menunggu approval admin
      return { success: true, message: response.data?.message, user: newUser };
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.errors?.email?.[0] ||
        error.response?.data?.errors?.password?.[0] ||
        'Registrasi gagal';
      return { success: false, message: errMsg };
    }
  };

  // Kirim email reset password
  const forgotPassword = async ({ email }) => {
    try {
      await web.get('/sanctum/csrf-cookie');
      const res = await web.post('/password/forgot', { email });
      return { success: true, message: res.data?.message || 'Tautan reset dikirim' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal mengirim tautan reset',
      };
    }
  };

  // Reset password menggunakan token dari email
  const resetPassword = async (payload) => {
    try {
      await web.get('/sanctum/csrf-cookie');
      const res = await web.post('/password/reset', payload);
      return { success: true, message: res.data?.message || 'Password berhasil direset' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal reset password',
        errors: error.response?.data?.errors,
      };
    }
  };

  const logout = async () => {
    try {
      await web.get('/sanctum/csrf-cookie');
      await web.post('/session/logout');
    } catch (error) {
      // Handle logout error silently
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    redirectPathFor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
