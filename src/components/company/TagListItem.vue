<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { Check, Pencil, Trash2, X } from 'lucide-vue-next';
import type { TagDto } from '@/services/tagService';
import { colorForTag } from '@/utils/tagColor';
import BaseButton from '@/components/ui/BaseButton.vue';

const props = defineProps<{ tag: TagDto }>();

const emit = defineEmits<{
  rename: [id: string, name: string];
  delete: [];
}>();

const isEditing = ref(false);
const draftName = ref(props.tag.name);
const editInput = ref<HTMLInputElement | null>(null);

const startEdit = async () => {
  draftName.value = props.tag.name;
  isEditing.value = true;
  await nextTick();
  editInput.value?.select();
};

const confirmEdit = () => {
  const trimmed = draftName.value.trim();
  if (trimmed && trimmed !== props.tag.name) emit('rename', props.tag.id, trimmed);
  isEditing.value = false;
};
</script>

<template>
  <li class="tag-item" :class="{ 'is-editing': isEditing }">
    <span class="tag-swatch" :style="{ backgroundColor: colorForTag(tag.id) }" aria-hidden="true" />

    <input
      v-if="isEditing"
      ref="editInput"
      v-model="draftName"
      type="text"
      class="input input--sm tag-edit"
      :aria-label="`Novo nome para ${tag.name}`"
      @keyup.enter="confirmEdit"
      @keyup.escape="isEditing = false"
    />
    <span v-else class="tag-name">{{ tag.name }}</span>

    <div class="tag-actions">
      <template v-if="isEditing">
        <BaseButton size="sm" icon-only aria-label="Salvar" title="Salvar" @click="confirmEdit">
          <Check :size="15" />
        </BaseButton>
        <BaseButton variant="ghost" size="sm" icon-only aria-label="Cancelar" title="Cancelar" @click="isEditing = false">
          <X :size="15" />
        </BaseButton>
      </template>
      <template v-else>
        <BaseButton variant="ghost" size="sm" icon-only :aria-label="`Renomear ${tag.name}`" title="Renomear" @click="startEdit">
          <Pencil :size="15" />
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="sm"
          icon-only
          class="delete-button"
          :aria-label="`Remover ${tag.name}`"
          title="Remover"
          @click="emit('delete')"
        >
          <Trash2 :size="15" />
        </BaseButton>
      </template>
    </div>
  </li>
</template>

<style scoped>
.tag-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 56px;
  padding: 8px 8px 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  transition: border-color var(--duration-fast) ease, background-color var(--duration-fast) ease;
}

.tag-item:hover,
.tag-item.is-editing {
  border-color: var(--color-border-strong);
  background: var(--color-surface);
}

.tag-swatch {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  flex-shrink: 0;
}

.tag-name {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-edit {
  flex: 1;
}

.tag-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.delete-button:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}
</style>
