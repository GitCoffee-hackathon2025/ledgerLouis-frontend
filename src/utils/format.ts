const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatCurrency = (value: number) => currencyFormatter.format(value);

/** Valor com sinal: "+ R$ 10,00" para entradas e "- R$ 10,00" para saídas. */
export const formatSignedAmount = (amount: number, entryType: string) =>
  `${entryType === 'credit' ? '+' : '-'} ${formatCurrency(amount)}`;

/** Eixo de gráficos: "R$ 1,5k". */
export const formatCompactCurrency = (value: number) => `R$ ${Math.round(value / 100) / 10}k`;

export const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR');
};

/** Datas ISO "YYYY-MM-DD" vindas do backend, sem conversão de fuso. */
export const formatIsoDate = (value: string | null | undefined) => {
  if (!value) return '-';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

/** "Hoje, 14:30", "Ontem, 09:10" ou "12 de set." (com ano opcional). */
export const formatRelativeDate = (value: string, withYear = false) => {
  const date = new Date(value);
  const diffDays = Math.floor(Math.abs(Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (diffDays === 0) return `Hoje, ${time}`;
  if (diffDays === 1) return `Ontem, ${time}`;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  });
};

export const todayIso = () => new Date().toISOString().slice(0, 10);
