import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../../stores/appStore';
import { Button } from '../../../components/common/Button';
import {
  TrendingUp,
  ClipboardCheck,
  Activity,
  FileQuestion,
  FileSpreadsheet,
  Users,
  Info,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import { formatDate } from '../../../lib/datetime';

// Import sub-views
import { PriceHistoryTab } from '../../riwayat/components/PriceHistoryTab';
import { StockCheckTab } from '../../riwayat/components/StockCheckTab';
import { EditRequestTab } from '../../riwayat/components/EditRequestTab';
import { ActivityLogTab } from '../../riwayat/components/ActivityLogTab';
import { ExportPage } from '../../export/pages/ExportPage';
import {
  getPriceHistory,
  getStockChecks,
  getActivityLogs,
  getProducts,
  getEditRequests,
} from '../../../lib/db';
import type {
  PriceHistory,
  StockCheck,
  ActivityLog,
  Product,
  StockCheckEditRequest,
  User,
} from '../../../types/database.types';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

export const AdminProfilePage: React.FC = () => {
  const { currentUser, logout } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  // State for loaded sub-data
  const [loadingSubData, setLoadingSubData] = useState(false);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [stockChecks, setStockChecks] = useState<StockCheck[]>([]);
  const [editRequests, setEditRequests] = useState<(StockCheckEditRequest & { product_name?: string })[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  const loadSubData = async () => {
    try {
      setLoadingSubData(true);
      const [history, checks, reqs, logs, prods] = await Promise.all([
        getPriceHistory(),
        getStockChecks(),
        getEditRequests(),
        getActivityLogs(),
        getProducts({ includeInactive: true }),
      ]);
      setPriceHistory(history);
      setStockChecks(checks);
      setEditRequests(reqs);
      setActivityLogs(logs);
      setProducts(prods);

      if (isSupabaseConfigured()) {
        const { data: profs } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
        if (profs && profs.length > 0) {
          setRegisteredUsers(profs.map((p: any) => ({
            id: p.id,
            name: p.full_name,
            username: p.username,
            email: p.username + '@haidarplastik.com',
            role: p.role,
            created_at: p.created_at,
            updated_at: p.updated_at,
          })));
        } else if (currentUser) {
          setRegisteredUsers([currentUser]);
        }
      } else if (currentUser) {
        setRegisteredUsers([currentUser]);
      }
    } catch (err) {
      console.error('Failed to load subdata in profile:', err);
    } finally {
      setLoadingSubData(false);
    }
  };

  React.useEffect(() => {
    if (currentTab !== 'overview') {
      loadSubData();
    }
  }, [currentTab]);

  const handleLogout = () => {
    logout();
    window.location.href = '/auth';
  };

  const setTab = (tab: string) => {
    if (tab === 'overview') {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* OVERVIEW VIEW */}
      {currentTab === 'overview' ? (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Header */}
          <div className="pb-3 border-b border-[#EAE8E2]">
            <span className="text-[10px] font-mono tracking-widest text-[#75726B] uppercase block">
              Pusat Otoritas & Kontrol
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#121214] tracking-tight mt-0.5">
              Profil Administrator
            </h1>
            <p className="text-xs text-[#75726B]">
              Informasi akun pengelola dan akses fitur sekunder sistem Haidar Plastik
            </p>
          </div>

          {/* Account Overview Card */}
          <div className="bg-white rounded-xl border border-[#E5E2DA] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-[#121214] text-white flex items-center justify-center font-bold text-lg shadow-2xs">
                  AD
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#121214]">
                      {currentUser?.name || 'Administrator'}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold">
                      <Shield className="w-3 h-3" />
                      <span>ADMIN</span>
                    </span>
                  </div>
                  <p className="text-xs text-[#75726B] font-mono mt-0.5">
                    @{currentUser?.username || 'admin'} · {currentUser?.email || 'admin@haidarplastik.com'}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-700 hover:bg-red-50 hover:border-red-200 font-bold self-start sm:self-center"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun</span>
              </Button>
            </div>

            <div className="pt-3 border-t border-[#EAE8E2] grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#75726B] uppercase font-mono block">Level Hak Akses</span>
                <strong className="text-[#121214]">Full Master Control</strong>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#75726B] uppercase font-mono block">Terdaftar Sejak</span>
                <strong className="text-[#121214] font-mono">{formatDate(currentUser?.created_at)}</strong>
              </div>
            </div>
          </div>

          {/* SECONDARY TOOLS MENU LIST (PRD Section 31 & 32) */}
          <div className="space-y-6">
            {/* 1. AKTIVITAS & AUDIT */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#75726B] px-1 block font-bold">
                Aktivitas & Audit Trail
              </span>
              <div className="bg-white rounded-xl border border-[#E5E2DA] divide-y divide-[#EAE8E2] overflow-hidden text-xs shadow-2xs">
                <button
                  onClick={() => setTab('price_history')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-[#FAF9F5] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-[#121214]" />
                    <div>
                      <strong className="text-[#121214] block">Riwayat Harga Resmi</strong>
                      <span className="text-[11px] text-[#75726B]">Audit trail perubahan harga jual, modal, dan versi v1→v2</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#85827B]" />
                </button>

                <button
                  onClick={() => setTab('stock_checks')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-[#FAF9F5] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="w-4 h-4 text-[#121214]" />
                    <div>
                      <strong className="text-[#121214] block">Riwayat Pemeriksaan Stok</strong>
                      <span className="text-[11px] text-[#75726B]">Laporan observasi fisik staf dengan teks mentah</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#85827B]" />
                </button>

                <button
                  onClick={() => setTab('edit_requests')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-[#FAF9F5] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <FileQuestion className="w-4 h-4 text-amber-700" />
                    <div>
                      <strong className="text-[#121214] block">Request Edit Pemeriksaan</strong>
                      <span className="text-[11px] text-[#75726B]">Tinjau dan putuskan persetujuan koreksi data staf</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#85827B]" />
                </button>

                <button
                  onClick={() => setTab('activity')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-[#FAF9F5] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-[#121214]" />
                    <div>
                      <strong className="text-[#121214] block">Riwayat Aktivitas Sistem</strong>
                      <span className="text-[11px] text-[#75726B]">Log audit lengkap seluruh tindakan admin pada master data</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#85827B]" />
                </button>
              </div>
            </div>

            {/* 2. DATA OUTPUT */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#75726B] px-1 block font-bold">
                Data Output
              </span>
              <div className="bg-white rounded-xl border border-[#E5E2DA] divide-y divide-[#EAE8E2] overflow-hidden text-xs shadow-2xs">
                <button
                  onClick={() => setTab('export')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-[#FAF9F5] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                    <div>
                      <strong className="text-[#121214] block">Export Data (Excel & PDF)</strong>
                      <span className="text-[11px] text-[#75726B]">Ekspor 8 dataset inventori resmi dengan seleksi kolom & preview</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#85827B]" />
                </button>
              </div>
            </div>

            {/* 3. PENGATURAN & INFORMASI */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#75726B] px-1 block font-bold">
                Pengaturan & Sistem
              </span>
              <div className="bg-white rounded-xl border border-[#E5E2DA] divide-y divide-[#EAE8E2] overflow-hidden text-xs shadow-2xs">
                <button
                  onClick={() => setTab('users')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-[#FAF9F5] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-[#121214]" />
                    <div>
                      <strong className="text-[#121214] block">Manajemen Pengguna</strong>
                      <span className="text-[11px] text-[#75726B]">Daftar akun staf terdaftar dan otorisasi</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#85827B]" />
                </button>

                <button
                  onClick={() => setTab('about')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-[#FAF9F5] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Info className="w-4 h-4 text-[#121214]" />
                    <div>
                      <strong className="text-[#121214] block">Tentang Sistem</strong>
                      <span className="text-[11px] text-[#75726B]">Informasi versi PWA v2.0, zona waktu Asia/Jakarta, & filosofi</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#85827B]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SUBVIEW CONTAINER WITH BACK BUTTON */
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE8E2]">
            <button
              onClick={() => setTab('overview')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#121214] hover:text-[#75726B] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Menu Profil</span>
            </button>

            <span className="text-xs font-mono text-[#75726B]">
              Profil → {currentTab.toUpperCase().replace('_', ' ')}
            </span>
          </div>

          {loadingSubData ? (
            <div className="p-12 text-center text-xs text-[#75726B]">
              Memuat data...
            </div>
          ) : currentTab === 'price_history' ? (
            <div className="space-y-4">
              <div className="pb-2">
                <h2 className="text-lg font-bold text-[#121214]">Riwayat Perubahan Harga Resmi</h2>
                <p className="text-xs text-[#75726B]">Audit trail lengkap pembaruan harga modal dan harga jual</p>
              </div>
              <PriceHistoryTab history={priceHistory} />
            </div>
          ) : currentTab === 'stock_checks' ? (
            <div className="space-y-4">
              <div className="pb-2">
                <h2 className="text-lg font-bold text-[#121214]">Riwayat Pemeriksaan Stok Staf</h2>
                <p className="text-xs text-[#75726B]">Hasil observasi fisik yang telah disimpan dan dikunci oleh staf</p>
              </div>
              <StockCheckTab
                checks={stockChecks}
                products={products}
                onRefresh={() => loadSubData()}
              />
            </div>
          ) : currentTab === 'edit_requests' ? (
            <div className="space-y-4">
              <div className="pb-2">
                <h2 className="text-lg font-bold text-[#121214]">Permintaan Edit Pemeriksaan</h2>
                <p className="text-xs text-[#75726B]">Tinjau dan putuskan persetujuan terhadap pengajuan edit staf</p>
              </div>
              <EditRequestTab
                requests={editRequests}
                onRefresh={() => loadSubData()}
              />
            </div>
          ) : currentTab === 'activity' ? (
            <div className="space-y-4">
              <div className="pb-2">
                <h2 className="text-lg font-bold text-[#121214]">Log Aktivitas Sistem</h2>
                <p className="text-xs text-[#75726B]">Rekaman kronologis aksi admin terhadap master data</p>
              </div>
              <ActivityLogTab logs={activityLogs} />
            </div>
          ) : currentTab === 'export' ? (
            <div>
              <ExportPage />
            </div>
          ) : currentTab === 'users' ? (
            <div className="space-y-4 max-w-2xl">
              <div className="pb-2">
                <h2 className="text-lg font-bold text-[#121214]">Manajemen Pengguna</h2>
                <p className="text-xs text-[#75726B]">Daftar akun staf yang terdaftar dalam sistem</p>
              </div>
              <div className="bg-white rounded-xl border border-[#E5E2DA] divide-y divide-[#EAE8E2] overflow-hidden text-xs">
                {registeredUsers.length === 0 ? (
                  <div className="p-4 text-center text-[#75726B]">Belum ada pengguna terdaftar.</div>
                ) : (
                  registeredUsers.map((u) => (
                    <div key={u.id} className="p-4 flex items-center justify-between">
                      <div>
                        <strong className="text-sm font-bold text-[#121214] block">{u.name}</strong>
                        <span className="text-xs font-mono text-[#75726B]">@{u.username} · {u.email}</span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        u.role === 'ADMIN'
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : currentTab === 'about' ? (
            <div className="space-y-4 max-w-2xl bg-white rounded-xl border border-[#E5E2DA] p-6 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-white.png"
                  alt="Haidar Plastik"
                  className="w-12 h-12 object-contain rounded-lg border border-[#E5E2DA] p-1 shadow-2xs"
                />
                <div>
                  <h2 className="text-base font-bold text-[#121214]">Tentang Haidar Plastik Management PWA</h2>
                  <p className="text-[11px] text-[#75726B]">Sistem Manajemen Inventaris & Operasional</p>
                </div>
              </div>
              <div className="space-y-2 text-[#4A4844] leading-relaxed pt-2 border-t border-[#E5E2DA]">
                <p>
                  <strong>Versi Sistem:</strong> 2.0 (Revised Minimalist Editorial)
                </p>
                <p>
                  <strong>Zona Waktu Terpusat:</strong> Asia/Jakarta (WIB)
                </p>
                <p>
                  <strong>Filosofi Operasional:</strong>
                  <br />
                  <em>"Barang untuk melihat. Data untuk mengelola. Riwayat untuk melacak. Export untuk mengeluarkan data."</em>
                </p>
                <p>
                  <strong>Penyimpanan Data:</strong> IndexedDB Lokal + Supabase Synchronization Ready.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
