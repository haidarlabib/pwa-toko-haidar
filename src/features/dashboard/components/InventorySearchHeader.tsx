import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Product } from '../../../types/database.types';
import { Search, X } from 'lucide-react';
import { formatRupiah } from '../../../utils/currency';

interface InventorySearchHeaderProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  todayDayName: string;
  todayDateFormatted: string;
}

export const InventorySearchHeader: React.FC<InventorySearchHeaderProps> = ({
  products,
  onSelectProduct,
  todayDayName,
  todayDateFormatted,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products by query (name, category, subcategory, notes)
  const searchResults = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean) return [];

    return products.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(clean);
      const categoryMatch = p.category?.name?.toLowerCase().includes(clean);
      const subcategoryMatch = p.subcategory?.toLowerCase().includes(clean);
      const notesMatch = p.notes?.toLowerCase().includes(clean);
      return nameMatch || categoryMatch || subcategoryMatch || notesMatch;
    });
  }, [products, query]);

  const handleSelect = (product: Product) => {
    onSelectProduct(product);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="pb-3 border-b border-[#EAE8E2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Search Input Container */}
      <div
        ref={containerRef}
        className="relative w-full sm:max-w-md lg:max-w-lg"
      >
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#85827B] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (query.trim()) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Cari nama barang..."
            className="w-full h-11 sm:h-10 pl-9 pr-9 bg-white border border-[#E5E2DA] rounded-xl text-xs sm:text-sm text-[#121214] placeholder:text-[#85827B] shadow-2xs hover:border-[#C8C4B7] focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all"
            aria-label="Cari barang inventori"
            aria-expanded={isOpen}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="absolute right-2.5 p-1 text-[#85827B] hover:text-[#121214] rounded-md transition-colors"
              aria-label="Bersihkan pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown Popover */}
        {isOpen && query.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-[#E5E2DA] rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {searchResults.length > 0 ? (
              <>
                <div className="p-2 px-3.5 bg-[#FAF9F5] border-b border-[#EAE8E2] text-[10px] font-mono text-[#75726B] flex items-center justify-between">
                  <span>HASIL PENCARIAN</span>
                  <span>{searchResults.length} barang cocok</span>
                </div>
                <div className="max-h-72 sm:max-h-80 overflow-y-auto divide-y divide-[#EAE8E2] text-xs">
                  {searchResults.slice(0, 8).map((p) => {
                    const unitName = p.unit?.symbol || p.unit?.name || 'Unit';
                    const formattedStock = Number(p.stock || 0).toLocaleString('id-ID');
                    const isOutOfStock = Number(p.stock || 0) <= 0;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelect(p)}
                        className="w-full p-3 hover:bg-[#FAF9F5] transition-colors text-left flex items-center justify-between gap-3 cursor-pointer active:bg-[#F5F4EE]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-xs sm:text-sm font-bold text-[#121214] truncate block">
                              {p.name}
                            </strong>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F5F4EE] text-[#605D57] shrink-0">
                              v{p.current_price_version}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#75726B] font-mono mt-0.5">
                            <span>{p.category?.name || 'Tanpa Kategori'}</span>
                            {p.subcategory && (
                              <>
                                <span>·</span>
                                <span>{p.subcategory}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0 space-y-0.5">
                          <div className="font-mono text-xs font-bold text-[#121214]">
                            {formatRupiah(p.selling_price)}
                          </div>
                          <span
                            className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border ${
                              isOutOfStock
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {formattedStock} {unitName}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="py-6 px-4 text-center text-xs text-[#75726B]">
                Tidak ada barang yang cocok.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Date Display */}
      <div className="text-xs font-mono text-[#75726B] self-start sm:self-auto shrink-0">
        {todayDayName}, {todayDateFormatted}
      </div>
    </div>
  );
};
