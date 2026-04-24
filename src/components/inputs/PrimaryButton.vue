<template>
  <button class="primary-btn" :disabled="loading" @click="$emit('click')">
    <span v-if="loading" class="spinner" />
    <span v-else><slot /></span>
  </button>
</template>

<script setup lang="ts">
defineProps({ loading: { type: Boolean, default: false } })
defineEmits(['click'])
</script>

<style scoped>
.primary-btn {
  width: 60%;
  padding: 15px;
  background: var(--color-primary);
  color: var(--color-surface);
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.04em;
  border: none;
  border-radius: var(--radius-input);
  cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 6px 20px var(--color-primary-glow);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
}
.primary-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 10px 28px var(--color-primary-glow);
}
.primary-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 12px var(--color-primary-glow);
}
.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.spinner {
  width: 20px; height: 20px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>