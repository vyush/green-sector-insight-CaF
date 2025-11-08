export type TimePoint = { date: string | number | Date; close: number; [k: string]: any };

/**
 * Shift a time series so its last date becomes `targetDate` (defaults to today).
 * Preserves relative spacing between points and original values.
 */
export const shiftSeriesDatesToTarget = (series: TimePoint[], targetDate: Date = new Date()): TimePoint[] => {
  if (!Array.isArray(series) || series.length === 0) return series;

  const parse = (d: string | number | Date) => (d instanceof Date ? d : new Date(d));
  const first = parse(series[0].date).getTime();
  const last = parse(series[series.length - 1].date).getTime();

  if (isNaN(first) || isNaN(last) || last === first) {
    // fallback: spread points evenly ending at targetDate
    const step = 24 * 60 * 60 * 1000;
    return series.map((p, i) => ({ ...p, date: new Date(targetDate.getTime() - (series.length - 1 - i) * step) }));
  }

  const delta = targetDate.getTime() - last;
  return series.map((p) => {
    const dt = parse(p.date);
    return { ...p, date: new Date(dt.getTime() + delta) };
  });
};