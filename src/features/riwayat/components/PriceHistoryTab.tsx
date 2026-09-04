import React, { useState, useMemo } from 'react';
import type { PriceHistory } from '../../../types/database.types';
import { formatRupiah } from '../../../utils/currency';
import { formatDateTime } from '../../../utils/date';
import { getPriceChangeVisuals, OLD_PRICE_CLASS } from '../../../utils/priceColor';
import { Search, UserCheck } from 'lucide-react';

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
        const matchReason = item.reason ? item.reason.toLowerCase().includes(q) : false;
        if (!matchName && !matchReason) return false;
      }
      if (filterType !== 'ALL' && item.change_type !== filterType) {
        return false;
      }
      return true;
    });
  }, [history, search, filterType]);

  return (
    <div className="space-y-4 font-sans">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#E5E2DA] shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#85827B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari barang atau alasan..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#D5D2C9] bg-[#FAF9F5] text-[#121214] focus:bg-white focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all"
          />
        </div>

        <div className="inline-flex rounded-lg bg-[#F5F4EE] p-1 border border-[#E5E2DA] text-xs font-semibold">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-white text-[#121214] shadow-2xs font-bold'
                : 'text-[#75726B] hover:text-[#121214]'
            }`}
          >
            Semua ({history.length})
          </button>
          <button
            onClick={() => setFilterType('INCREASE')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filterType === 'INCREASE'
                ? 'bg-white text-rose-700 shadow-2xs font-bold'
                : 'text-[#75726B] hover:text-rose-700'
            }`}
          >
            Harga Naik
          </button>
          <button
            onClick={() => setFilterType('DECREASE')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filterType === 'DECREASE'
                ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                : 'text-[#75726B] hover:text-emerald-800'
            }`}
          >
            Harga Turun
          </button>
        </div>
      </div>

      {/* History Items */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E2DA] p-10 text-center text-xs text-[#75726B]">
          Belum ada riwayat perubahan harga resmi yang cocok.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E2DA] divide-y divide-[#EAE8E2] shadow-2xs overflow-hidden">
          {filtered.map((item) => {
            const visuals = getPriceChangeVisuals(item.change_type);
            return (
              <div key={item.id} className="p-4 hover:bg-[#FAF9F5] transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#121214]">
                        {item.product_name || 'Barang'}
                      </h4>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F5F4EE] text-[#121214] font-bold border border-[#E5E2DA]">
                        v{item.version - 1} → v{item.version}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs">
                      {/* Selling Price Diff */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-[#75726B]">Jual:</span>
                        <span className={OLD_PRICE_CLASS}>{formatRupiah(item.old_selling_price)}</span>
                        <span className="text-[#85827B]">→</span>
                        <strong className={`font-mono ${visuals.textClass}`}>
                          {formatRupiah(item.new_selling_price)}
                        </strong>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${visuals.badgeClass}`}>
                          {visuals.label} ({formatRupiah(item.new_selling_price - item.old_selling_price)})
                        </span>
                      </div>

                      {/* Modal Price Diff */}
                      {item.new_purchase_price > 0 && (
                        <div className="flex items-center gap-1 text-[#605D57] font-mono text-[11px]">
                          <span className="text-[#85827B]">Modal:</span>
                          <span>{formatRupiah(item.old_purchase_price)}</span>
                          <span>→</span>
                          <strong className="text-[#121214]">{formatRupiah(item.new_purchase_price)}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 text-[11px] text-[#75726B] font-mono shrink-0">
                    <div className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-[#85827B]" />
                      <span>{item.updated_by_name || 'Admin'}</span>
                    </div>
                    <span>{formatDateTime(item.created_at)}</span>
                  </div>
                </div>

                {/* Reason */}
                {item.reason && (
                  <div className="mt-2.5 pt-2.5 border-t border-[#EAE8E2] text-xs text-[#605D57]">
                    <span className="font-semibold text-[#121214]">Alasan: </span>
                    <span className="italic">"{item.reason}"</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
