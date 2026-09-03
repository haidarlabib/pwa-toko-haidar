import type { Product, StockCheck, DayOfWeek } from '../types/database.types';
import { getCurrentDay, getJakartaNow } from './datetime';

export type DayOfWeekEnum =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export const DAY_ENUM_TO_INDONESIAN: Record<DayOfWeekEnum, DayOfWeek> = {
  MONDAY: 'Senin',
  TUESDAY: 'Selasa',
  WEDNESDAY: 'Rabu',
  THURSDAY: 'Kamis',
  FRIDAY: 'Jumat',
  SATURDAY: 'Sabtu',
  SUNDAY: 'Minggu',
};

export const INDONESIAN_TO_DAY_ENUM: Record<DayOfWeek, DayOfWeekEnum> = {
  Senin: 'MONDAY',
  Selasa: 'TUESDAY',
  Rabu: 'WEDNESDAY',
  Kamis: 'THURSDAY',
  Jumat: 'FRIDAY',
  Sabtu: 'SATURDAY',
  Minggu: 'SUNDAY',
};

export interface ProductInspectionScheduleRecord {
  id: string;
  product_id: string;
  day_of_week: DayOfWeekEnum;
  created_at: string;
  updated_at: string;
}

/**
 * Returns today's Day of Week Enum in Asia/Jakarta timezone
 */
export function getTodayDayOfWeek(): DayOfWeekEnum {
  const currentIndonesianDay = getCurrentDay();
  return INDONESIAN_TO_DAY_ENUM[currentIndonesianDay];
}

/**
 * Checks whether a product is scheduled for inspection today (PRD Section 129)
 */
export function isProductScheduledToday(product: Product, date: Date = getJakartaNow()): boolean {
  if (!product.is_active) return false;
  if (!product.inspection_days || product.inspection_days.length === 0) return false;

  const dayIndex = date.getDay();
  const indonesianDays: DayOfWeek[] = [
    'Minggu',
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
  ];
  const targetDay = indonesianDays[dayIndex];

  return product.inspection_days.includes(targetDay);
}

/**
 * Filters products that are scheduled for today
 */
export function getScheduledProductsForToday(products: Product[], date: Date = getJakartaNow()): Product[] {
  return products.filter((p) => isProductScheduledToday(p, date));
}

/**
 * Evaluates completion status for a scheduled product on today's date
 */
export function getInspectionStatusForToday(
  productId: string,
  todayChecks: StockCheck[]
): { isChecked: boolean; check?: StockCheck } {
  const check = todayChecks.find((c) => c.product_id === productId);
  return {
    isChecked: !!check,
    check,
  };
}
