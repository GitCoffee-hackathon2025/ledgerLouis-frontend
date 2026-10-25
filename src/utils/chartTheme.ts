import { computed } from 'vue';
import type { ApexOptions } from 'apexcharts';
import { useThemeStore } from '@/stores/themeStore';

const read = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// Eixo: sem centavos para não poluir. Tooltip e totais: valor exato.
export const brl = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

export const brlExact = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

/**
 * Base comum dos gráficos ApexCharts nas cores da linguagem lg- (ledger.css).
 * Recalcula quando o tema muda; cada gráfico faz merge raso do que precisa.
 */
export function useChartTheme() {
  const themeStore = useThemeStore();

  return computed(() => {
    void themeStore.theme; // dependência reativa: as variáveis CSS mudam com o tema
    const colors = {
      income: read('--lg-income'),
      expense: read('--lg-expense'),
      projection: read('--lg-projection'),
      ink: read('--lg-ink'),
      muted: read('--lg-ink-3'),
      line: read('--lg-line'),
    };

    const base: ApexOptions = {
      chart: {
        background: 'transparent',
        foreColor: colors.muted,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: !matchMedia('(prefers-reduced-motion: reduce)').matches, speed: 450 },
      },
      theme: { mode: themeStore.theme },
      grid: { borderColor: colors.line, strokeDashArray: 0, padding: { left: 8, right: 8 } },
      dataLabels: { enabled: false },
      legend: { show: false },
      // Reta entre pontos: curva suave inventa valores intermediários que não existem
      stroke: { width: 2, curve: 'straight' },
      xaxis: {
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { fontSize: '12px' } },
      },
      yaxis: { labels: { formatter: brl, style: { fontSize: '12px' } } },
      tooltip: { theme: themeStore.theme, y: { formatter: brlExact } },
      states: { hover: { filter: { type: 'darken' } } },
    };

    return { colors, base };
  });
}
