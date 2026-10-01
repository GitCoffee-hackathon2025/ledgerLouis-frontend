<script setup lang="ts">
import { computed, ref, useId, type Component } from 'vue';
import { Eye, EyeOff } from 'lucide-vue-next';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    label?: string;
    id?: string;
    type?: string;
    placeholder?: string;
    hint?: string;
    /** Icone à esquerda; reforça o tipo do campo sem competir com o rótulo. */
    icon?: Component;
    /**
     * `true` só marca o campo; uma string também exibe a mensagem abaixo.
     * String vem antes de boolean de propósito: com a ordem inversa o Vue
     * converte `''` em `true` e o campo nasceria marcado como inválido.
     */
    error?: string | boolean;
  }>(),
  { label: undefined, id: undefined, type: 'text', placeholder: undefined, hint: undefined, icon: undefined, error: false },
);

const model = defineModel<string | number>();

const fallbackId = useId();
const inputId = computed(() => props.id ?? fallbackId);
const errorMessage = computed(() => (typeof props.error === 'string' ? props.error : ''));

// Campos de senha ganham o botao de mostrar/ocultar.
const isPassword = computed(() => props.type === 'password');
const revealed = ref(false);
const inputType = computed(() => (isPassword.value && revealed.value ? 'text' : props.type));
</script>

<template>
  <div class="field">
    <label v-if="label" :for="inputId" class="field-label">{{ label }}</label>

    <div class="input-wrap" :class="{ 'has-icon': icon, 'has-toggle': isPassword }">
      <component :is="icon" v-if="icon" :size="17" :stroke-width="1.75" class="input-icon" aria-hidden="true" />
      <!-- Atributos extras (required, autocomplete, min, step...) vão para o <input>, não para a div. -->
      <input
        :id="inputId"
        v-model="model"
        v-bind="$attrs"
        :type="inputType"
        :placeholder="placeholder"
        class="input"
        :class="{ 'is-invalid': error }"
        :aria-invalid="error ? true : undefined"
      />
      <button
        v-if="isPassword"
        type="button"
        class="input-toggle"
        :aria-label="revealed ? 'Ocultar senha' : 'Mostrar senha'"
        :aria-pressed="revealed"
        @click="revealed = !revealed"
      >
        <EyeOff v-if="revealed" :size="17" :stroke-width="1.75" />
        <Eye v-else :size="17" :stroke-width="1.75" />
      </button>
    </div>

    <Transition name="field-msg" mode="out-in">
      <span v-if="errorMessage" key="error" class="field-error" role="alert">{{ errorMessage }}</span>
      <span v-else-if="hint" key="hint" class="field-hint">{{ hint }}</span>
    </Transition>
  </div>
</template>

<style scoped>
.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrap.has-icon .input {
  padding-left: 30px;
}

.input-wrap.has-toggle .input {
  padding-right: 40px;
}

.input-icon {
  position: absolute;
  left: 2px;
  color: var(--color-text-subtle);
  pointer-events: none;
  transition: color var(--duration-fast) ease;
}

/* O icone acende junto com o campo: o foco fica legivel sem depender so da borda. */
.input-wrap:focus-within .input-icon {
  color: var(--color-primary);
}

.input-wrap:has(.is-invalid) .input-icon {
  color: var(--color-danger);
}

.input-toggle {
  position: absolute;
  right: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  color: var(--color-text-subtle);
  transition:
    background-color var(--duration-fast) ease,
    color var(--duration-fast) ease;
}

.input-toggle:hover {
  background: var(--color-surface-3);
  color: var(--color-text);
}

.field-msg-enter-active,
.field-msg-leave-active {
  transition:
    opacity var(--duration-fast) ease,
    transform var(--duration) var(--ease-out);
}

.field-msg-enter-from,
.field-msg-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
