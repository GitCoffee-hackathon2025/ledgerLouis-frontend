/**
 * Utilitários de manipulação de datas de negócio (calendário).
 * Evita conversões UTC implícitas de strings 'YYYY-MM-DD' que causam
 * desvios de fuso horário (ex: America/Sao_Paulo voltando para o mês anterior).
 */

export interface CalendarDate {
  year: number;
  month: number; // 1 - 12
  day: number; // 1 - 31
}

export function parseCalendarDate(value?: string | null): CalendarDate | null {
  if (!value) return null;
  const dateOnly = value.split('T')[0];
  if (!dateOnly) return null;
  const parts = dateOnly.split('-');
  if (parts.length !== 3) return null;

  const yStr = parts[0];
  const mStr = parts[1];
  const dStr = parts[2];
  if (!yStr || !mStr || !dStr) return null;

  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  const day = parseInt(dStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
}

export function toLocalMidnight(value?: string | null | Date): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);
  }
  const parsed = parseCalendarDate(value);
  if (!parsed) return null;
  return new Date(parsed.year, parsed.month - 1, parsed.day, 0, 0, 0, 0);
}

export function formatDateBr(value?: string | null): string {
  const parsed = parseCalendarDate(value);
  if (!parsed) return value || '';
  const day = String(parsed.day).padStart(2, '0');
  const month = String(parsed.month).padStart(2, '0');
  return `${day}/${month}/${parsed.year}`;
}

export function formatShortDate(value?: string | null): string {
  const parsed = parseCalendarDate(value);
  if (!parsed) return value || '';
  const localDate = new Date(parsed.year, parsed.month - 1, parsed.day, 12, 0, 0);
  return localDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
