<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { ApexOptions } from 'apexcharts';
import { useChartTheme, brlExact } from '@/utils/chartTheme';
import { projectRecurring } from '@/utils/recurrence';
import { useRecurringTransactionStore } from '@/stores/recurringTransactionStore';
import MoneyValue from '@/components/ui/MoneyValue.vue';
import type { CompanyMemberDto } from '@/services/companyService';

const props = defineProps<{
  members: CompanyMemberDto[];
  membersLoading?: boolean;
}>();

const recurringStore = useRecurringTransactionStore();
const chartTheme = useChartTheme();

onMounted(async () => {
  if (recurringStore.items.length === 0 && !recurringStore.loading) {
    await recurringStore.fetchRecurringTransactions();
  }
});

const activeRules = computed(() =>
  recurringStore.items.filter((r) => r.status === 'active'),
);

const projections = computed(() =>
  projectRecurring(recurringStore.items, 12),
);

// Média mensal ou primeiro mês de compromisso recorrente de saída
const monthlyDebitCommitment = computed(() => {
  if (projections.value.length === 0) return 0;
  return projections.value[0]?.debit ?? 0;
});

const total12Debit = computed(() =>
  projections.value.reduce((sum, p) => sum + p.debit, 0),
);

const total12Credit = computed(() =>
  projections.value.reduce((sum, p) => sum + p.credit, 0),
);

const summarySentence = computed(() => {
  if (recurringStore.loading) {
    return 'Carregando projeções recorrentes...';
  }
  if (recurringStore.error) {
    return 'Não foi possível carregar a projeção de recorrências.';
  }
  if (activeRules.value.length === 0) {
    return 'Nenhuma recorrência ativa programada para os próximos 12 meses.';
  }
  return `Nos próximos 12 meses, a previsão é de ${brlExact(total12Debit.value)} em saídas e ${brlExact(total12Credit.value)} em entradas recorrentes.`;
});

const chartSeries = computed(() => [
  {
    name: 'Saídas recorrentes',
    data: projections.value.map((p) => p.debit),
  },
  {
    name: 'Entradas recorrentes',
    data: projections.value.map((p) => p.credit),
  },
]);

const chartOptions = computed<ApexOptions>(() => {
  const theme = chartTheme.value;
  return {
    ...theme.base,
    chart: {
      ...theme.base.chart,
      type: 'bar',
      stacked: false,
    },
    colors: [theme.colors.expense, theme.colors.income],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '46%',
      },
    },
    xaxis: {
      ...theme.base.xaxis,
      categories: projections.value.map((p) => p.label),
    },
  };
});
</script>

<template>
  <div class="overview-container">
    <!-- Indicadores Numéricos Principais -->
    <section class="lg-section" aria-labelledby="overview-figures-heading">
      <h2 id="overview-figures-heading" class="sr-only">Indicadores gerais da empresa</h2>

      <div class="lg-figures">
        <div class="lg-figure">
          <span class="lg-figure-label">Membros com acesso</span>
          <span class="lg-figure-value">{{ membersLoading ? '—' : members.length }}</span>
        </div>

        <div class="lg-figure">
          <span class="lg-figure-label">Recorrências ativas</span>
          <span class="lg-figure-value">{{ recurringStore.loading ? '—' : activeRules.length }}</span>
        </div>

        <div class="lg-figure">
          <span class="lg-figure-label">Compromisso do mês em recorrências</span>
          <span v-if="recurringStore.loading" class="lg-figure-value is-muted">
            —
          </span>
          <span v-else-if="recurringStore.error" class="lg-figure-value is-muted" style="font-size: 1rem;">
            Indisponível
          </span>
          <span v-else class="lg-figure-value is-expense">
            <MoneyValue :value="monthlyDebitCommitment" :signed="true" />
          </span>
        </div>
      </div>
    </section>

    <!-- Gráfico de Projeção em 12 Meses -->
    <section class="lg-section" aria-labelledby="overview-chart-heading">
      <header class="lg-section-head">
        <div>
          <h2 id="overview-chart-heading" class="lg-h2">
            Compromissos recorrentes nos próximos 12 meses
          </h2>
          <p class="lg-note">
            Valores programados com base nas regras de recorrência ativas.
          </p>
        </div>

        <div class="lg-legend" aria-label="Legendas do gráfico de projeção">
          <span class="is-expense">Saídas</span>
          <span class="is-income">Entradas</span>
        </div>
      </header>

      <p class="chart-summary-phrase">
        {{ summarySentence }}
      </p>

      <div v-if="recurringStore.loading" class="lg-empty">
        Carregando projeções recorrentes...
      </div>

      <div v-else-if="recurringStore.error" class="lg-empty">
        <p class="lg-error">{{ recurringStore.error }}</p>
        <button
          type="button"
          class="lg-btn lg-btn--quiet"
          style="margin-top: 8px;"
          @click="recurringStore.fetchRecurringTransactions()"
        >
          Tentar carregar projeções novamente
        </button>
      </div>

      <div v-else-if="activeRules.length === 0" class="lg-empty">
        Nenhum compromisso recorrente ativo cadastrado no momento.
      </div>

      <div v-else class="lg-chart">
        <apexchart
          type="bar"
          height="280"
          :options="chartOptions"
          :series="chartSeries"
        />
      </div>

      <!-- Tabela alternativa acessível -->
      <details class="lg-details">
        <summary>Ver projeção mensal em tabela</summary>
        <table class="lg-table" aria-label="Projeção mês a mês de recorrências">
          <thead>
            <tr>
              <th scope="col">Mês</th>
              <th scope="col" class="lg-num">Saídas</th>
              <th scope="col" class="lg-num">Entradas</th>
              <th scope="col" class="lg-num">Resultado líquido</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in projections" :key="row.key">
              <th scope="row">{{ row.label }}</th>
              <td class="lg-num is-expense">
                <MoneyValue :value="-row.debit" :signed="true" />
              </td>
              <td class="lg-num is-income">
                <MoneyValue :value="row.credit" :signed="true" />
              </td>
              <td class="lg-num" :class="row.credit - row.debit >= 0 ? 'is-income' : 'is-expense'">
                <MoneyValue :value="row.credit - row.debit" :signed="true" />
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total previsto (12 meses)</th>
              <td class="lg-num is-expense">
                <MoneyValue :value="-total12Debit" :signed="true" />
              </td>
              <td class="lg-num is-income">
                <MoneyValue :value="total12Credit" :signed="true" />
              </td>
              <td class="lg-num" :class="total12Credit - total12Debit >= 0 ? 'is-income' : 'is-expense'">
                <MoneyValue :value="total12Credit - total12Debit" :signed="true" />
              </td>
            </tr>
          </tfoot>
        </table>
      </details>
    </section>
  </div>
</template>

<style scoped>
.overview-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chart-summary-phrase {
  margin-bottom: 12px;
  font-size: 0.875rem;
  color: var(--lg-ink-2);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
