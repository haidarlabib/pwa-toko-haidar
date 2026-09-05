import React from 'react';
import type { PriceHistory } from '../../../types/database.types';
import { formatRupiah } from '../../../utils/currency';
import { formatDateTime } from '../../../lib/datetime';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PriceAnalyticsCardProps {
  priceHistories: PriceHistory[];
  loading?: boolean;
}

export const PriceAnalyticsCard: React.FC<PriceAnalyticsCardProps> = ({
  priceHistories,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E2DA] p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="w-36 h-4 bg-[#EAE8E2] rounded animate-pulse" />
        <div className="space-y-2.5 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-[#FAF9F5] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E2DA] p-4 sm:p-5 shadow-2xs space-y-3 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-2 border-b border-[#EAE8E2]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#75726B] font-bold block">
            Audit Harga
          </span>
          <h2 className="text-sm sm:text-base font-bold text-[#121214] tracking-tight mt-0.5">
            Perubahan Harga Resmi
          </h2>
          <p className="text-[11px] text-[#75726B] mt-0.5">
            Penetapan harga jual terbaru yang disahkan
          </p>
        </div>

        <Link
          to="/admin/profile?tab=price_history"
          className="text-xs font-semibold text-[#121214] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Semua Riwayat</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* List */}
      {priceHistories.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#75726B]">
          Belum ada riwayat perubahan harga resmi.
        </div>
      ) : (
        <div className="divide-y divide-[#EAE8E2] text-xs">
          {priceHistories.slice(0, 4).map((hist) => {
            const isIncrease = hist.change_type === 'INCREASE';
            const isDecrease = hist.change_type === 'DECREASE';

            const oldP = Number(hist.old_selling_price) || 0;
            const newP = Number(hist.new_selling_price) || 0;
            const diffPct =
              oldP > 0 ? (((newP - oldP) / oldP) * 100).toFixed(1) : '0';

            return (
              <div
                key={hist.id}
                className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 hover:bg-[#FAF9F5] px-1.5 rounded transition-colors"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <strong className="text-[#121214] truncate font-bold">
                      {hist.product_name || 'Barang'}
                    </strong>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F5F4EE] text-[#605D57] shrink-0">
                      v{hist.version}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#75726B] truncate">
                    <span>{formatDateTime(hist.created_at)}</span>
                    {hist.reason && (
                      <span className="ml-1.5 italic text-[#605D57]">
                        · "{hist.reason}"
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-0.5">
                  <div className="flex items-center justify-end gap-1 font-mono text-xs">
                    <span className="text-[#75726B]">{formatRupiah(hist.old_selling_price)}</span>
                    <span className="text-[#85827B]">→</span>
                    <strong
                      className={
                        isIncrease
                          ? 'text-red-700 font-bold'
                          : isDecrease
                          ? 'text-emerald-700 font-bold'
                          : 'text-[#121214] font-bold'
                      }
                    >
                      {formatRupiah(hist.new_selling_price)}
                    </strong>
                  </div>

                  <div className="flex items-center justify-end gap-1">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold font-mono px-1.5 py-0.2 rounded border ${
                        isIncrease
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : isDecrease
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-[#F5F4EE] text-[#605D57] border-[#E5E2DA]'
                      }`}
                    >
                      {isIncrease ? (
                        <>
                          <TrendingUp className="w-2.5 h-2.5" />
                          <span>+{diffPct}%</span>
                        </>
                      ) : isDecrease ? (
                        <>
                          <TrendingDown className="w-2.5 h-2.5" />
                          <span>{diffPct}%</span>
                        </>
                      ) : (
                        <span>0%</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-2 border-t border-[#EAE8E2] flex items-center justify-between text-[11px] text-[#75726B] font-mono">
        <span>Total Pembaruan Versi:</span>
        <strong className="text-[#121214]">
          {priceHistories.length} Catatan
        </strong>
      </div>
    </div>
  );
};
