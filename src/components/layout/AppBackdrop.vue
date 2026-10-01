<script setup lang="ts">
import { ref } from 'vue';
import { useEventListener, usePreferredReducedMotion } from '@vueuse/core';

const el = ref<HTMLElement>();
const reduced = usePreferredReducedMotion();

// A luz segue o cursor com um frame por movimento; so escreve CSS vars, sem estado reativo.
let frame = 0;
useEventListener(window, 'pointermove', (e: PointerEvent) => {
  if (reduced.value === 'reduce' || frame || !el.value) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    el.value?.style.setProperty('--cx', `${e.clientX}px`);
    el.value?.style.setProperty('--cy', `${e.clientY}px`);
  });
});
</script>

<template>
  <div ref="el" class="backdrop" aria-hidden="true">
    <div class="backdrop-aura" />
    <div class="backdrop-grid" />
    <div class="backdrop-cursor" />
  </div>
  <div class="grain" aria-hidden="true" />
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  background: var(--color-bg);
  pointer-events: none;
}

/* Iluminacao esmeralda fixa: um foco no topo, outro discreto no canto inferior. */
.backdrop-aura {
  position: absolute;
  inset: -10%;
  animation: backdrop-breathe 18s ease-in-out infinite alternate;
  background:
    radial-gradient(60% 50% at 78% -8%, rgba(52, 181, 133, 0.095), transparent 70%),
    radial-gradient(45% 40% at 4% 108%, rgba(52, 181, 133, 0.045), transparent 70%);
}

@keyframes backdrop-breathe {
  from {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.85;
  }
  to {
    transform: translate3d(2%, 3%, 0) scale(1.06);
    opacity: 1;
  }
}

.backdrop-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(80% 60% at 70% 0%, #000 0%, transparent 75%);
}

.backdrop-cursor {
  position: absolute;
  inset: 0;
  background: radial-gradient(520px circle at var(--cx, 70%) var(--cy, 10%), rgba(52, 181, 133, 0.04), transparent 65%);
}

/* Granulado: camada fixa e inerte, nunca em container que rola. */
.grain {
  position: fixed;
  inset: 0;
  z-index: var(--z-grain);
  pointer-events: none;
  opacity: 0.05;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
</style>
