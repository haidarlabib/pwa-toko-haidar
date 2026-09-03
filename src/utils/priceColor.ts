import type { PriceChangeType } from '../types/database.types';

/**
 * Calculates price change classification based on old and new price.
 * Follows PRD Section 13 strictly:
 * new_price > old_price -> PRICE INCREASE
 * new_price < old_price -> PRICE DECREASE
 * new_price = old_price -> NO PRICE CHANGE
 */
export function getPriceChangeType(oldPrice: number, newPrice: number): PriceChangeType {
  if (newPrice > oldPrice) return 'INCREASE';
  if (newPrice < oldPrice) return 'DECREASE';
  return 'NO_CHANGE';
}

/**
 * Returns UI styling tokens according to Business Rules BR-06..BR-09:
 * - Old price: neutral gray
 * - New price increase: red (HARGA NAIK)
 * - New price decrease: green (HARGA TURUN)
 */
export function getPriceChangeVisuals(changeType: PriceChangeType) {
  switch (changeType) {
    case 'INCREASE':
      return {
        label: 'HARGA NAIK',
        textClass: 'text-red-600 font-semibold',
        bgClass: 'bg-red-50',
        borderClass: 'border-red-200',
        badgeClass: 'bg-red-100 text-red-700 border border-red-200',
        iconType: 'up',
      };
    case 'DECREASE':
      return {
        label: 'HARGA TURUN',
        textClass: 'text-emerald-600 font-semibold',
        bgClass: 'bg-emerald-50',
        borderClass: 'border-emerald-200',
        badgeClass: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
        iconType: 'down',
      };
    default:
      return {
        label: 'TETAP',
        textClass: 'text-slate-600 font-medium',
        bgClass: 'bg-slate-50',
        borderClass: 'border-slate-200',
        badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
        iconType: 'same',
      };
  }
}

export const OLD_PRICE_CLASS = 'text-slate-400 line-through';
