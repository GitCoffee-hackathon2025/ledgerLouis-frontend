<script setup lang="ts">
import { computed } from 'vue';
import type { ApexOptions } from 'apexcharts';
import type { TransactionDto } from '@/services/transactionService';
import MoneyValue from '@/components/ui/MoneyValue.vue';
import { useTagStore } from '@/stores/tagStore';
import { useChartTheme, brl } from '@/utils/chartTheme';

const props = defineProps<{
  transactions?: TransactionDto[];
}>();

const tagStore = useTagStore();
const theme = useChartTheme();

interface TagExpenseItem {
  id: string;
  name: string;
  total: number;
  count: number;
}

const tagExpenses = computed<TagExpenseItem[]>(() => {
  const txs = props.transactions ?? [];
  const debitTxs = txs.filter((t) => t.entryType === 'debit');

  const totals = new Map<string, { total: number; count: number }>();
  for (const t of debitTxs) {
    const tags = tagStore.transactionTagsMap[t.id] ?? [];
    for (const tag of tags) {
      const current = totals.get(tag.id) ?? { total: 0, count: 0 };
      current.total += t.amount;
      current.count += 1;
      totals.set(tag.id, current);
    }
  }

  return tagStore.tags
    .map((tag) => {
      const data = totals.get(tag.id) ?? { total: 0, count: 0 };
      return {
        id: tag.id,
        name: tag.name,
        total: data.total,
        count: data.count,
      };
    })
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);
});

const totalTaggedExpense = computed(() =>
  tagExpenses.value.reduce((sum, item) => sum + item.total, 0),
);

const topTag = computed(() => tagExpenses.value[0] ?? null);

const topTagPercentage = computed(() => {
  if (!topTag.value || totalTaggedExpense.value === 0) return 0;
  return Math.round((topTag.value.total / totalTaggedExpense.value) * 100);
});

// Exibe as 6 maiores tags no gráfico horizontal
const chartTags = computed(() => tagExpenses.value.slice(0, 6));

const series = computed(() => [
  {
    name: 'Despesas',
    data: chartTags.value.map((t) => t.total),
  },
]);

const chartOptions = computed<ApexOptions>(() => {
  const { colors, base } = theme.value;
  return {
    ...base,
    chart: {
      ...base.chart,
      type: 'bar',
    },
    colors: [colors.expense],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: '50%',
      },
    },
    xaxis: {
      ...base.xaxis,
      categories: chartTags.value.map((t) => t.name),
      labels: {
        formatter: brl,
        style: { fontSize: '11px', colors: [colors.muted] },
      },
    },
    yaxis: {
      ...base.yaxis,
      labels: {
        style: { fontSize: '12px', colors: [colors.muted] },
      },
    },
  };
});
</script>

<template>
  <section class="lg-section" aria-labelledby="tags-dist-title">
    <div class="lg-section-head">
      <div>
        <h2 id="tags-dist-title" class="lg-h2">Para onde vai o dinheiro</h2>
        <p class="lg-note">Distribuição das despesas por etiqueta</p>
      </div>

      <div class="lg-legend" aria-label="Legenda de despesas por etiqueta">
        <span class="is-expense">Total: <MoneyValue :value="totalTaggedExpense" /></span>
      </div>
    </div>

    <!-- Gráfico Horizontal -->
    <div v-if="tagExpenses.length > 0" class="lg-chart">
      <apexchart
        type="bar"
        height="280"
        :options="chartOptions"
        :series="series"
      />
    </div>

    <div v-else class="lg-empty">
      Nenhuma despesa associada a etiquetas no período.
    </div>

    <!-- Resumo textual -->
    <p v-if="topTag" class="lg-note" aria-live="polite">
      A maior despesa identificada foi em <strong>{{ topTag.name }}</strong> com
      <MoneyValue :value="topTag.total" />, representando {{ topTagPercentage }}% das despesas categorizadas.
    </p>

    <!-- Tabela Acessível -->
    <details v-if="tagExpenses.length > 0" class="lg-details">
      <summary>Ver lista completa de etiquetas em tabela</summary>
      <table class="lg-table">
        <caption class="sr-only">Despesas divididas por etiqueta</caption>
        <thead>
          <tr>
            <th scope="col">Etiqueta</th>
            <th scope="col">Lançamentos</th>
            <th scope="col" class="lg-num">Total gasto</th>
            <th scope="col" class="lg-num">Participação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tag in tagExpenses" :key="tag.id">
            <td>
              <button
                type="button"
                class="tag-table-filter-btn"
                :class="{ 'is-active': tagStore.activeTagId === tag.id }"
                @click="tagStore.setActiveTag(tagStore.activeTagId === tag.id ? null : tag.id)"
              >
                {{ tag.name }}
              </button>
            </td>
            <td>{{ tag.count }}</td>
            <td class="lg-num is-expense">
              <MoneyValue :value="tag.total" />
            </td>
            <td class="lg-num">
              {{ totalTaggedExpense > 0 ? Math.round((tag.total / totalTaggedExpense) * 100) : 0 }}%
            </td>
          </tr>
        </tbody>
      </table>
    </details>
  </section>
</template>

<style scoped>
.tag-table-filter-btn {
  background: transparent;
  border: none;
  padding: 0;
  color: var(--lg-ink);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.tag-table-filter-btn.is-active {
  color: var(--lg-projection);
}
</style>
