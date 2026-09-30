<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{ icon: Component; title: string; description: string }>();
</script>

<template>
  <article class="feature">
    <span class="icon-tile"><component :is="icon" :size="20" /></span>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
  </article>
</template>

<style scoped>
.feature {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-xs);
  transition:
    transform var(--duration) var(--ease-out),
    box-shadow var(--duration) ease,
    border-color var(--duration-fast) ease;
}

.feature:hover {
  transform: translateY(-4px);
  border-color: var(--color-primary-ring);
  box-shadow: var(--shadow-md);
}

.feature h3 {
  margin-top: var(--space-2);
  font-size: var(--text-lg);
}

.feature p {
  font-size: var(--text-sm);
  line-height: 1.65;
  color: var(--color-text-muted);
}
</style>
