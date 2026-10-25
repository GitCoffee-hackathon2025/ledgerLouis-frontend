<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useTagStore } from '@/stores/tagStore';
import { useTransactionStore } from '@/stores/transactionStore';

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
</script>

<template>
  <nav v-if="visibleTags.length > 0" class="tag-filter-line" aria-label="Filtrar por etiqueta">
    <span class="lg-note">Filtrar por etiqueta:</span>

    <button
      type="button"
      class="lg-badge"
      :class="{ 'is-projection': tagStore.activeTagId === null }"
      :aria-pressed="tagStore.activeTagId === null"
      @click="tagStore.setActiveTag(null)"
    >
      Todas
    </button>

    <button
      v-for="tag in visibleTags"
      :key="tag.id"
      type="button"
      class="lg-badge"
      :class="{ 'is-projection': tagStore.activeTagId === tag.id }"
      :aria-pressed="tagStore.activeTagId === tag.id"
      @click="tagStore.setActiveTag(tagStore.activeTagId === tag.id ? null : tag.id)"
    >
      {{ tag.name }} ({{ tagCounts.get(tag.id) ?? 0 }})
    </button>

    <router-link :to="{ name: 'tags' }" class="lg-note manage-tags-link">
      Gerenciar etiquetas
    </router-link>
  </nav>
</template>

<style scoped>
.tag-filter-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin-bottom: 24px;
}

.tag-filter-line .lg-badge {
  cursor: pointer;
  border: 1px solid var(--lg-line);
  font: inherit;
  font-size: 0.8125rem;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.tag-filter-line .lg-badge:hover {
  background: var(--lg-line);
}

.manage-tags-link {
  margin-left: auto;
  text-decoration: underline;
}
</style>
