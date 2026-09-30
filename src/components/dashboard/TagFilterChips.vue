<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { Tags } from 'lucide-vue-next';
import { useTagStore } from '@/stores/tagStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { colorForTag } from '@/utils/tagColor';

const tagStore = useTagStore();
const transactionStore = useTransactionStore();

const transactionIds = computed(() => transactionStore.transactions.map((t) => t.id));

const loadTagData = async () => {
  await tagStore.fetchTags();
  await tagStore.loadTagsForTransactions(transactionIds.value);
};

onMounted(loadTagData);

watch(
  () => transactionIds.value.join(','),
  () => {
    tagStore.loadTagsForTransactions(transactionIds.value);
  },
);

const tagCounts = computed(() => {
  const counts = new Map<string, number>();

  for (const transaction of transactionStore.transactions) {
    const tags = tagStore.transactionTagsMap[transaction.id] ?? [];
    for (const tag of tags) {
      counts.set(tag.id, (counts.get(tag.id) ?? 0) + 1);
    }
  }

  return counts;
});

const visibleTags = computed(() => tagStore.tags.filter((tag) => (tagCounts.value.get(tag.id) ?? 0) > 0));

const selectTag = (id: string | null) => {
  tagStore.setActiveTag(id);
};

</script>

<template>
  <section v-if="visibleTags.length > 0" class="tag-filter" aria-label="Filtrar transações por tag">
    <div class="tag-filter-head">
      <Tags :size="15" />
      <span>Filtrar por tag</span>
      <RouterLink class="link tag-filter-manage" :to="{ name: 'tags' }">Gerenciar tags</RouterLink>
    </div>

    <div class="tag-filter-row">
      <button
        type="button"
        class="chip"
        :class="{ 'is-active': tagStore.activeTagId === null }"
        :aria-pressed="tagStore.activeTagId === null"
        @click="selectTag(null)"
      >
        Todas
      </button>

      <button
        v-for="tag in visibleTags"
        :key="tag.id"
        type="button"
        class="chip"
        :class="{ 'is-active': tagStore.activeTagId === tag.id }"
        :aria-pressed="tagStore.activeTagId === tag.id"
        @click="selectTag(tag.id)"
      >
        <span class="dot" :style="{ backgroundColor: colorForTag(tag.id) }" />
        {{ tag.name }}
        <span class="chip-count">{{ tagCounts.get(tag.id) ?? 0 }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.tag-filter {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.tag-filter-head {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-muted);
}

.tag-filter-manage {
  margin-left: auto;
  font-size: var(--text-xs);
}

.tag-filter-row {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}

.tag-filter-row .chip {
  flex-shrink: 0;
}

.chip-count {
  padding: 0 6px;
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
}

.chip.is-active .chip-count {
  background: color-mix(in srgb, var(--color-surface) 20%, transparent);
  color: inherit;
}
</style>
