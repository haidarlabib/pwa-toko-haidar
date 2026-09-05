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

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`h-9 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap select-none ${
          isFiltered
            ? 'bg-[#121214] text-white border-[#121214] shadow-xs'
            : 'bg-[#FAF9F5] text-[#121214] border-[#D5D2C9] hover:bg-[#F0EEE6] hover:border-[#121214]'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Filter className={`w-3.5 h-3.5 ${isFiltered ? 'text-white' : 'text-[#75726B]'}`} />
        <span>
          {isFiltered ? `Filter · ${activeCategory?.name || 'Kategori'}` : 'Semua Kategori'}
        </span>

        {isFiltered ? (
          <span
            onClick={handleClear}
            role="button"
            tabIndex={0}
            title="Hapus filter"
            className="ml-1 p-0.5 rounded hover:bg-white/20 transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </span>
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#75726B] transition-transform duration-150 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto mt-1.5 w-64 sm:w-72 bg-white rounded-xl border border-[#E5E2DA] shadow-xl z-50 p-2 space-y-1 animate-in fade-in duration-150">
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
          <div className="max-h-64 overflow-y-auto py-1 space-y-0.5">
            {/* All Categories Option */}
            <button
              type="button"
              onClick={() => handleSelect('all')}
              className={`w-full min-h-[38px] px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer text-left ${
                selectedCategory === 'all'
                  ? 'bg-[#F5F4EE] font-bold text-[#121214]'
                  : 'text-[#605D57] hover:bg-[#FAF9F5] hover:text-[#121214]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>Semua Kategori</span>
                {totalCount !== undefined && (
                  <span className="text-[10px] font-mono text-[#75726B] px-1.5 py-0.2 rounded bg-[#EAE8E2]">
                    {totalCount}
                  </span>
                )}
              </div>
              {selectedCategory === 'all' && <Check className="w-3.5 h-3.5 text-[#121214]" />}
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
                  className={`w-full min-h-[38px] px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#F5F4EE] font-bold text-[#121214]'
                      : 'text-[#605D57] hover:bg-[#FAF9F5] hover:text-[#121214]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate">{cat.name}</span>
                    {count !== undefined && (
                      <span className="text-[10px] font-mono text-[#75726B] px-1.5 py-0.2 rounded bg-[#EAE8E2]">
                        {count}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#121214]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
