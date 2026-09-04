import React, { useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  SlidersHorizontal,
  User,
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { ToastContainer } from '../common/ToastContainer';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Barang', path: '/admin/barang', icon: Package },
  { label: 'Data', path: '/admin/data', icon: SlidersHorizontal },
  { label: 'Profil', path: '/admin/profile', icon: User },
];

export const AdminLayout: React.FC = () => {
  const { currentUser, setOnline, showToast } = useAppStore();

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      showToast('Koneksi internet kembali terhubung', 'success');
    };
    const handleOffline = () => {
      setOnline(false);
      showToast('Mode offline aktif — data tersimpan lokal', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline, showToast]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#121214] flex flex-col font-sans">
      {/* Top Header matching UserLayout style (PRD Section 5) */}
      <header className="sticky top-0 z-30 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#E5E2DA] px-4 py-3 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Haidar Plastik"
              className="w-8 h-8 object-contain rounded-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-[#121214] tracking-tight">
                  Hi, {currentUser?.name || 'Admin'} 👋
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-[#75726B]">
                Haidar Plastik · Panel Pengelola
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop Navigation Links (PRD Section 4 & 5: 4 items ONLY) */}
            <div className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#121214] text-white shadow-2xs'
                          : 'text-[#605D57] hover:text-[#121214] hover:bg-[#F0EFE9]'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Profile Avatar Shortcut */}
            <NavLink
              to="/admin/profile"
              className={({ isActive }) =>
                `w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-colors ${
                  isActive
                    ? 'bg-[#121214] text-white border-[#121214]'
                    : 'bg-[#F0EFE9] text-[#121214] border-[#E5E2DA] hover:bg-[#EAE8E2]'
                }`
              }
            >
              AD
            </NavLink>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 sm:pb-8 pt-4 px-4 sm:px-6 max-w-5xl w-full mx-auto">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation (PRD Section 6: 4 items ONLY) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-md border-t border-[#E5E2DA] px-3 py-1.5 sm:hidden shadow-xs">
        <div className="grid grid-cols-4 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center py-1.5 px-2 rounded-lg transition-all ${
                    isActive
                      ? 'text-[#121214] font-bold bg-[#EAE8E2]'
                      : 'text-[#75726B] font-medium hover:text-[#121214]'
                  }`
                }
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <ToastContainer />
    </div>
  );
};
