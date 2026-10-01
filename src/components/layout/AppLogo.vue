<script setup lang="ts">
withDefaults(defineProps<{ markOnly?: boolean }>(), { markOnly: false });
</script>

<template>
  <span class="logo">
    <span class="logo-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
        <path d="M5 17V7M10 17V11M15 17V4M20 17V9" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
      </svg>
    </span>
    <span v-if="!markOnly" class="logo-text">Ledger<span class="logo-accent">Louis</span></span>
  </span>
</template>

<style scoped>
.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: var(--gradient-primary);
  color: var(--color-on-primary);
  box-shadow: var(--shadow-primary);
}

.logo-text {
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: -0.04em;
  color: var(--color-text);
}

.logo-accent {
  margin-left: 2px;
  font-weight: 400;
  color: var(--color-text-subtle);
}
</style>
