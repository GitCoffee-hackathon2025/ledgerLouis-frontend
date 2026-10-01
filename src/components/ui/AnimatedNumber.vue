<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    value: number;
    format?: (value: number) => string;
    duration?: number;
  }>(),
  { format: (value: number) => String(Math.round(value)), duration: 700 },
);

const displayed = ref(0);
let frame = 0;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

const animateTo = (target: number) => {
  cancelAnimationFrame(frame);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    displayed.value = target;
    return;
  }

  const from = displayed.value;
  const start = performance.now();

  const tick = (now: number) => {
    const progress = Math.min((now - start) / props.duration, 1);
    displayed.value = from + (target - from) * easeOutCubic(progress);
    if (progress < 1) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
};

onMounted(() => animateTo(props.value));
watch(() => props.value, animateTo);
onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>

<template>
  <!-- O valor final fica no aria-label para leitores de tela não lerem a contagem intermediária. -->
  <span class="tabular" :aria-label="format(value)">{{ format(displayed) }}</span>
</template>
