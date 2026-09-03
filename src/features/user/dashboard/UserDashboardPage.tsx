import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../stores/appStore';
import { getProducts, getStockChecks, getPriceHistory } from '../../../lib/db';
import { getScheduledProductsForToday } from '../../../lib/inspectionSchedule';
import type { Product, StockCheck, PriceHistory } from '../../../types/database.types';
import { getCurrentDay, formatDate, getTodayDateString, getJakartaNow } from '../../../lib/datetime';
import {
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [stockChecks, setStockChecks] = useState<StockCheck[]>([]);
  const [priceHistories, setPriceHistories] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const todayDateStr = getTodayDateString();
  const todayDayName = getCurrentDay();
  const formattedTodayDate = formatDate(getJakartaNow().toISOString());

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [allProds, allChecks, allHistories] = await Promise.all([
          getProducts({ includeInactive: false }),
          getStockChecks(),
          getPriceHistory(),
        ]);
        setProducts(allProds);
        setStockChecks(allChecks);
        setPriceHistories(allHistories);
      } catch (err) {
        console.error('Failed to load user dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter scheduled products for current day
  const scheduledProducts = getScheduledProductsForToday(products);

  // Map today's submitted checks
  const todayChecks = stockChecks.filter((c) => c.check_date === todayDateStr);
  const checkedProductIds = new Set(todayChecks.map((c) => c.product_id));

  const pendingProducts = scheduledProducts.filter((p) => !checkedProductIds.has(p.id));
  const completedProducts = scheduledProducts.filter((p) => checkedProductIds.has(p.id));

  // Today's Price changes (BR-U08..BR-U10) - Product name & direction only!
  const todayPriceChanges = priceHistories.filter(
    (h) => h.created_at.slice(0, 10) === todayDateStr
  );

  return (
    <div className="space-y-6 pb-6 font-sans">
      {/* 1. Greeting & Date Header (PRD Section 28) */}
      <div className="pb-3 border-b border-[#EAE8E2] flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#75726B] uppercase block">
            Operasional Toko
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#121214] tracking-tight mt-0.5">
            Hi, {currentUser?.name || 'Staff'} 👋
          </h1>
        </div>
        <div className="text-xs font-mono text-[#75726B]">
          {todayDayName}, {formattedTodayDate}
        </div>
      </div>

      {/* 2. PRIMARY ACTION: Pemeriksaan Hari Ini (PRD Section 28) */}
      <section className="bg-white rounded-xl border border-[#E5E2DA] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#75726B] uppercase tracking-wider">
            <ClipboardCheck className="w-4 h-4 text-[#121214]" />
            <span className="font-bold text-[#121214]">Pemeriksaan Fisik Hari Ini</span>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#F5F4EE] text-[#605D57]">
            Jadwal {todayDayName}
          </span>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-[#121214]">
              {loading ? '...' : scheduledProducts.length}
            </span>
            <span className="text-xs text-[#75726B]">barang terjadwal untuk hari ini</span>
          </div>

          <div className="mt-2 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{pendingProducts.length} belum diperiksa</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>{completedProducts.length} selesai</span>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => navigate('/user/check')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[#121214] text-white text-xs font-semibold hover:bg-[#2A2A2E] transition-all shadow-2xs active:scale-[0.98]"
          >
            <span>Buka Lembar Pemeriksaan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 3. PERUBAHAN HARGA RESMI HARI INI (PRD Section 28 & 36) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#EAE8E2]">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#75726B] font-bold">
            Pemberitahuan Perubahan Harga Resmi
          </h2>
          <span className="text-[11px] font-mono text-[#85827B]">
            {todayPriceChanges.length} Pembaruan Hari Ini
          </span>
        </div>

        {todayPriceChanges.length === 0 ? (
          <div className="p-4 bg-white rounded-lg border border-[#E5E2DA] text-xs text-[#75726B] text-center">
            Tidak ada perubahan harga jual resmi yang diterbitkan hari ini.
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[#E5E2DA] divide-y divide-[#EAE8E2] text-xs">
            {todayPriceChanges.map((change) => {
              const isIncrease = change.change_type === 'INCREASE';
              const isDecrease = change.change_type === 'DECREASE';

              return (
                <div key={change.id} className="p-3.5 flex items-center justify-between hover:bg-[#FAF9F5] transition-colors">
                  <div className="space-y-0.5">
                    <strong className="text-[#121214]">{change.product_name}</strong>
                    <div className="text-[11px] text-[#75726B]">
                      Diberlakukan oleh manajemen toko
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold font-mono px-2 py-0.5 rounded border ${
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
              );
            })}
          </div>
        )}
      </section>

      {/* 4. RIWAYAT PEMERIKSAAN SAYA HARI INI (PRD Section 28) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#EAE8E2]">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#75726B] font-bold">
            Pemeriksaan Yang Telah Disimpan ({todayChecks.length})
          </h2>
          <button
            onClick={() => navigate('/user/check')}
            className="text-xs font-semibold text-[#121214] hover:underline"
          >
            Buka Form Check →
          </button>
        </div>

        {todayChecks.length === 0 ? (
          <div className="p-4 bg-white rounded-lg border border-[#E5E2DA] text-xs text-[#75726B] text-center">
            Belum ada barang yang diperiksa hari ini. Klik tombol di atas untuk mulai.
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[#E5E2DA] divide-y divide-[#EAE8E2] text-xs">
            {todayChecks.slice(0, 4).map((check) => (
              <div key={check.id} className="p-3.5 flex items-center justify-between hover:bg-[#FAF9F5] transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-[#121214]">{check.product_name}</strong>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Terkunci
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#605D57] mt-0.5">
                    Stok Fisik: <strong>{check.current_stock}</strong> {check.note && <span className="italic text-[#85827B]">({check.note})</span>}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-emerald-700 flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tersimpan</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
