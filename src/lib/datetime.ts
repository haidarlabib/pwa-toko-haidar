import { useState, useEffect } from 'react';
import type { DayOfWeek } from '../types/database.types';

export const APP_TIMEZONE = 'Asia/Jakarta';

export const DAY_NAMES_ID: DayOfWeek[] = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Returns current Date object converted to Asia/Jakarta timezone (PRD v2.0 Section 9)
 */
export function getJakartaNow(): Date {
  // Using Intl format to reliably parse Jakarta time components
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(now);

  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  return new Date(
    Number(partMap.year),
    Number(partMap.month) - 1,
    Number(partMap.day),
    Number(partMap.hour || 0),
    Number(partMap.minute || 0),
    Number(partMap.second || 0)
  );
}

/**
 * Current date string: YYYY-MM-DD in Asia/Jakarta
 */
export function getCurrentDate(): string {
  const d = getJakartaNow();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateString(): string {
  return getCurrentDate();
}

/**
 * Current time string: HH:mm in Asia/Jakarta
 */
export function getCurrentTime(): string {
  const d = getJakartaNow();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Current Day of Week in Indonesian: 'Senin', 'Selasa', etc.
 */
export function getCurrentDay(): DayOfWeek {
  const d = getJakartaNow();
  return DAY_NAMES_ID[d.getDay()];
}

/**
 * Current ISO string in Jakarta context
 */
export function getCurrentDateTime(): string {
  return new Date().toISOString();
}

/**
 * Formats ISO or Date string to Indonesian friendly date: e.g. "05 September 2026"
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const day = String(d.getDate()).padStart(2, '0');
    const month = MONTH_NAMES_ID[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Formats to time string: e.g. "13:42"
 */
export function formatTime(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

/**
 * Formats full datetime: e.g. "05 Sep 2026 · 13:42"
 */
export function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const day = String(d.getDate()).padStart(2, '0');
    const month = MONTH_NAMES_ID[d.getMonth()].slice(0, 3);
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} · ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

/**
 * Real-time clock hook (PRD v2.0 Section 10):
 * Live updates every second without requiring page reload.
 */
export function useRealtimeClock() {
  const [now, setNow] = useState<Date>(getJakartaNow());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(getJakartaNow());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const day = DAY_NAMES_ID[now.getDay()];
  const dateStr = formatDate(now.toISOString());
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return {
    day,
    date: dateStr,
    time: `${hours}:${minutes}`,
    timeWithSeconds: `${hours}:${minutes}:${seconds}`,
    fullDisplay: `${day}, ${dateStr} · ${hours}:${minutes} WIB`,
  };
}
