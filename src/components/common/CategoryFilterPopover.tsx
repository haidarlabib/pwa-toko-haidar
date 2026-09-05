import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, Check, X } from 'lucide-react';
import type { Category } from '../../types/database.types';

export interface CategoryFilterPopoverProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  totalCount?: number;
  categoryCounts?: Record<string, number>;
  className?: string;
}

export const CategoryFilterPopover: React.FC<CategoryFilterPopoverProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  totalCount,
  categoryCounts,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCategory = categories.find((c) => c.id === selectedCategory);
  const isFiltered = selectedCategory !== 'all';

  // Handle click outside and Escape key to close popover
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('touchstart', handlePointerDown);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (categoryId: string) => {
    onSelectCategory(categoryId);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectCategory('all');
  };

  return (
    <div ref={containerRef} className={`relative shrink-0 ${className}`}>
      {/* Filter Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`h-10 px-3 sm:px-3.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#121214] active:scale-[0.98] ${
          isFiltered
            ? 'bg-[#121214] text-white border-[#121214] shadow-xs'
            : 'bg-white text-[#121214] border-[#D5D2C9] hover:bg-[#FAF9F5] hover:border-[#121214] shadow-2xs'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={isFiltered ? `Filter aktif: ${activeCategory?.name}` : 'Buka filter kategori'}
      >
        <Filter className={`w-3.5 h-3.5 shrink-0 ${isFiltered ? 'text-white' : 'text-[#75726B]'}`} />
        
        {isFiltered ? (
          <span className="max-w-[100px] sm:max-w-[140px] truncate">
            {activeCategory?.name || 'Kategori'}
          </span>
        ) : (
          <span>Filter</span>
        )}

        {isFiltered ? (
          <span
            onClick={handleClear}
            role="button"
            tabIndex={0}
            title="Reset filter kategori"
            className="p-0.5 ml-0.5 rounded hover:bg-white/20 active:bg-white/30 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </span>
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#75726B] shrink-0 transition-transform duration-150 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {/* Popover Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-64 sm:w-72 max-w-[calc(100vw-32px)] bg-white rounded-xl border border-[#E5E2DA] shadow-xl z-50 p-2 space-y-1 animate-in fade-in duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#EAE8E2]">
            <span className="text-xs font-bold text-[#121214]">Filter Kategori</span>
            {isFiltered && (
              <button
                type="button"
                onClick={() => handleSelect('all')}
                className="text-[11px] font-mono text-[#75726B] hover:text-red-600 transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* List of Options */}
          <div className="max-h-64 sm:max-h-72 overflow-y-auto overscroll-contain py-1 space-y-0.5">
            {/* "Semua Kategori" Option */}
            <button
              type="button"
              onClick={() => handleSelect('all')}
              className={`w-full min-h-[40px] px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer text-left ${
                selectedCategory === 'all'
                  ? 'bg-[#F5F4EE] font-bold text-[#121214]'
                  : 'text-[#605D57] hover:bg-[#FAF9F5] hover:text-[#121214]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="truncate">Semua Kategori</span>
                {totalCount !== undefined && (
                  <span className="text-[10px] font-mono text-[#75726B] px-1.5 py-0.5 rounded bg-[#EAE8E2]">
                    {totalCount}
                  </span>
                )}
              </div>
              {selectedCategory === 'all' && <Check className="w-3.5 h-3.5 text-[#121214] shrink-0" />}
            </button>

            {/* Category Items */}
            {categories.map((cat) => {
              const count = categoryCounts ? categoryCounts[cat.id] : undefined;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelect(cat.id)}
                  className={`w-full min-h-[40px] px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#F5F4EE] font-bold text-[#121214]'
                      : 'text-[#605D57] hover:bg-[#FAF9F5] hover:text-[#121214]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="truncate">{cat.name}</span>
                    {count !== undefined && (
                      <span className="text-[10px] font-mono text-[#75726B] px-1.5 py-0.5 rounded bg-[#EAE8E2] shrink-0">
                        {count}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#121214] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
