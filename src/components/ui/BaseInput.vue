<script setup lang="ts">
import { computed, useId } from 'vue';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    label?: string;
    id?: string;
    type?: string;
    placeholder?: string;
    hint?: string;
    /**
     * `true` só marca o campo; uma string também exibe a mensagem abaixo.
     * String vem antes de boolean de propósito: com a ordem inversa o Vue
     * converte `''` em `true` e o campo nasceria marcado como inválido.
     */
    error?: string | boolean;
  }>(),
  { label: undefined, id: undefined, type: 'text', placeholder: undefined, hint: undefined, error: false },
);

const model = defineModel<string | number>();

const fallbackId = useId();
const inputId = computed(() => props.id ?? fallbackId);
const errorMessage = computed(() => (typeof props.error === 'string' ? props.error : ''));
</script>

<template>
  <div class="field">
    <label v-if="label" :for="inputId" class="field-label">{{ label }}</label>
    <!-- Atributos extras (required, autocomplete, min, step...) vão para o <input>, não para a div. -->
    <input
      :id="inputId"
      v-model="model"
      v-bind="$attrs"
      :type="type"
      :placeholder="placeholder"
      class="input"
      :class="{ 'is-invalid': error }"
      :aria-invalid="error ? true : undefined"
    />
    <span v-if="errorMessage" class="field-error">{{ errorMessage }}</span>
    <span v-else-if="hint" class="field-hint">{{ hint }}</span>
  </div>
</template>
