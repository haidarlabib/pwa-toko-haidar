import React from 'react';
import type { Product, Category } from '../../../types/database.types';
import { Link } from 'react-router-dom';

interface CategoryDistributionCardProps {
  products: Product[];
  categories: Category[];
  loading?: boolean;
}

export const CategoryDistributionCard: React.FC<CategoryDistributionCardProps> = ({
  products,
  categories,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E2DA] p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="w-36 h-4 bg-[#EAE8E2] rounded animate-pulse" />
        <div className="space-y-2.5 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 bg-[#FAF9F5] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const totalProducts = products.length;

  // Compute distribution per category
  const categoryStats = categories
    .map((cat) => {
      const count = products.filter((p) => p.category_id === cat.id).length;
      const percentage = totalProducts > 0 ? (count / totalProducts) * 100 : 0;
      return {
        id: cat.id,
        name: cat.name,
        count,
        percentage: Math.round(percentage),
        exactPercentage: percentage.toFixed(1),
      };
    })
    .sort((a, b) => b.count - a.count);

  // Check for any unassigned products
  const unassignedCount = products.filter(
    (p) => !categories.some((c) => c.id === p.category_id)
  ).length;

  if (unassignedCount > 0) {
    const unassignedPct = totalProducts > 0 ? (unassignedCount / totalProducts) * 100 : 0;
    categoryStats.push({
      id: 'unassigned',
      name: 'Tanpa Kategori / Lainnya',
      count: unassignedCount,
      percentage: Math.round(unassignedPct),
      exactPercentage: unassignedPct.toFixed(1),
    });
  }

  const maxCount = Math.max(...categoryStats.map((c) => c.count), 1);

  return (
    <div className="bg-white rounded-xl border border-[#E5E2DA] p-4 sm:p-5 shadow-2xs space-y-3 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-2 border-b border-[#EAE8E2]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#75726B] font-bold block">
            Distribusi Kelompok
          </span>
          <h2 className="text-sm sm:text-base font-bold text-[#121214] tracking-tight mt-0.5">
            Sebaran Barang per Kategori
          </h2>
          <p className="text-[11px] text-[#75726B] mt-0.5">
            Komposisi produk aktif pada tiap kelompok
          </p>
        </div>

        <Link
          to="/admin/data?tab=categories"
          className="text-xs font-semibold text-[#121214] hover:underline shrink-0"
        >
          Kelola →
        </Link>
      </div>

      {/* Bar List */}
      {categoryStats.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#75726B]">
          Belum ada kategori terdaftar.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {categoryStats.slice(0, 6).map((cat) => {
            const barWidth = Math.max((cat.count / maxCount) * 100, 2);

            return (
              <div key={cat.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#121214] truncate max-w-[200px] sm:max-w-[240px]">
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#75726B] shrink-0">
                    <strong className="text-[#121214] font-bold">{cat.count}</strong>
                    <span>({cat.percentage}%)</span>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="w-full h-2 rounded-full bg-[#F0EFE9] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#121214] transition-all duration-300"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-2 border-t border-[#EAE8E2] flex items-center justify-between text-[11px] text-[#75726B] font-mono">
        <span>Total Terklasifikasi:</span>
        <strong className="text-[#121214]">
          {categories.length} Kategori Aktif
        </strong>
      </div>
    </div>
  );
};
