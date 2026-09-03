import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  SlidersHorizontal,
  History,
  FileSpreadsheet,
} from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/barang', label: 'Barang', icon: Package },
  { to: '/admin/data', label: 'Data', icon: SlidersHorizontal },
  { to: '/admin/riwayat', label: 'Riwayat', icon: History },
  { to: '/admin/export', label: 'Export', icon: FileSpreadsheet },
];

export const MobileBottomNav: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1 flex items-center justify-around shadow-lg safe-area-inset-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1.5 px-0.5 rounded-lg transition-colors select-none ${
                isActive
                  ? 'text-emerald-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1 rounded-full transition-all ${
                    isActive ? 'bg-emerald-50 text-emerald-600 scale-105' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
