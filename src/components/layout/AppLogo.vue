<script setup lang="ts">
withDefaults(defineProps<{ inverted?: boolean }>(), { inverted: false });
</script>

<template>
  <span class="logo" :class="{ 'logo--inverted': inverted }">
    <span class="logo-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
        <path d="M5 17V7M10 17V11M15 17V4M20 17V9" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
      </svg>
    </span>
    <span class="logo-text">Ledger<span class="logo-accent">Louis</span></span>
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
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-text);
}

.logo-accent {
  margin-left: 3px;
  font-weight: 500;
  color: var(--color-text-muted);
}

.logo--inverted .logo-text {
  color: #fff;
}

.logo--inverted .logo-accent {
  color: rgba(255, 255, 255, 0.6);
}
</style>
