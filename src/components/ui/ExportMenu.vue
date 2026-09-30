<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Download, FileSpreadsheet, FileText } from 'lucide-vue-next';
import BaseButton from './BaseButton.vue';

const emit = defineEmits<{ export: [format: 'csv' | 'pdf'] }>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);

const pick = (format: 'csv' | 'pdf') => {
  open.value = false;
  emit('export', format);
};

const handleClickOutside = (event: MouseEvent) => {
  if (open.value && !root.value?.contains(event.target as Node)) open.value = false;
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') open.value = false;
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleEscape);
});
</script>

<template>
  <div ref="root" class="dropdown">
    <BaseButton variant="secondary" :aria-expanded="open" aria-haspopup="menu" @click="open = !open">
      <Download :size="17" />
      Exportar
    </BaseButton>

    <Transition name="pop">
      <div v-if="open" class="dropdown-menu" role="menu">
        <button type="button" class="dropdown-item" role="menuitem" @click="pick('csv')">
          <FileSpreadsheet :size="16" />
          Planilha (CSV)
        </button>
        <button type="button" class="dropdown-item" role="menuitem" @click="pick('pdf')">
          <FileText :size="16" />
          Documento (PDF)
        </button>
      </div>
    </Transition>
  </div>
</template>
