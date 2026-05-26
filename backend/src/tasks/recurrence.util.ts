import { TaskFrequency } from '@prisma/client';

export function addPeriod(
  date: Date,
  frequency: TaskFrequency,
  count = 1,
): Date {
  const d = new Date(date);
  switch (frequency) {
    case 'daily':
      d.setUTCDate(d.getUTCDate() + count);
      return d;
    case 'weekly':
      d.setUTCDate(d.getUTCDate() + 7 * count);
      return d;
    case 'monthly':
      d.setUTCMonth(d.getUTCMonth() + count);
      return d;
    case 'quarterly':
      d.setUTCMonth(d.getUTCMonth() + 3 * count);
      return d;
    case 'yearly':
      d.setUTCFullYear(d.getUTCFullYear() + count);
      return d;
    case 'none':
    default:
      return d;
  }
}

export function startOfUtcDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function diffInDays(later: Date, earlier: Date): number {
  const ms = startOfUtcDay(later).getTime() - startOfUtcDay(earlier).getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}
