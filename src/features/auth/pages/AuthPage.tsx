import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../stores/appStore';
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  UserCheck,
  Lock,
  Mail,
  User,
  AlertCircle,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, availableUsers } = useAppStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('••••••••');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await login(loginIdentifier, loginPassword);
      if (res.success && res.role) {
        if (res.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/dashboard');
        }
      } else {
        setErrorMessage(res.error || 'Autentikasi gagal. Silakan periksa kembali.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (registerPassword && registerConfirmPassword && registerPassword !== registerConfirmPassword) {
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

      if (res.success && res.role) {
        navigate('/user/dashboard');
      } else {
        setErrorMessage(res.error || 'Pendaftaran gagal');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (username: string) => {
    setLoginIdentifier(username);
    setLoading(true);
    const res = await login(username);
    setLoading(false);
    if (res.success && res.role) {
      if (res.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#121214] antialiased flex flex-col justify-between selection:bg-[#EAE6DD] font-sans">
      {/* Top Header */}
      <header className="px-5 sm:px-10 py-5 flex items-center justify-between max-w-5xl w-full mx-auto">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs text-[#75726B] hover:text-[#121214] font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#121214]" />
          <span className="font-extrabold text-xs tracking-wider uppercase text-[#121214]">
            Haidar Plastik
          </span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-xl border border-[#E5E2DA] p-6 sm:p-8 shadow-xs space-y-6">
          {/* Card Title & Mode Toggle */}
          <div className="space-y-4 text-center">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#75726B] uppercase">
                Autentikasi Akses
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#121214] tracking-tight mt-0.5">
                {mode === 'login' ? 'Masuk ke Sistem' : 'Daftar Akun Staf'}
              </h2>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#F5F4EE] rounded-lg border border-[#E5E2DA]">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  mode === 'login'
                    ? 'bg-white text-[#121214] shadow-2xs'
                    : 'text-[#75726B] hover:text-[#121214]'
                }`}
              >
                Masuk (Login)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage('');
                }}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  mode === 'register'
                    ? 'bg-white text-[#121214] shadow-2xs'
                    : 'text-[#75726B] hover:text-[#121214]'
                }`}
              >
                Daftar (Register)
              </button>
            </div>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#33312E] block">
                  Username atau Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#85827B] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="admin atau ahmad"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-[#D5D2C9] focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#33312E]">
                    Password
                  </label>
                  <span className="text-[10px] text-[#85827B] font-mono">
                    Default demo
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#85827B] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-[#D5D2C9] focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-md bg-[#121214] text-white text-xs font-bold hover:bg-[#2A2A2E] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 shadow-2xs"
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
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="Nama staf operasional"
                  className="w-full px-3 py-2 text-xs rounded-md border border-[#D5D2C9] focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all"
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
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder="username"
                    className="w-full px-3 py-2 text-xs rounded-md border border-[#D5D2C9] focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all font-mono"
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
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="staf@haidar.com"
                      className="w-full pl-8 pr-2.5 py-2 text-xs rounded-md border border-[#D5D2C9] focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all"
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
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs rounded-md border border-[#D5D2C9] focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#33312E] block">
                    Konfirmasi Password
                  </label>
                  <input
                    type="password"
                    required
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs rounded-md border border-[#D5D2C9] focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#FAF9F5] border border-[#E5E2DA] text-[11px] text-[#605D57] leading-tight">
                <strong>Otorisasi Akses:</strong> Akun baru otomatis didaftarkan sebagai <em>Staf Operasional (USER)</em>.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-md bg-[#121214] text-white text-xs font-bold hover:bg-[#2A2A2E] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 shadow-2xs"
              >
                <span>{loading ? 'Mendaftarkan...' : 'Daftar Akun Staf'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Quick Demo Switcher Section */}
          <div className="pt-4 border-t border-[#EAE8E2] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[#75726B] tracking-wider">
                Akun Demo:
              </span>
              <span className="text-[10px] text-[#85827B] font-mono">1-Klik Masuk</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {availableUsers.slice(0, 3).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(user.username)}
                  className="p-2 rounded-md border border-[#E5E2DA] bg-[#FAF9F5] hover:bg-[#F0EFE9] text-left transition-all"
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#121214] truncate">
                    {user.role === 'ADMIN' ? (
                      <Shield className="w-3 h-3 text-indigo-600 shrink-0" />
                    ) : (
                      <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    )}
                    <span className="truncate">{user.name}</span>
                  </div>
                  <span className="text-[9px] font-mono text-[#75726B] block truncate">
                    @{user.username} ({user.role})
                  </span>
                </button>
              ))}
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
