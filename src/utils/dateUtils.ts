/**
 * Date utility for consistent Asia/Kolkata (IST +05:30) calendar calculations
 */

export function getTodayDateString(timezoneOffsetMinutes: number = 330): string {
  // Asia/Kolkata is UTC+5:30 (330 minutes)
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utc + (timezoneOffsetMinutes * 60000));
  return istTime.toISOString().split('T')[0];
}

export function getYesterdayDateString(timezoneOffsetMinutes: number = 330): string {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utc + (timezoneOffsetMinutes * 60000));
  istTime.setDate(istTime.getDate() - 1);
  return istTime.toISOString().split('T')[0];
}

export function getDatesDiffInDays(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1 + 'T00:00:00Z');
  const d2 = new Date(dateStr2 + 'T00:00:00Z');
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function isSameDay(dateStr1: string, dateStr2: string): boolean {
  return dateStr1 === dateStr2;
}

export function isConsecutiveDay(previousDateStr: string, currentDateStr: string): boolean {
  const prev = new Date(previousDateStr + 'T00:00:00Z');
  const current = new Date(currentDateStr + 'T00:00:00Z');
  const diffTime = current.getTime() - prev.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

export function getStartOfWeek(dateStr?: string): string {
  const base = dateStr ? new Date(dateStr + 'T00:00:00Z') : new Date();
  const day = base.getUTCDay();
  const diff = base.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday as start of week
  const monday = new Date(base.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
