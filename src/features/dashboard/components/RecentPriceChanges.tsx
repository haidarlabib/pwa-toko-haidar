import React from 'react';
import type { PriceHistory } from '../../../types/database.types';
import { formatRupiah } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { getPriceChangeVisuals, OLD_PRICE_CLASS } from '../../../utils/priceColor';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentPriceChangesProps {
  items: PriceHistory[];
}

export const RecentPriceChanges: React.FC<RecentPriceChangesProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-500">
        Belum ada riwayat perubahan harga resmi.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Perubahan Harga Terbaru
          </h2>
          <p className="text-xs text-slate-500">Pembaruan harga resmi yang disahkan Admin</p>
        </div>
        <Link
          to="/riwayat"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
        >
          Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {items.slice(0, 5).map((item) => {
          const visuals = getPriceChangeVisuals(item.change_type);
          return (
            <div key={item.id} className="p-4 hover:bg-slate-50/70 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {item.product_name || 'Barang'}
                    </h3>
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                      v{item.version - 1} → v{item.version}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs ${OLD_PRICE_CLASS}`}>
                      {formatRupiah(item.old_selling_price)}
                    </span>
                    <span className="text-slate-400 text-xs">→</span>
                    <span className={`text-sm ${visuals.textClass}`}>
                      {formatRupiah(item.new_selling_price)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">
                    "{item.reason}"
                  </p>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${visuals.badgeClass}`}
                  >
                    {item.change_type === 'INCREASE' && <TrendingUp className="w-3 h-3" />}
                    {item.change_type === 'DECREASE' && <TrendingDown className="w-3 h-3" />}
                    {visuals.label}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatDate(item.created_at)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
