import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateLong,
  formatDateTime,
  formatKes,
  daysUntil,
  shortSector,
  safeFilename,
  humanizeAction,
  formatRelativeDay,
} from '../format';

describe('formatDate', () => {
  it('formats a valid date', () => {
    expect(formatDate('2026-01-15')).toContain('2026');
    expect(formatDate('2026-01-15')).toContain('Jan');
  });

  it('returns dash for null', () => {
    expect(formatDate(null)).toBe('-');
  });

  it('returns dash for undefined', () => {
    expect(formatDate(undefined)).toBe('-');
  });

  it('returns dash for empty string', () => {
    expect(formatDate('')).toBe('-');
  });
});

describe('formatDateLong', () => {
  it('formats a valid date in long form', () => {
    const result = formatDateLong('2026-01-15');
    expect(result).toContain('January');
    expect(result).toContain('2026');
  });

  it('returns dash for null', () => {
    expect(formatDateLong(null)).toBe('-');
  });
});

describe('formatDateTime', () => {
  it('formats a valid datetime', () => {
    const result = formatDateTime('2026-01-15T10:30:00Z');
    expect(result).toContain('2026');
    expect(result).toContain('Jan');
  });

  it('returns dash for null', () => {
    expect(formatDateTime(null)).toBe('-');
  });
});

describe('formatKes', () => {
  it('formats a positive number with commas', () => {
    expect(formatKes(10000)).toBe('KES 10,000');
    expect(formatKes(1000000)).toBe('KES 1,000,000');
  });

  it('formats zero', () => {
    expect(formatKes(0)).toBe('KES 0');
  });

  it('handles null as zero', () => {
    expect(formatKes(null)).toBe('KES 0');
  });

  it('handles undefined as zero', () => {
    expect(formatKes(undefined)).toBe('KES 0');
  });
});

describe('daysUntil', () => {
  it('returns 0 for today', () => {
    const today = new Date().toISOString();
    expect(daysUntil(today)).toBe(0);
  });

  it('returns positive days for future date', () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const result = daysUntil(future);
    expect(result).toBeGreaterThanOrEqual(6);
    expect(result).toBeLessThanOrEqual(8);
  });

  it('returns negative days for past date', () => {
    const past = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const result = daysUntil(past);
    expect(result).toBeLessThan(0);
  });

  it('returns 0 for null', () => {
    expect(daysUntil(null)).toBe(0);
  });

  it('returns 0 for undefined', () => {
    expect(daysUntil(undefined)).toBe(0);
  });
});

describe('shortSector', () => {
  it('strips the parenthetical for known sectors', () => {
    expect(shortSector('education')).toBe('Education');
    expect(shortSector('healthcare')).toBe('Healthcare');
  });

  it('returns the code if the sector is unknown', () => {
    expect(shortSector('made_up')).toBe('made_up');
  });

  it('returns Other for null', () => {
    expect(shortSector(null)).toBe('Other');
  });

  it('returns Other for undefined', () => {
    expect(shortSector(undefined)).toBe('Other');
  });
});

describe('safeFilename', () => {
  it('strips non alphanumeric characters', () => {
    expect(safeFilename('Riverside Medical Centre')).toBe('Riverside-Medical-Centre');
  });

  it('handles spaces and special characters', () => {
    expect(safeFilename('Acme & Co. (2026)')).toBe('Acme---Co---2026-');
  });

  it('returns Document for null', () => {
    expect(safeFilename(null)).toBe('Document');
  });

  it('returns Document for undefined', () => {
    expect(safeFilename(undefined)).toBe('Document');
  });
});

describe('humanizeAction', () => {
  it('replaces underscores with spaces', () => {
    expect(humanizeAction('client_created')).toBe('client created');
  });

  it('handles multiple underscores', () => {
    expect(humanizeAction('firm_created_by_admin')).toBe('firm created by admin');
  });

  it('returns empty string for null', () => {
    expect(humanizeAction(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(humanizeAction(undefined)).toBe('');
  });
});

describe('formatRelativeDay', () => {
  it('returns Today for 0', () => {
    expect(formatRelativeDay(0)).toBe('Today');
  });

  it('returns Tomorrow for 1', () => {
    expect(formatRelativeDay(1)).toBe('Tomorrow');
  });

  it('returns Yesterday for negative one', () => {
    expect(formatRelativeDay(-1)).toBe('Yesterday');
  });

  it('returns In X days for positive values', () => {
    expect(formatRelativeDay(5)).toBe('In 5 days');
  });

  it('returns X days ago for negative values', () => {
    expect(formatRelativeDay(-5)).toBe('5 days ago');
  });
});