<script setup lang="ts">
import { computed } from 'vue';

// Valor em reais com os centavos menores; o nome acessível é o valor completo.
const props = defineProps<{ value: number; signed?: boolean }>();

const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const full = computed(() => {
  const text = formatter.format(Math.abs(props.value));
  if (!props.signed || props.value === 0) return props.value < 0 ? `−${text}` : text;
  return `${props.value > 0 ? '+' : '−'}${text}`;
});

const parts = computed(() => {
  const comma = full.value.lastIndexOf(',');
  return { whole: full.value.slice(0, comma), cents: full.value.slice(comma) };
});
</script>

<template>
  <span class="lg-money" :aria-label="full">
    <span aria-hidden="true">{{ parts.whole }}<span class="lg-money-cents">{{ parts.cents }}</span></span>
  </span>
</template>
