<script setup lang="ts">
defineProps<{ label?: string }>();

const checked = defineModel<boolean>({ default: false });
</script>

<template>
  <button
    type="button"
    role="switch"
    class="switch"
    :aria-checked="checked"
    :aria-label="label"
    @click="checked = !checked"
  >
    <span class="switch-track"><span class="switch-thumb" /></span>
    <span v-if="$slots.default" class="switch-label"><slot /></span>
  </button>
</template>

<style scoped>
.switch {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.switch-track {
  position: relative;
  width: 42px;
  height: 24px;
  border-radius: var(--radius-full);
  background: var(--color-border-strong);
  transition: background-color var(--duration) ease;
}

.switch-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: transform var(--duration) var(--ease-out);
}

.switch[aria-checked='true'] .switch-track {
  background: var(--color-primary);
}

.switch[aria-checked='true'] .switch-thumb {
  transform: translateX(18px);
}

.switch-label {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-muted);
}
</style>
