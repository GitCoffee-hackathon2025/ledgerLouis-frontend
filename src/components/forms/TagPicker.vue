<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Plus, X } from 'lucide-vue-next';
import { useTagStore } from '@/stores/tagStore';
import { useCompanyStore } from '@/stores/CompanyStore';
import { colorForTag } from '@/utils/tagColor';

const props = defineProps<{ modelValue: string[] }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: string[]): void }>();

const tagStore = useTagStore();
const companyStore = useCompanyStore();

const showCreate = ref(false);
const newTagName = ref('');
const creating = ref(false);
const createError = ref('');

const isSelected = (id: string) => props.modelValue.includes(id);

const toggleTag = (id: string) => {
  emit('update:modelValue', isSelected(id) ? props.modelValue.filter((t) => t !== id) : [...props.modelValue, id]);
};

const openCreate = () => {
  showCreate.value = true;
  createError.value = '';
};

const cancelCreate = () => {
  showCreate.value = false;
  newTagName.value = '';
  createError.value = '';
};

const confirmCreate = async () => {
  const name = newTagName.value.trim();
  if (!name) return;

  creating.value = true;
  createError.value = '';
  try {
    const tag = await tagStore.createTag(name);
    emit('update:modelValue', [...props.modelValue, tag.id]);
    cancelCreate();
  } catch {
    createError.value = 'Não foi possível criar a tag.';
  } finally {
    creating.value = false;
  }
};

onMounted(() => {
  if (companyStore.company.hasCompany && tagStore.tags.length === 0) {
    tagStore.fetchTags();
  }
});
</script>

<script lang="ts">
export default {
  name: 'TagPicker',
};
</script>

<template>
  <div class="tag-picker">
    <span class="tag-picker-label">Tags</span>

    <div class="tag-chips">
      <button
        v-for="tag in tagStore.tags"
        :key="tag.id"
        type="button"
        class="tag-chip"
        :class="{ 'tag-chip--active': isSelected(tag.id) }"
        :style="isSelected(tag.id) ? { borderColor: colorForTag(tag.id), color: colorForTag(tag.id) } : {}"
        @click="toggleTag(tag.id)"
      >
        <span class="tag-chip-dot" :style="{ backgroundColor: colorForTag(tag.id) }"></span>
        {{ tag.name }}
      </button>

      <button v-if="!showCreate" type="button" class="tag-chip tag-chip--new" @click="openCreate">
        <Plus :size="14" />
        Nova tag
      </button>

      <div v-else class="tag-create-form" @keydown.enter.prevent.stop="confirmCreate">
        <input
          v-model="newTagName"
          type="text"
          placeholder="Nome da tag"
          class="tag-create-input"
          autofocus
          @keydown.enter.prevent.stop="confirmCreate"
          @keyup.escape="cancelCreate"
        />
        <button
          type="button"
          class="tag-create-confirm"
          :disabled="creating"
          title="Criar tag"
          aria-label="Criar tag"
          @click.prevent.stop="confirmCreate"
        >
          <Plus :size="14" />
        </button>
        <button
          type="button"
          class="tag-create-cancel"
          title="Cancelar"
          aria-label="Cancelar criação de tag"
          @click.prevent.stop="cancelCreate"
        >
          <X :size="14" />
        </button>
      </div>
    </div>

    <p v-if="createError" class="tag-picker-error">{{ createError }}</p>
    <p v-else-if="tagStore.tags.length === 0 && !showCreate" class="tag-picker-hint">
      Nenhuma tag ainda — crie a primeira para catalogar esse lançamento.
    </p>
  </div>
</template>

<style scoped>
.tag-picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tag-picker-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 44px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1.5px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}

.tag-chip:hover {
  border-color: var(--color-text-tertiary);
  color: var(--color-text);
}

.tag-chip--active {
  background: var(--color-surface-alt);
}

.tag-chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex-shrink: 0;
}

.tag-chip--new {
  color: var(--color-text-secondary);
  border-style: dashed;
}

.tag-chip--new:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.tag-create-form {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tag-create-input {
  width: 140px;
  min-height: 44px;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1.5px solid var(--color-primary);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 13.5px;
  font-family: var(--font-body);
}

.tag-create-input:focus {
  outline: none;
}

.tag-create-confirm,
.tag-create-cancel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  border-radius: 999px;
  border: 1.5px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.tag-create-confirm {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.tag-create-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tag-create-cancel:hover {
  border-color: var(--color-text-secondary);
  color: var(--color-text);
}

.tag-picker-hint,
.tag-picker-error {
  font-size: 12.5px;
  color: var(--color-text-tertiary);
  margin: 0;
}

.tag-picker-error {
  color: var(--color-danger);
}
</style>
