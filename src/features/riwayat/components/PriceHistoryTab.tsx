import React, { useState, useMemo } from 'react';
import type { PriceHistory } from '../../../types/database.types';
import { formatRupiah } from '../../../utils/currency';
import { formatDateTime } from '../../../utils/date';
import { getPriceChangeVisuals, OLD_PRICE_CLASS } from '../../../utils/priceColor';
import { TrendingUp, TrendingDown, Search, UserCheck } from 'lucide-react';

interface PriceHistoryTabProps {
  history: PriceHistory[];
}

export const PriceHistoryTab: React.FC<PriceHistoryTabProps> = ({ history }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCREASE' | 'DECREASE'>('ALL');

  const filtered = useMemo(() => {
    return history.filter((item) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = item.product_name?.toLowerCase().includes(q);
        const matchReason = item.reason.toLowerCase().includes(q);
        if (!matchName && !matchReason) return false;
      }
      if (filterType !== 'ALL' && item.change_type !== filterType) {
        return false;
      }
      return true;
    });
  }, [history, search, filterType]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari barang atau alasan perubahan harga..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              filterType === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({history.length})
          </button>
          <button
            onClick={() => setFilterType('INCREASE')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              filterType === 'INCREASE'
                ? 'bg-white text-red-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-red-700'
            }`}
          >
            Harga Naik
          </button>
          <button
            onClick={() => setFilterType('DECREASE')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              filterType === 'DECREASE'
                ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            Harga Turun
          </button>
        </div>
      </div>

      {/* History Items */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-xs text-slate-400">
          Belum ada riwayat perubahan harga resmi yang cocok.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-2xs overflow-hidden">
          {filtered.map((item) => {
            const visuals = getPriceChangeVisuals(item.change_type);
            return (
              <div key={item.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {item.product_name || 'Barang'}
                      </h4>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                        v{item.version - 1} → v{item.version}
                      </span>
                    </div>

                    {/* Price Diffs */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Jual:</span>
                        <span className={OLD_PRICE_CLASS}>
                          {formatRupiah(item.old_selling_price)}
                        </span>
                        <span className="text-slate-300">→</span>
                        <span className={`font-black ${visuals.textClass}`}>
                          {formatRupiah(item.new_selling_price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span className="text-slate-400">Modal:</span>
                        <span className={OLD_PRICE_CLASS}>
                          {formatRupiah(item.old_purchase_price)}
                        </span>
                        <span className="text-slate-300">→</span>
                        <span className="font-semibold text-slate-700">
                          {formatRupiah(item.new_purchase_price)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-500">Alasan:</span> {item.reason}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded ${visuals.badgeClass}`}
                    >
                      {item.change_type === 'INCREASE' && <TrendingUp className="w-3.5 h-3.5" />}
                      {item.change_type === 'DECREASE' && <TrendingDown className="w-3.5 h-3.5" />}
                      {visuals.label}
                    </span>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <UserCheck className="w-3 h-3 text-slate-400" />
                      <span>{item.updated_by_name}</span>
                      <span>•</span>
                      <span>{formatDateTime(item.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
