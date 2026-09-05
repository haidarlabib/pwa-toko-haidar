import React from 'react';
import type { Product, Unit } from '../../../types/database.types';
import { Link } from 'react-router-dom';

interface UnitDistributionCardProps {
  products: Product[];
  units: Unit[];
  loading?: boolean;
}

export const UnitDistributionCard: React.FC<UnitDistributionCardProps> = ({
  products,
  units,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E2DA] p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="w-32 h-4 bg-[#EAE8E2] rounded animate-pulse" />
        <div className="space-y-2.5 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 bg-[#FAF9F5] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const totalProducts = products.length;

  // Compute number of products using each unit
  const unitStats = units
    .map((u) => {
      const count = products.filter((p) => p.unit_id === u.id).length;
      const percentage = totalProducts > 0 ? (count / totalProducts) * 100 : 0;
      return {
        id: u.id,
        name: u.name,
        symbol: u.symbol || u.name,
        count,
        percentage: Math.round(percentage),
        exactPercentage: percentage.toFixed(1),
      };
    })
    .sort((a, b) => b.count - a.count);

  // Check unassigned unit
  const unassignedCount = products.filter(
    (p) => !units.some((u) => u.id === p.unit_id)
  ).length;

  if (unassignedCount > 0) {
    const unassignedPct = totalProducts > 0 ? (unassignedCount / totalProducts) * 100 : 0;
    unitStats.push({
      id: 'unassigned_unit',
      name: 'Lainnya',
      symbol: 'Lainnya',
      count: unassignedCount,
      percentage: Math.round(unassignedPct),
      exactPercentage: unassignedPct.toFixed(1),
    });
  }

  const maxCount = Math.max(...unitStats.map((u) => u.count), 1);

  return (
    <div className="bg-white rounded-xl border border-[#E5E2DA] p-4 sm:p-5 shadow-2xs space-y-3 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-2 border-b border-[#EAE8E2]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#75726B] font-bold block">
            Distribusi Satuan
          </span>
          <h2 className="text-sm sm:text-base font-bold text-[#121214] tracking-tight mt-0.5">
            Penggunaan Satuan
          </h2>
          <p className="text-[11px] text-[#75726B] mt-0.5">
            Jumlah barang berdasarkan satuan standar
          </p>
        </div>

        <Link
          to="/admin/data?tab=units"
          className="text-xs font-semibold text-[#121214] hover:underline shrink-0"
        >
          Kelola →
        </Link>
      </div>

      {/* Bar List */}
      {unitStats.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#75726B]">
          Belum ada satuan terdaftar.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {unitStats.slice(0, 6).map((u) => {
            const barWidth = Math.max((u.count / maxCount) * 100, 2);

            return (
              <div key={u.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-semibold text-[#121214] truncate">
                      {u.name}
                    </span>
                    {u.symbol && u.symbol !== u.name && (
                      <span className="text-[10px] font-mono text-[#75726B]">
                        ({u.symbol})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#75726B] shrink-0">
                    <strong className="text-[#121214] font-bold">{u.count}</strong>
                    <span>({u.percentage}%)</span>
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
        <span>Satuan Terdaftar:</span>
        <strong className="text-[#121214]">
          {units.length} Satuan Aktif
        </strong>
      </div>
    </div>
  );
};
