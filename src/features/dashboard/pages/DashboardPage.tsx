import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getProducts,
  getCategories,
  getPriceHistory,
  getActivityLogs,
  getStockChecks,
  getEditRequests,
  approveStockCheckEdit,
  rejectStockCheckEdit,
} from '../../../lib/db';
import { getScheduledProductsForToday } from '../../../lib/inspectionSchedule';
import type {
  Product,
  Category,
  PriceHistory,
  ActivityLog,
  StockCheck,
  StockCheckEditRequest,
} from '../../../types/database.types';
import { useAppStore } from '../../../stores/appStore';
import { formatDateTime, getCurrentDay, formatDate, getJakartaNow, getTodayDateString } from '../../../lib/datetime';
import { formatRupiah } from '../../../utils/currency';
import {
  AlertTriangle,
  PackageX,
  FileQuestion,
  TrendingUp,
  TrendingDown,
  Check,
  X,
  ArrowRight,
  ClipboardCheck,
  Package,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, currentUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceHistories, setPriceHistories] = useState<PriceHistory[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [stockChecks, setStockChecks] = useState<StockCheck[]>([]);
  const [editRequests, setEditRequests] = useState<(StockCheckEditRequest & { product_name?: string })[]>([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [prods, cats, history, logs, checks, reqs] = await Promise.all([
        getProducts({ includeInactive: false }),
        getCategories(),
        getPriceHistory(),
        getActivityLogs(),
        getStockChecks(),
        getEditRequests(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setPriceHistories(history);
      setActivityLogs(logs);
      setStockChecks(checks);
      setEditRequests(reqs);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const lowStockProducts = products.filter(
    (p) => Number(p.stock) > 0 && Number(p.stock) <= Number(p.minimum_stock)
  );
  const outOfStockProducts = products.filter((p) => Number(p.stock) <= 0);
  const pendingEditRequests = editRequests.filter((r) => r.status === 'PENDING');

  const todayDateStr = getTodayDateString();
  const todayDayName = getCurrentDay();
  const todayDateFormatted = formatDate(getJakartaNow().toISOString());

  // Scheduled inspections calculation
  const scheduledProducts = getScheduledProductsForToday(products);
  const todaySubmittedChecks = stockChecks.filter((c) => c.check_date === todayDateStr);
  const checkedProductIds = new Set(todaySubmittedChecks.map((c) => c.product_id));
  const completedChecksCount = scheduledProducts.filter((p) => checkedProductIds.has(p.id)).length;
  const pendingChecksCount = scheduledProducts.length - completedChecksCount;

  const handleApprove = async (req: StockCheckEditRequest & { product_name?: string }) => {
    try {
      await approveStockCheckEdit(req.stock_check_id, currentUser?.name || 'Admin');
      showToast(`Permintaan edit untuk "${req.product_name}" disetujui`);
      await loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyetujui edit', 'error');
    }
  };

  const handleReject = async (req: StockCheckEditRequest & { product_name?: string }) => {
    try {
      await rejectStockCheckEdit(req.stock_check_id, currentUser?.name || 'Admin');
      showToast(`Permintaan edit untuk "${req.product_name}" ditolak`, 'info');
      await loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menolak edit', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* 1. Header with dynamic greetings & date (PRD Section 9 & 10) */}
      <div className="pb-3 border-b border-[#EAE8E2] flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#75726B] uppercase block">
            Pusat Operasional Toko
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#121214] tracking-tight mt-0.5">
            Hi, {currentUser?.name || 'Admin'} 👋
          </h1>
          <p className="text-xs text-[#75726B] mt-0.5">
            Selamat datang kembali di Haidar Plastik
          </p>
        </div>
        <div className="text-xs font-mono text-[#75726B] self-start sm:self-auto">
          {todayDayName}, {todayDateFormatted}
        </div>
      </div>

      {/* 2. RINGKASAN HARI INI: Compact inline metric strip (PRD Section 11, 12, 13) */}
      <section className="bg-white rounded-xl border border-[#E5E2DA] p-4 sm:p-5 shadow-xs space-y-3">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#75726B] font-bold block">
          Ringkasan Operasional Hari Ini
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {/* Total Barang */}
          <div
            onClick={() => navigate('/admin/barang')}
            className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E5E2DA] hover:bg-[#F5F4EE] transition-all cursor-pointer"
          >
            <span className="text-[10px] text-[#75726B] block">Total Barang</span>
            <span className="text-xl font-black font-mono text-[#121214]">
              {loading ? '...' : totalProducts}
            </span>
            <span className="text-[10px] text-[#85827B] block mt-0.5">Katalog aktif</span>
          </div>

          {/* Kategori */}
          <div
            onClick={() => navigate('/admin/data')}
            className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E5E2DA] hover:bg-[#F5F4EE] transition-all cursor-pointer"
          >
            <span className="text-[10px] text-[#75726B] block">Kategori</span>
            <span className="text-xl font-black font-mono text-[#121214]">
              {loading ? '...' : totalCategories}
            </span>
            <span className="text-[10px] text-[#85827B] block mt-0.5">Kelompok</span>
          </div>

          {/* Stok Menipis */}
          <div
            onClick={() => navigate('/admin/barang')}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
              lowStockProducts.length > 0
                ? 'bg-amber-50/70 border-amber-200 text-amber-950 hover:bg-amber-50'
                : 'bg-[#FAF9F5] border-[#E5E2DA] text-[#121214]'
            }`}
          >
            <span className="text-[10px] text-[#75726B] flex items-center justify-between">
              <span>Stok Menipis</span>
              {lowStockProducts.length > 0 && <AlertTriangle className="w-3 h-3 text-amber-600" />}
            </span>
            <span className="text-xl font-black font-mono">
              {loading ? '...' : lowStockProducts.length}
            </span>
            <span className="text-[10px] text-[#85827B] block mt-0.5">Batas minimum</span>
          </div>

          {/* Barang Habis */}
          <div
            onClick={() => navigate('/admin/barang')}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
              outOfStockProducts.length > 0
                ? 'bg-rose-50/70 border-rose-200 text-rose-950 hover:bg-rose-50'
                : 'bg-[#FAF9F5] border-[#E5E2DA] text-[#121214]'
            }`}
          >
            <span className="text-[10px] text-[#75726B] flex items-center justify-between">
              <span>Barang Habis</span>
              {outOfStockProducts.length > 0 && <PackageX className="w-3 h-3 text-rose-600" />}
            </span>
            <span className="text-xl font-black font-mono">
              {loading ? '...' : outOfStockProducts.length}
            </span>
            <span className="text-[10px] text-[#85827B] block mt-0.5">Stok 0</span>
          </div>

          {/* Perubahan Harga */}
          <div
            onClick={() => navigate('/admin/profile?tab=price_history')}
            className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E5E2DA] hover:bg-[#F5F4EE] transition-all cursor-pointer"
          >
            <span className="text-[10px] text-[#75726B] block">Perubahan Harga</span>
            <span className="text-xl font-black font-mono text-[#121214]">
              {loading ? '...' : priceHistories.length}
            </span>
            <span className="text-[10px] text-[#85827B] block mt-0.5">Riwayat versi</span>
          </div>

          {/* Request Edit */}
          <div
            onClick={() => navigate('/admin/profile?tab=edit_requests')}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
              pendingEditRequests.length > 0
                ? 'bg-amber-50/70 border-amber-200 text-amber-950 hover:bg-amber-50'
                : 'bg-[#FAF9F5] border-[#E5E2DA] text-[#121214]'
            }`}
          >
            <span className="text-[10px] text-[#75726B] flex items-center justify-between">
              <span>Request Edit</span>
              {pendingEditRequests.length > 0 && <FileQuestion className="w-3 h-3 text-amber-600" />}
            </span>
            <span className="text-xl font-black font-mono">
              {loading ? '...' : pendingEditRequests.length}
            </span>
            <span className="text-[10px] text-[#85827B] block mt-0.5">Perlu tinjauan</span>
          </div>
        </div>
      </section>

      {/* 3. REQUEST EDIT QUICK REVIEW BOX (PRD Section 16) */}
      {pendingEditRequests.length > 0 && (
        <section className="bg-white rounded-xl border border-amber-200 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-amber-100">
            <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <FileQuestion className="w-3.5 h-3.5 text-amber-700" />
              Request Edit: {pendingEditRequests.length} permintaan menunggu persetujuan
            </span>
            <button
              onClick={() => navigate('/admin/profile?tab=edit_requests')}
              className="text-xs font-semibold text-amber-900 hover:underline"
            >
              Buka Semua di Profil →
            </button>
          </div>

          <div className="space-y-2">
            {pendingEditRequests.slice(0, 3).map((req) => (
              <div
                key={req.id}
                className="p-3 bg-[#FAF9F5] rounded border border-[#E5E2DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-[#121214]">{req.product_name}</strong>
                    <span className="text-[#85827B]">·</span>
                    <span className="text-[#605D57]">Pemohon: <strong>{req.requested_by}</strong></span>
                    <span className="text-[11px] font-mono text-[#85827B]">({formatDateTime(req.created_at)})</span>
                  </div>
                  <p className="text-[#55524D] mt-0.5 italic">
                    "{req.reason}"
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(req)}
                    className="px-2.5 py-1 rounded bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 hover:bg-emerald-800 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Setujui</span>
                  </button>
                  <button
                    onClick={() => handleReject(req)}
                    className="px-2.5 py-1 rounded bg-[#EAE8E2] text-[#4A4844] font-semibold text-xs flex items-center gap-1 hover:bg-[#DDD9CE] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. PERUBAHAN HARGA RESMI TERBARU (PRD Section 14) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#EAE8E2]">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#75726B] font-bold">
            Perubahan Harga Resmi Terbaru
          </h2>
          <button
            onClick={() => navigate('/admin/profile?tab=price_history')}
            className="text-xs font-semibold text-[#121214] hover:underline flex items-center gap-1"
          >
            <span>Semua Riwayat Harga</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {priceHistories.length === 0 ? (
          <div className="p-4 bg-white rounded-xl border border-[#E5E2DA] text-center text-xs text-[#75726B]">
            Belum ada riwayat pembaruan harga resmi.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E5E2DA] divide-y divide-[#EAE8E2] text-xs">
            {priceHistories.slice(0, 4).map((hist) => {
              const isIncrease = hist.change_type === 'INCREASE';
              const isDecrease = hist.change_type === 'DECREASE';

              return (
                <div key={hist.id} className="p-3.5 flex items-center justify-between hover:bg-[#FAF9F5] transition-colors">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <strong className="text-[#121214] truncate">{hist.product_name}</strong>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F5F4EE] text-[#605D57]">
                        v{hist.version}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#75726B]">
                      <span>{formatDateTime(hist.created_at)}</span>
                      {hist.reason && <span className="ml-2 italic text-[#605D57]">"{hist.reason}"</span>}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1.5 font-mono text-xs font-medium">
                      <span className="text-[#75726B]">{formatRupiah(hist.old_selling_price)}</span>
                      <span className="text-[#85827B]">→</span>
                      <strong className={isIncrease ? 'text-red-700 font-bold' : isDecrease ? 'text-emerald-700 font-bold' : 'text-[#121214]'}>
                        {formatRupiah(hist.new_selling_price)}
                      </strong>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold font-mono px-1.5 py-0.2 rounded border mt-0.5 ${
                        isIncrease
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : isDecrease
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {isIncrease ? <TrendingUp className="w-3 h-3" /> : isDecrease ? <TrendingDown className="w-3 h-3" /> : null}
                      <span>{isIncrease ? 'Harga Naik' : isDecrease ? 'Harga Turun' : 'Harga Diperbarui'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. PEMERIKSAAN STOK HARI INI & AKTIVITAS TERBARU (PRD Section 15 & 11) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pemeriksaan Stok Hari Ini Overview */}
        <section className="bg-white rounded-xl border border-[#E5E2DA] p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE8E2]">
            <span className="text-xs font-mono uppercase tracking-widest text-[#75726B] font-bold flex items-center gap-1.5">
              <ClipboardCheck className="w-3.5 h-3.5 text-[#121214]" />
              Pemeriksaan Stok Hari Ini
            </span>
            <button
              onClick={() => navigate('/admin/profile?tab=stock_checks')}
              className="text-xs font-semibold text-[#121214] hover:underline"
            >
              Lihat pemeriksaan →
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-bold text-[#121214]">
              {scheduledProducts.length} barang dijadwalkan untuk hari {todayDayName}
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold">
                ✓ {completedChecksCount} selesai
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-semibold">
                ○ {pendingChecksCount} belum diperiksa
              </span>
            </div>

            <p className="text-[11px] text-[#75726B] pt-1 leading-relaxed">
              Staf operasional melakukan observasi fisik toko sesuai jadwal harian.
            </p>
          </div>
        </section>

        {/* Aktivitas Terbaru Timeline */}
        <section className="bg-white rounded-xl border border-[#E5E2DA] p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE8E2]">
            <span className="text-xs font-mono uppercase tracking-widest text-[#75726B] font-bold flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#121214]" />
              Aktivitas Terbaru
            </span>
            <button
              onClick={() => navigate('/admin/profile?tab=activity')}
              className="text-xs font-semibold text-[#121214] hover:underline"
            >
              Semua Log →
            </button>
          </div>

          {activityLogs.length === 0 ? (
            <p className="text-xs text-[#75726B]">Belum ada aktivitas tercatat.</p>
          ) : (
            <div className="divide-y divide-[#EAE8E2] text-xs">
              {activityLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="py-2 first:pt-0 last:pb-0 space-y-0.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#75726B]">
                    <span>{log.user_name} · <strong className="text-[#121214]">{log.action}</strong></span>
                    <span>{formatDateTime(log.created_at)}</span>
                  </div>
                  <p className="text-[#3D3B37] truncate">
                    {log.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
