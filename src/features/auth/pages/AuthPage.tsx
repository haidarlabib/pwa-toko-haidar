import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../stores/appStore';
import {
  Lock,
  ArrowRight,
  ArrowLeft,
  Mail,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAppStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
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
        setErrorMessage(res.error || 'Username/email atau password salah');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
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
          className="flex items-center gap-1.5 text-xs text-[#605D57] hover:text-[#121214] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Haidar Plastik"
            className="w-5 h-5 object-contain rounded-xs"
          />
          <span className="text-[11px] font-mono font-medium tracking-tight text-[#605D57]">
            Haidar Plastik
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white border border-[#E5E2DA] rounded-2xl shadow-xs p-6 sm:p-8 space-y-6">
          {/* Header Title */}
          <div className="space-y-2 text-center">
            <div className="flex justify-center pb-1">
              <img
                src="/logo.png"
                alt="Haidar Plastik"
                className="w-12 h-12 object-contain rounded-md"
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#121214]">
              {mode === 'login' ? 'Masuk ke Akun Anda' : 'Registrasi Staf Baru'}
            </h1>
            <p className="text-xs text-[#75726B]">
              {mode === 'login'
                ? 'Gunakan akun yang telah terdaftar pada sistem.'
                : 'Daftarkan akun untuk staf operasional toko.'}
            </p>
          </div>

          {/* Segmented Mode Switcher */}
          <div className="flex p-1 bg-[#F5F4EE] rounded-lg border border-[#E5E2DA]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#121214] shadow-2xs font-bold'
                  : 'text-[#75726B] hover:text-[#121214]'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#121214] shadow-2xs font-bold'
                  : 'text-[#75726B] hover:text-[#121214]'
              }`}
            >
              Daftar Staf
            </button>
          </div>

          {/* Alert Notification Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#33312E] block">
                  Email atau Username
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#85827B] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    disabled={loading}
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="nama@email.com atau username"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D5D2C9] bg-[#FAF9F5] text-[#121214] focus:bg-white focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#33312E] block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#85827B] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    disabled={loading}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D5D2C9] bg-[#FAF9F5] text-[#121214] focus:bg-white focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#121214] text-white text-xs sm:text-sm font-semibold hover:bg-[#2A2A2E] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 shadow-xs cursor-pointer"
              >
                <span>{loading ? 'Memproses...' : 'Masuk ke Aplikasi'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-3.5">
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
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D5D2C9] bg-[#FAF9F5] text-[#121214] focus:bg-white focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all disabled:opacity-60"
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
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D5D2C9] bg-[#FAF9F5] text-[#121214] focus:bg-white focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all font-mono disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#33312E] block">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#85827B] absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      disabled={loading}
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="staf@gmail.com"
                      className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D5D2C9] bg-[#FAF9F5] text-[#121214] focus:bg-white focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all disabled:opacity-60"
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
                    placeholder="Min 6 karakter"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D5D2C9] bg-[#FAF9F5] text-[#121214] focus:bg-white focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all font-mono disabled:opacity-60"
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
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D5D2C9] bg-[#FAF9F5] text-[#121214] focus:bg-white focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all font-mono disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E5E2DA] text-[11px] text-[#605D57]">
                Akun baru akan otomatis terdaftar sebagai staf operasional toko.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#121214] text-white text-xs sm:text-sm font-semibold hover:bg-[#2A2A2E] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 shadow-xs cursor-pointer"
              >
                <span>{loading ? 'Mendaftarkan...' : 'Daftar Akun Staf'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-5 py-4 text-center text-[11px] text-[#85827B] font-mono">
        Haidar Plastik · Sistem Informasi & Pemeriksaan Toko
      </footer>
    </div>
  );
};
