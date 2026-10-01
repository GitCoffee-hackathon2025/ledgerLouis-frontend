import { computed } from 'vue';

/**
 * Cores dos graficos. ApexCharts nao le CSS custom properties, entao os
 * valores espelham os tokens de src/assets/styles/tokens.css.
 * A identidade e escura apenas; `isDark` fica por compatibilidade com os cards.
 */
const colors = {
  income: '#34b585',
  expense: '#ee6b78',
  forecast: '#e8b24a',
  axis: '#6b7771',
  grid: 'rgba(255, 255, 255, 0.06)',
  reference: '#6b7771',
  markerStroke: '#101211',
} as const;

export function useChartTheme() {
  const isDark = computed(() => true);
  const themed = computed(() => colors);

  const axisLabelStyle = computed(() => ({
    colors: colors.axis,
    fontSize: '12px',
    fontFamily: 'Geist Variable, system-ui, sans-serif',
  }));

  return { isDark, colors: themed, axisLabelStyle };
}
