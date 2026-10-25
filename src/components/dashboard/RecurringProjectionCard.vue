<script setup lang="ts">
import { computed } from 'vue';
import type { ApexOptions } from 'apexcharts';
import { useRecurringTransactionStore } from '@/stores/recurringTransactionStore';
import { projectRecurring } from '@/utils/recurrence';
import { useChartTheme, brl, brlExact } from '@/utils/chartTheme';
import MoneyValue from '@/components/ui/MoneyValue.vue';

const recurringStore = useRecurringTransactionStore();
const theme = useChartTheme();

const projections = computed(() => projectRecurring(recurringStore.items, 6));

const totalCredit = computed(() => projections.value.reduce((sum, p) => sum + p.credit, 0));
const totalDebit = computed(() => projections.value.reduce((sum, p) => sum + p.debit, 0));
const netProjected = computed(() => totalCredit.value - totalDebit.value);

const hasRecurringData = computed(() => totalCredit.value > 0 || totalDebit.value > 0);

const series = computed(() => [
  {
    name: 'Receitas recorrentes',
    data: projections.value.map((p) => p.credit),
  },
  {
    name: 'Despesas recorrentes',
    data: projections.value.map((p) => p.debit),
  },
]);

const chartOptions = computed<ApexOptions>(() => {
  const { colors, base } = theme.value;
  return {
    ...base,
    chart: {
      ...base.chart,
      type: 'bar',
      stacked: true,
    },
    colors: [colors.income, colors.expense],
    tooltip: {
      ...base.tooltip,
      y: {
        formatter: (val: number) => brlExact(val),
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        borderRadius: 4,
        borderRadiusApplication: 'end',
      },
    },
    xaxis: {
      ...base.xaxis,
      categories: projections.value.map((p) => p.label),
    },
    yaxis: {
      ...base.yaxis,
      labels: {
        formatter: brl,
        style: { fontSize: '11px', colors: [colors.muted] },
      },
    },
  };
});
</script>

<template>
  <section class="lg-section" aria-labelledby="recurring-projection-title">
    <div class="lg-section-head">
      <div>
        <h2 id="recurring-projection-title" class="lg-h2">Compromissos recorrentes: próximos 6 meses</h2>
        <p class="lg-note">Projeção de débitos e créditos com base nas regras ativas</p>
      </div>

      <div class="lg-legend" aria-label="Legenda dos compromissos recorrentes">
        <span class="is-income">Receitas: <MoneyValue :value="totalCredit" /></span>
        <span class="is-expense">Despesas: <MoneyValue :value="totalDebit" /></span>
      </div>
    </div>

    <!-- Gráfico de Colunas Empilhadas -->
    <div v-if="hasRecurringData" class="lg-chart">
      <apexchart
        type="bar"
        height="280"
        :options="chartOptions"
        :series="series"
      />
    </div>

    <div v-else class="lg-empty">
      Nenhum compromisso recorrente ativo cadastrado no momento.
    </div>

    <!-- Resumo textual de 1 frase -->
    <p v-if="hasRecurringData" class="lg-note" aria-live="polite">
      Nos próximos 6 meses, estão previstos
      <MoneyValue :value="totalCredit" signed /> em receitas e
      <MoneyValue :value="-totalDebit" signed /> em despesas fixas, resultando em
      <MoneyValue :value="netProjected" signed :class="netProjected >= 0 ? 'is-income' : 'is-expense'" />.
    </p>

    <!-- Tabela Acessível -->
    <details v-if="hasRecurringData" class="lg-details">
      <summary>Ver projeção de recorrências em tabela</summary>
      <table class="lg-table">
        <caption class="sr-only">Projeção mensal de lançamentos recorrentes</caption>
        <thead>
          <tr>
            <th scope="col">Mês</th>
            <th scope="col" class="lg-num">Receitas previstas</th>
            <th scope="col" class="lg-num">Despesas previstas</th>
            <th scope="col" class="lg-num">Saldo líquido previsto</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in projections" :key="p.key">
            <td>{{ p.label }}</td>
            <td class="lg-num is-income">
              <MoneyValue :value="p.credit" signed />
            </td>
            <td class="lg-num is-expense">
              <MoneyValue :value="-p.debit" signed />
            </td>
            <td class="lg-num" :class="p.credit - p.debit >= 0 ? 'is-income' : 'is-expense'">
              <MoneyValue :value="p.credit - p.debit" signed />
            </td>
          </tr>
        </tbody>
      </table>
    </details>
  </section>
</template>
