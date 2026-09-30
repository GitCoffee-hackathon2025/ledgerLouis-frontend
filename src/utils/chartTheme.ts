import { computed } from 'vue';
import { useThemeStore } from '@/stores/themeStore';

/**
 * Cores dos gráficos (ApexCharts não lê CSS custom properties, então os
 * valores espelham os tokens de src/assets/styles/tokens.css).
 */
const palettes = {
  light: {
    income: '#12b76a',
    expense: '#e5484d',
    forecast: '#f59e0b',
    axis: '#8a93a3',
    grid: 'rgba(138, 147, 163, 0.18)',
    reference: '#a1aab8',
    markerStroke: '#ffffff',
  },
  dark: {
    income: '#2bd37f',
    expense: '#ff6b6e',
    forecast: '#fbbf24',
    axis: '#717b8b',
    grid: 'rgba(161, 170, 184, 0.12)',
    reference: '#717b8b',
    markerStroke: '#111720',
  },
} as const;

export function useChartTheme() {
  const themeStore = useThemeStore();
  const isDark = computed(() => themeStore.theme === 'dark');
  const colors = computed(() => palettes[isDark.value ? 'dark' : 'light']);

  const axisLabelStyle = computed(() => ({
    colors: colors.value.axis,
    fontSize: '12px',
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
  }));

  return { isDark, colors, axisLabelStyle };
}
