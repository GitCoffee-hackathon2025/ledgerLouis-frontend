<script setup lang="ts">
import { computed } from 'vue';
import { smoothPath, toPoints } from '@/utils/sparkPath';

const props = withDefaults(defineProps<{ data: number[]; tone?: 'positive' | 'negative' | 'neutral' }>(), {
  tone: 'positive',
});

const W = 120;
const H = 36;

const stroke = computed(() => {
  if (props.tone === 'negative') return 'var(--color-danger)';
  if (props.tone === 'neutral') return 'var(--color-text-subtle)';
  return 'var(--color-primary)';
});

const path = computed(() => smoothPath(toPoints(props.data, W, H, 4)));
</script>

<template>
  <svg class="sparkline" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" aria-hidden="true">
    <path :d="path" fill="none" :stroke="stroke" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round" />
  </svg>
</template>

<style scoped>
.sparkline {
  width: 96px;
  height: 36px;
}
</style>
