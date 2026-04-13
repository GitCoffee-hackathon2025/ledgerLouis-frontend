<template>
  <div class="input-group">
    <label v-if="label" :for="id">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      class="custom-input"
    />
  </div>
</template>

<script setup lang="ts">
defineProps({
  id: String,
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  modelValue: String
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.input-group {
  width: 100%;
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
}

label {
  font-family: var(--font-body);
  font-size: 0.85rem;
  margin-bottom: 6px;
  margin-left: 12px;
  color: var(--color-placeholder);
  font-weight: 600;
}

.custom-input {
  width: 100%;
  padding: 14px 20px;
  border-radius: var(--radius-input);
  border: 2px solid transparent;
  background-color: var(--color-bg); 
  font-family: var(--font-body);
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
}

.custom-input:focus {
  border-color: var(--color-primary);
  background-color: #fff;
  box-shadow: 0 4px 12px var(--color-primary-glow);
}

.custom-input::placeholder {
  color: var(--color-placeholder);
  opacity: 0.7;
}
</style>