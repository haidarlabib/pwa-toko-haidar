import React from 'react';
import { Search, X } from 'lucide-react';
import type { Category, Unit } from '../../../types/database.types';

interface CatalogFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedUnit: string;
  onUnitChange: (val: string) => void;
  stockStatus: 'Semua' | 'Tersedia' | 'Menipis' | 'Habis';
  onStockStatusChange: (val: 'Semua' | 'Tersedia' | 'Menipis' | 'Habis') => void;
  categories: Category[];
  units: Unit[];
  onReset: () => void;
}

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedUnit,
  onUnitChange,
  stockStatus,
  onStockStatusChange,
  categories,
  units,
  onReset,
}) => {
  const stockOptions: ('Semua' | 'Tersedia' | 'Menipis' | 'Habis')[] = [
    'Semua',
    'Tersedia',
    'Menipis',
    'Habis',
  ];

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedUnit !== 'all' ||
    stockStatus !== 'Semua';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari barang berdasarkan nama, SKU, atau subkategori..."
          className="w-full pl-10 pr-9 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-400 bg-white"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Stock Status Pills */}
          <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs">
            {stockOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => onStockStatusChange(opt)}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  stockStatus === opt
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="text-xs font-medium rounded-lg border border-slate-300 py-1.5 px-3 bg-white text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Unit Dropdown */}
          <select
            value={selectedUnit}
            onChange={(e) => onUnitChange(e.target.value)}
            className="text-xs font-medium rounded-lg border border-slate-300 py-1.5 px-3 bg-white text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Semua Satuan</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.symbol})
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Reset Filter
          </button>
        )}
      </div>
    </div>
  );
};
