<script setup lang="ts">
import { computed } from 'vue';
import { useTagStore } from '@/stores/tagStore';
import { useTransactionStore } from '@/stores/transactionStore';
import type { TransactionDto } from '@/services/transactionService';

const props = defineProps<{ transactions?: TransactionDto[] }>();

const tagStore = useTagStore();
const transactionStore = useTransactionStore();
const source = computed(() => props.transactions ?? transactionStore.transactions);

interface TagRankItem {
  id: string;
  name: string;
  total: number;
  count: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const tagRankings = computed<TagRankItem[]>(() => {
  const totals = new Map<string, { total: number; count: number }>();

  for (const transaction of source.value) {
    const tags = tagStore.transactionTagsMap[transaction.id] ?? [];
    for (const tag of tags) {
      const current = totals.get(tag.id) ?? { total: 0, count: 0 };
      current.total += transaction.amount;
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

const maxTotal = computed(() => {
  if (!tagRankings.value.length) return 1;
  return Math.max(...tagRankings.value.map((t) => t.total), 1);
});
</script>

<template>
  <section class="tag-ranking-card" aria-labelledby="tag-ranking-title">
    <header class="card-header">
      <div>
        <p class="card-kicker">Distribuição por etiquetas</p>
        <h2 id="tag-ranking-title" class="card-title">Valores associados por tag</h2>
      </div>
    </header>

    <div v-if="tagRankings.length === 0" class="empty-state">
      Nenhuma tag vinculada às transações filtradas.
    </div>

    <div v-else class="ranking-content">
      <ul class="ranking-list" role="list">
        <li
          v-for="(item, index) in tagRankings"
          :key="item.id"
          class="ranking-item"
        >
          <button
            type="button"
            class="ranking-row-btn"
            :class="{ 'is-selected': tagStore.activeTagId === item.id }"
            :aria-pressed="tagStore.activeTagId === item.id"
            @click="tagStore.setActiveTag(tagStore.activeTagId === item.id ? null : item.id)"
          >
            <div class="row-header">
              <span class="tag-position" aria-hidden="true">{{ index + 1 }}</span>
              <strong class="tag-name">{{ item.name }}</strong>
              <span class="tag-count">{{ item.count }} {{ item.count === 1 ? 'lançamento' : 'lançamentos' }}</span>
              <span class="tag-amount">{{ formatCurrency(item.total) }}</span>
            </div>

            <!-- Barra de proporção horizontal -->
            <div class="bar-track" aria-hidden="true">
              <div
                class="bar-fill"
                :style="{ width: `${Math.round((item.total / maxTotal) * 100)}%` }"
              ></div>
            </div>
          </button>
        </li>
      </ul>

      <footer class="card-footer">
        <p class="footnote">
          Nota: Um lançamento pode conter múltiplas tags simultâneas; os valores acima refletem o montante associado a cada tag individualmente.
        </p>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.tag-ranking-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-header {
  margin-bottom: 20px;
}

.card-kicker {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.card-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 40px 16px;
  color: var(--color-text-secondary);
  font-size: 13px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ranking-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.ranking-item {
  list-style: none;
}

.ranking-row-btn {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  width: 100%;
  text-align: left;
  font-family: inherit;
  min-height: 44px;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.ranking-row-btn:hover {
  background: var(--color-surface-soft);
}

.ranking-row-btn.is-selected {
  background: var(--color-surface-soft);
  border-color: var(--color-primary);
  border-left-width: 3px;
}

.ranking-row-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.row-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.tag-position {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-secondary);
  min-width: 16px;
}

.tag-name {
  color: var(--color-text);
  font-weight: 600;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-count {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.tag-amount {
  font-family: var(--font-display);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
  margin-left: 8px;
}

.bar-track {
  width: 100%;
  height: 6px;
  background: var(--color-border);
  border-radius: 999px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: var(--color-text-secondary);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.ranking-row.is-selected .bar-fill {
  background: var(--color-primary);
}

.card-footer {
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.footnote {
  font-size: 11px;
  line-height: 1.4;
  color: var(--color-text-secondary);
  margin: 0;
}
</style>
