import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Tag, Scale, TrendingUp } from 'lucide-react';

interface InventoryKpiCardsProps {
  totalProducts: number;
  totalCategories: number;
  totalUnits: number;
  priceChangesCount: number;
  loading?: boolean;
}

export const InventoryKpiCards: React.FC<InventoryKpiCardsProps> = ({
  totalProducts,
  totalCategories,
  totalUnits,
  priceChangesCount,
  loading = false,
}) => {
  const navigate = useNavigate();

  const kpis = [
    {
      id: 'products',
      label: 'Total Barang',
      value: totalProducts,
      subtext: 'barang aktif',
      icon: Package,
      path: '/admin/barang',
    },
    {
      id: 'categories',
      label: 'Total Kategori',
      value: totalCategories,
      subtext: 'kategori aktif',
      icon: Tag,
      path: '/admin/data',
    },
    {
      id: 'units',
      label: 'Total Satuan',
      value: totalUnits,
      subtext: 'satuan digunakan',
      icon: Scale,
      path: '/admin/data',
    },
    {
      id: 'prices',
      label: 'Perubahan Harga',
      value: priceChangesCount,
      subtext: 'dalam 30 hari',
      icon: TrendingUp,
      path: '/admin/profile?tab=price_history',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <button
            key={kpi.id}
            type="button"
            onClick={() => navigate(kpi.path)}
            className="p-4 sm:p-5 rounded-xl bg-white border border-[#E5E2DA] shadow-2xs hover:border-[#C8C4B7] hover:shadow-xs transition-all text-left flex flex-col justify-between group cursor-pointer active:scale-[0.99]"
            aria-label={`${kpi.label}: ${loading ? 'memuat' : kpi.value} ${kpi.subtext}`}
          >
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#75726B] truncate">
                {kpi.label}
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#FAF9F5] border border-[#EAE8E2] flex items-center justify-center text-[#121214] shrink-0 group-hover:bg-[#121214] group-hover:text-white group-hover:border-[#121214] transition-colors">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>

            <div className="mt-3 sm:mt-4">
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#121214]">
                {loading ? (
                  <span className="inline-block w-12 h-7 bg-[#EAE8E2] rounded animate-pulse" />
                ) : (
                  kpi.value.toLocaleString('id-ID')
                )}
              </div>
              <div className="text-[11px] sm:text-xs text-[#75726B] mt-0.5 font-medium">
                {kpi.subtext}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
