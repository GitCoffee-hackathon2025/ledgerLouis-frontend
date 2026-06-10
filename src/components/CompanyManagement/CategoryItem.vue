<script setup lang="ts">
import { computed } from 'vue';
import type { Category } from '@/types/CompanyTypes';
import { Palette, Trash2 } from 'lucide-vue-next';

interface Props {
  category: Category;
}

interface Emits {
  (e: 'delete', id: string): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const typeLabel = computed(() => ({
  income: 'Receita',
  expense: 'Despesa',
}[props.category.type]));
</script>

<script lang="ts">
export default {
  name: 'CategoryItem',
};
</script>

<template>
  <div class="category-item">
    <div class="category-content">
      <div class="color-indicator" :style="{ backgroundColor: category.color }"></div>
      <div class="category-info">
        <h5>{{ category.name }}</h5>
        <p class="type">{{ typeLabel }}</p>
      </div>
    </div>
    <button 
      class="btn-delete" 
      @click="$emit('delete', category.id)"
      :title="`Remover ${category.name}`"
    >
      <Trash2 size="18" />
    </button>
  </div>
</template>

<style scoped>
.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: all 0.2s;
}

.category-item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.category-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.color-indicator {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  flex-shrink: 0;
}

.category-info h5 {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text);
  font-weight: 600;
}

.type {
  margin: 2px 0 0 0;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.btn-delete {
  background: none;
  border: none;
  color: var(--color-error);
  cursor: pointer;
  padding: 6px;
  transition: all 0.2s;
  opacity: 0.6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-delete:hover {
  opacity: 1;
  transform: scale(1.1);
}
</style>
