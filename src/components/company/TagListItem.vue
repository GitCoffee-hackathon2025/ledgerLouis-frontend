<script setup lang="ts">
import { ref } from 'vue';
import type { TagDto } from '@/services/tagService';
import { Check, Pencil, Trash2, X } from 'lucide-vue-next';
import { colorForTag } from '@/utils/tagColor';

interface Props {
  tag: TagDto;
}

interface Emits {
  (e: 'rename', id: string, name: string): void;
  (e: 'delete', id: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isEditing = ref(false);
const draftName = ref(props.tag.name);

const startEdit = () => {
  draftName.value = props.tag.name;
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
};

const confirmEdit = () => {
  const trimmed = draftName.value.trim();
  if (trimmed && trimmed !== props.tag.name) {
    emit('rename', props.tag.id, trimmed);
  }
  isEditing.value = false;
};
</script>

<script lang="ts">
export default {
  name: 'TagListItem',
};
</script>

<template>
  <li class="lg-row">
    <div class="lg-row-main">
      <div v-if="!isEditing" class="lg-row-title tag-label-row">
        <span
          class="tag-dot"
          :style="{ backgroundColor: colorForTag(tag.id) }"
          aria-hidden="true"
        ></span>
        <span>{{ tag.name }}</span>
      </div>

      <div v-else class="tag-edit-wrap">
        <input
          v-model="draftName"
          type="text"
          class="lg-input"
          autofocus
          :aria-label="`Editar nome da tag ${tag.name}`"
          @keyup.enter="confirmEdit"
          @keyup.escape="cancelEdit"
        />
      </div>
    </div>

    <div class="lg-actions">
      <template v-if="isEditing">
        <button
          type="button"
          class="lg-btn lg-btn--icon lg-btn--primary"
          title="Salvar alteração"
          aria-label="Salvar alteração"
          @click="confirmEdit"
        >
          <Check :size="16" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="lg-btn lg-btn--icon lg-btn--quiet"
          title="Cancelar edição"
          aria-label="Cancelar edição"
          @click="cancelEdit"
        >
          <X :size="16" aria-hidden="true" />
        </button>
      </template>

      <template v-else>
        <button
          type="button"
          class="lg-btn lg-btn--icon lg-btn--quiet"
          :title="`Renomear ${tag.name}`"
          :aria-label="`Renomear tag ${tag.name}`"
          @click="startEdit"
        >
          <Pencil :size="15" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="lg-btn lg-btn--icon lg-btn--quiet lg-btn--danger"
          :title="`Remover ${tag.name}`"
          :aria-label="`Remover tag ${tag.name}`"
          @click="$emit('delete', tag.id)"
        >
          <Trash2 :size="15" aria-hidden="true" />
        </button>
      </template>
    </div>
  </li>
</template>

<style scoped>
.tag-label-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tag-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.tag-edit-wrap {
  max-width: 320px;
}
</style>
