import type { RecurringFrequency, RecurringTransactionDto } from '@/services/recurringTransactionService';

// Mesma regra do back (src/shared/date/recurrence.ts): a n-ésima ocorrência é ancorada na data inicial,
// e o dia do mês é limitado ao último dia de meses curtos.
export function addOccurrences(startDate: string, frequency: RecurringFrequency, interval: number, n: number): string {
  const [year, month, day] = startDate.slice(0, 10).split('-').map(Number) as [number, number, number];
  if (frequency === 'weekly') {
    const d = new Date(Date.UTC(year, month - 1, day + n * interval * 7));
    return iso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  }
  const index = month - 1 + (frequency === 'monthly' ? n * interval : n * interval * 12);
  const y = year + Math.floor(index / 12);
  const m = (index % 12) + 1;
  return iso(y, m, Math.min(day, new Date(Date.UTC(y, m, 0)).getUTCDate()));
}

function iso(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function todayISO(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

/** Datas (YYYY-MM-DD) em que a regra lança, de `from` até `until`, inclusive. */
export function occurrencesBetween(
  rule: Pick<RecurringTransactionDto, 'startDate' | 'endDate' | 'frequency' | 'intervalValue'>,
  from: string,
  until: string,
): string[] {
  const dates: string[] = [];
  const interval = rule.intervalValue ?? 1;
  const last = rule.endDate && rule.endDate < until ? rule.endDate : until;
  // Começa perto de `from` (um passo antes, por segurança) em vez de enumerar desde o início da regra
  let n = Math.max(0, firstIndexNear(rule.startDate, rule.frequency, interval, from) - 1);
  for (let date = addOccurrences(rule.startDate, rule.frequency, interval, n); date <= last; ) {
    if (date >= from) dates.push(date);
    date = addOccurrences(rule.startDate, rule.frequency, interval, ++n);
  }
  return dates;
}

function firstIndexNear(start: string, frequency: RecurringFrequency, interval: number, from: string): number {
  if (from <= start) return 0;
  const [sy, sm, sd] = start.slice(0, 10).split('-').map(Number) as [number, number, number];
  const [fy, fm, fd] = from.split('-').map(Number) as [number, number, number];
  if (frequency === 'weekly') {
    const days = (Date.UTC(fy, fm - 1, fd) - Date.UTC(sy, sm - 1, sd)) / 86_400_000;
    return Math.floor(days / (7 * interval));
  }
  const months = (fy - sy) * 12 + (fm - sm);
  return Math.floor(months / (frequency === 'monthly' ? interval : 12 * interval));
}

export interface MonthProjection {
  key: string; // YYYY-MM
  label: string; // "nov. 26"
  credit: number;
  debit: number;
}

/** Soma o que as recorrências ativas vão lançar em cada um dos próximos `months` meses (o atual incluído). */
export function projectRecurring(rules: RecurringTransactionDto[], months: number, today = todayISO()): MonthProjection[] {
  const [y, m] = today.split('-').map(Number) as [number, number];
  const buckets: MonthProjection[] = Array.from({ length: months }, (_, i) => {
    const index = m - 1 + i;
    const year = y + Math.floor(index / 12);
    const month = (index % 12) + 1;
    const label = `${new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}/${String(year).slice(2)}`;
    return { key: `${year}-${String(month).padStart(2, '0')}`, label, credit: 0, debit: 0 };
  });
  const until = `${buckets[buckets.length - 1]!.key}-31`;

  for (const rule of rules) {
    if (rule.status !== 'active') continue;
    const from = rule.nextRunDate > today ? rule.nextRunDate : today;
    for (const date of occurrencesBetween(rule, from, until)) {
      const bucket = buckets.find((b) => b.key === date.slice(0, 7));
      if (bucket) bucket[rule.entryType] += Number(rule.amount);
    }
  }
  return buckets;
}
