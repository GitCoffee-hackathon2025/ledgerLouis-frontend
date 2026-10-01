<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Check, Plus, X } from 'lucide-vue-next';
import { useTagStore } from '@/stores/tagStore';
import { colorForTag } from '@/utils/tagColor';

const selected = defineModel<string[]>({ required: true });

const tagStore = useTagStore();

const showCreate = ref(false);
const newTagName = ref('');
const creating = ref(false);
const createError = ref('');

const isSelected = (id: string) => selected.value.includes(id);

const toggleTag = (id: string) => {
  selected.value = isSelected(id) ? selected.value.filter((t) => t !== id) : [...selected.value, id];
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
    selected.value = [...selected.value, tag.id];
    cancelCreate();
  } catch {
    createError.value = 'Não foi possível criar a tag.';
  } finally {
    creating.value = false;
  }
};

onMounted(() => {
  if (tagStore.tags.length === 0) tagStore.fetchTags();
});
</script>

<template>
  <fieldset class="field tag-picker">
    <legend class="field-label">Tags <span class="optional">(opcional)</span></legend>

    <div class="tag-chips">
      <button
        v-for="tag in tagStore.tags"
        :key="tag.id"
        type="button"
        class="chip"
        :class="{ 'is-selected': isSelected(tag.id) }"
        :style="{ '--tag-color': colorForTag(tag.id) }"
        :aria-pressed="isSelected(tag.id)"
        @click="toggleTag(tag.id)"
      >
        {{ tag.name }}
      </button>

      <button v-if="!showCreate" type="button" class="chip chip--dashed" @click="showCreate = true">
        <Plus :size="14" />
        Nova tag
      </button>

      <!-- Não é um <form>: o TagPicker vive dentro do formulário da transação. -->
      <div v-else class="tag-create">
        <input
          v-model="newTagName"
          type="text"
          class="input input--sm"
          placeholder="Nome da tag"
          aria-label="Nome da nova tag"
          autofocus
          @keydown.enter.prevent="confirmCreate"
          @keyup.escape="cancelCreate"
        />
        <button type="button" class="round-btn round-btn--confirm" :disabled="creating" title="Criar tag" @click="confirmCreate">
          <Check :size="14" />
        </button>
        <button type="button" class="round-btn" title="Cancelar" @click="cancelCreate">
          <X :size="14" />
        </button>
      </div>
    </div>

    <p v-if="createError" class="field-error">{{ createError }}</p>
    <p v-else-if="tagStore.tags.length === 0 && !showCreate" class="field-hint">
      Nenhuma tag ainda. Crie a primeira para catalogar este lançamento.
    </p>
  </fieldset>
</template>

<style scoped>
.tag-picker {
  border: none;
  gap: var(--space-2);
}

.optional {
  font-weight: 500;
  color: var(--color-text-subtle);
}

.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tag-create {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tag-create .input {
  width: 150px;
}

.round-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-surface-3);
  color: var(--color-text-muted);
}

.round-btn:hover {
  color: var(--color-text);
}

.round-btn--confirm {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.round-btn--confirm:hover {
  color: var(--color-on-primary);
  background: var(--color-primary-hover);
}
</style>
