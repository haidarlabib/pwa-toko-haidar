import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  SlidersHorizontal,
  History,
  FileSpreadsheet,
  ShieldCheck,
  RotateCcw,
  User,
  LogOut,
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { resetDatabase } from '../../lib/db';
import { OfflineIndicator } from './OfflineIndicator';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/barang', label: 'Barang', icon: Package, badge: 'Lihat' },
  { to: '/admin/data', label: 'Data', icon: SlidersHorizontal, badge: 'Kelola' },
  { to: '/admin/riwayat', label: 'Riwayat', icon: History },
  { to: '/admin/export', label: 'Export', icon: FileSpreadsheet },
  { to: '/admin/profile', label: 'Profil', icon: User },
];

export const DesktopSidebar: React.FC = () => {
  const { currentUser, showToast, logout } = useAppStore();
  const navigate = useNavigate();

  const handleResetData = async () => {
    if (window.confirm('Reset database ke data awal demo Haidar Plastik?')) {
      await resetDatabase();
      showToast('Database berhasil direset ke data awal');
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-100 border-r border-slate-800 shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <img
                src="/logo-white-inverted.png"
                alt="Haidar Plastik"
                className="w-8 h-8 object-contain rounded-xs"
              />
              <h1 className="font-black tracking-wider text-base text-white uppercase">
                Haidar Plastik
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono tracking-tight">
              ADMIN MANAGEMENT PWA
            </p>
          </div>
          <OfflineIndicator />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Menu Utama Admin
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Philosophy Quote */}
      <div className="px-4 py-3 mx-3 mb-3 bg-slate-800/50 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed font-sans">
        <span className="font-semibold text-emerald-400 block mb-0.5">Filosofi Sistem:</span>
        Barang untuk melihat. Data untuk mengelola. Riwayat untuk melacak. Export untuk mengeluarkan data.
      </div>

      {/* Admin User Footer & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
            AD
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
              {currentUser?.name || 'Admin'}
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>
            <div className="text-[10px] text-slate-400 truncate font-mono">
              {currentUser?.role || 'ADMIN'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleResetData}
            title="Reset data demo"
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleLogout}
            title="Keluar Akun"
            className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
