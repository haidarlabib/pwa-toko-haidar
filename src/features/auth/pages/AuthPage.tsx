import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../stores/appStore';
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAppStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate clicks
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await login(loginIdentifier, loginPassword);
      if (res.success && res.role) {
        if (res.role === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/user/dashboard', { replace: true });
        }
      } else {
        setErrorMessage(res.error || 'Autentikasi gagal. Silakan periksa kembali email/username dan password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate clicks
    setErrorMessage('');
    setSuccessMessage('');

    if (registerPassword.length < 6) {
      setErrorMessage('Password minimal 6 karakter');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: registerName,
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
      });

      if (res.success) {
        if (res.requiresEmailConfirmation) {
          setSuccessMessage(
            res.message ||
              'Pendaftaran staf berhasil! Tautan konfirmasi telah dikirim ke email Anda. Silakan periksa inbox atau spam sebelum masuk.'
          );
          setMode('login');
          setLoginIdentifier(registerEmail);
          setRegisterPassword('');
          setRegisterConfirmPassword('');
        } else if (res.role) {
          navigate('/user/dashboard', { replace: true });
        } else {
          setSuccessMessage('Akun staf berhasil didaftarkan! Silakan masuk dengan akun Anda.');
          setMode('login');
          setLoginIdentifier(registerEmail);
        }
      } else {
        setErrorMessage(res.error || 'Pendaftaran gagal');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#121214] antialiased flex flex-col justify-between selection:bg-[#EAE6DD] font-sans">
      {/* Top Header */}
      <header className="px-5 sm:px-10 py-5 flex items-center justify-between max-w-5xl w-full mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-[#605D57] hover:text-[#121214] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-700" />
          <span className="text-[11px] font-mono font-medium tracking-tight text-[#605D57]">
            Sistem Haidar Plastik
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white border border-[#E5E2DA] rounded-xl shadow-xs p-6 sm:p-8 space-y-6">
          {/* Header Title */}
          <div className="space-y-1 text-center">
            <h1 className="text-xl font-bold tracking-tight text-[#121214]">
              {mode === 'login' ? 'Masuk ke Akun Anda' : 'Registrasi Staf Baru'}
            </h1>
            <p className="text-xs text-[#75726B]">
              {mode === 'login'
                ? 'Gunakan akun yang telah terdaftar pada sistem.'
                : 'Daftarkan identitas staf untuk mengakses operasional toko.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#F0EFE9] rounded-lg border border-[#E5E2DA] text-xs font-semibold">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-1.5 rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#121214] shadow-2xs font-bold'
                  : 'text-[#75726B] hover:text-[#121214]'
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setMode('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-1.5 rounded-md transition-all ${
                mode === 'register'
                  ? 'bg-white text-[#121214] shadow-2xs font-bold'
                  : 'text-[#75726B] hover:text-[#121214]'
              }`}
            >
              Daftar Staf
            </button>
          </div>

          {/* Success Notice */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-snug">{successMessage}</span>
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-red-50/80 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#33312E] block">
                  Email atau Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#85827B] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    disabled={loading}
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="email@haidar.com atau username"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-[#D5D2C9] focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all font-mono disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#33312E]">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#85827B] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    disabled={loading}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-[#D5D2C9] focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all font-mono disabled:opacity-60"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-md bg-[#121214] text-white text-xs font-bold hover:bg-[#2A2A2E] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 shadow-2xs cursor-pointer"
              >
                <span>{loading ? 'Memproses...' : 'Masuk ke Sistem'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#33312E] block">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="Nama staf operasional"
                  className="w-full px-3 py-2 text-xs rounded-md border border-[#D5D2C9] focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#33312E] block">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    disabled={loading}
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder="username"
                    className="w-full px-3 py-2 text-xs rounded-md border border-[#D5D2C9] focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all font-mono disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#33312E] block">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#85827B] absolute left-2.5 top-2.5" />
                    <input
                      type="email"
                      required
                      disabled={loading}
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="staf@gmail.com"
                      className="w-full pl-8 pr-2.5 py-2 text-xs rounded-md border border-[#D5D2C9] focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#33312E] block">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    disabled={loading}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3 py-2 text-xs rounded-md border border-[#D5D2C9] focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all font-mono disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#33312E] block">
                    Konfirmasi Password
                  </label>
                  <input
                    type="password"
                    required
                    disabled={loading}
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className="w-full px-3 py-2 text-xs rounded-md border border-[#D5D2C9] focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all font-mono disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#FAF9F5] border border-[#E5E2DA] text-[11px] text-[#605D57] leading-tight">
                <strong>Otorisasi Akses:</strong> Akun baru otomatis didaftarkan sebagai <em>Staf Operasional (USER)</em>.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-md bg-[#121214] text-white text-xs font-bold hover:bg-[#2A2A2E] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 shadow-2xs cursor-pointer"
              >
                <span>{loading ? 'Mendaftarkan...' : 'Daftar Akun Staf'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Security badge note */}
          <div className="pt-3 border-t border-[#EAE8E2] text-center">
            <div className="inline-flex items-center gap-1.5 text-[10px] text-[#75726B] font-mono">
              <Shield className="w-3 h-3 text-emerald-700" />
              <span>Otorisasi Terproteksi Row Level Security (RLS)</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-5 py-4 text-center text-[11px] text-[#85827B] font-mono">
        Haidar Plastik · Autentikasi Terenkripsi & Terotorisasi
      </footer>
    </div>
  );
};
