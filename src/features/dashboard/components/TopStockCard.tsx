import React from 'react';
import type { Product } from '../../../types/database.types';
import { Link } from 'react-router-dom';

interface TopStockCardProps {
  products: Product[];
  loading?: boolean;
}

export const TopStockCard: React.FC<TopStockCardProps> = ({
  products,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E2DA] p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="w-32 h-4 bg-[#EAE8E2] rounded animate-pulse" />
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 bg-[#FAF9F5] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Top 5 products by stock descending
  const topItems = [...products]
    .sort((a, b) => Number(b.stock) - Number(a.stock))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-[#E5E2DA] p-4 sm:p-5 shadow-2xs space-y-3 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-2 border-b border-[#EAE8E2]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#75726B] font-bold block">
            Peringkat Volume
          </span>
          <h2 className="text-sm sm:text-base font-bold text-[#121214] tracking-tight mt-0.5">
            Stok Terbanyak
          </h2>
          <p className="text-[11px] text-[#75726B] mt-0.5">
            5 barang dengan kuantitas fisik tertinggi
          </p>
        </div>

        <Link
          to="/admin/barang"
          className="text-xs font-semibold text-[#121214] hover:underline shrink-0"
        >
          Katalog →
        </Link>
      </div>

      {/* List / Table */}
      {topItems.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#75726B]">
          Belum ada data barang.
        </div>
      ) : (
        <div className="divide-y divide-[#EAE8E2] text-xs">
          {topItems.map((p, idx) => {
            const unitName = p.unit?.symbol || p.unit?.name || 'Unit';
            const formattedStock = Number(p.stock || 0).toLocaleString('id-ID');

            return (
              <div
                key={p.id}
                className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 hover:bg-[#FAF9F5] px-1.5 rounded transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 text-center font-mono font-bold text-[11px] text-[#75726B] shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="font-bold text-[#121214] block truncate">
                      {p.name}
                    </span>
                    <span className="text-[10px] text-[#75726B] font-mono block truncate">
                      {p.category?.name || 'Tanpa Kategori'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono font-bold text-xs">
                    {formattedStock} {unitName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-2 border-t border-[#EAE8E2] flex items-center justify-between text-[11px] text-[#75726B] font-mono">
        <span>Katalog Terpantau:</span>
        <strong className="text-[#121214]">
          {products.length} Barang
        </strong>
      </div>
    </div>
  );
};
