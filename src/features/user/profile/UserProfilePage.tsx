import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../stores/appStore';
import { Button } from '../../../components/common/Button';
import {
  User,
  Mail,
  Shield,
  LogOut,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { currentUser, logout } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="space-y-6 pb-6 font-sans">
      {/* Page Header */}
      <div className="pb-3 border-b border-[#EAE8E2]">
        <span className="text-[10px] font-mono tracking-widest text-[#75726B] uppercase block">
          Akun Staf
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-[#121214] tracking-tight mt-0.5">
          Profil Pengguna
        </h1>
        <p className="text-xs text-[#75726B]">
          Informasi staf operasional toko Haidar Plastik
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-xl border border-[#E5E2DA] p-6 shadow-xs text-center space-y-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-xl bg-[#121214] text-white flex items-center justify-center font-bold text-xl mx-auto shadow-2xs">
          {(currentUser?.name || 'ST').slice(0, 2).toUpperCase()}
        </div>

        <div>
          <h2 className="text-lg font-bold text-[#121214]">{currentUser?.name || 'Staff Toko'}</h2>
          <p className="text-xs text-[#75726B] font-mono mt-0.5">@{currentUser?.username || 'user'}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Staf Operasional Toko</span>
          </div>
        </div>

        {/* User Details Table */}
        <div className="text-left border-t border-[#EAE8E2] pt-4 space-y-3 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-[#F0EFE9]">
            <span className="text-[#75726B] flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#85827B]" />
              <span>Nama Lengkap:</span>
            </span>
            <strong className="text-[#121214]">{currentUser?.name || '-'}</strong>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#F0EFE9]">
            <span className="text-[#75726B] flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#85827B]" />
              <span>Username:</span>
            </span>
            <strong className="text-[#121214] font-mono">{currentUser?.username || '-'}</strong>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#F0EFE9]">
            <span className="text-[#75726B] flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#85827B]" />
              <span>Email:</span>
            </span>
            <strong className="text-[#121214]">{currentUser?.email || '-'}</strong>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#F0EFE9]">
            <span className="text-[#75726B] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#85827B]" />
              <span>Hak Akses:</span>
            </span>
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
              Operasional (Katalog & Pemeriksaan Fisik)
            </span>
          </div>
        </div>
      </div>

      {/* Logout Action */}
      <div>
        <Button
          variant="outline"
          size="md"
          onClick={handleLogout}
          className="w-full text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-200 font-bold"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Akun (Logout)</span>
        </Button>
      </div>
    </div>
  );
};
