import { SECTOR_LABELS } from '@/lib/sectors';

export function formatDate(dateString: string | null | undefined) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateLong(dateString: string | null | undefined) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string | null | undefined) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatKes(amount: number | null | undefined) {
  if (amount === null || amount === undefined) return 'KES 0';
  return 'KES ' + amount.toLocaleString('en-KE');
}

export function daysUntil(dateString: string | null | undefined) {
  if (!dateString) return 0;
  const now = new Date();
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function shortSector(code: string | null | undefined) {
  if (!code) return 'Other';
  const full = SECTOR_LABELS[code];
  if (!full) return code;
  const idx = full.indexOf('(');
  if (idx === -1) return full;
  return full.substring(0, idx).trim();
}

export function safeFilename(name: string | null | undefined) {
  if (!name) return 'Document';
  return name.replace(/[^a-zA-Z0-9]/g, '-');
}

export function humanizeAction(action: string | null | undefined) {
  if (!action) return '';
  return String(action).replace(/_/g, ' ');
}

export function formatRelativeDay(days: number) {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 1) return 'In ' + days + ' days';
  return Math.abs(days) + ' days ago';
}