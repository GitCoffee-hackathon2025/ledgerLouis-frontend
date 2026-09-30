<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Plus, Tag as TagIcon } from 'lucide-vue-next';
import TagListItem from './TagListItem.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useTagStore } from '@/stores/tagStore';
import { useToast } from '@/composables/useToast';
import { useConfirm } from '@/composables/useConfirm';
import { apiErrorCode } from '@/utils/apiError';

const tagStore = useTagStore();
const toast = useToast();
const { confirm } = useConfirm();

const newTagName = ref('');
const creating = ref(false);

const duplicateOr = (error: unknown, fallback: string) =>
  apiErrorCode(error) === 'TAG_ALREADY_EXISTS' ? 'Já existe uma tag com esse nome.' : fallback;

const handleAddTag = async () => {
  const name = newTagName.value.trim();
  if (!name) return;

  creating.value = true;
  try {
    await tagStore.createTag(name);
    toast.success(`Tag "${name}" criada.`);
    newTagName.value = '';
  } catch (error) {
    toast.error(duplicateOr(error, 'Erro ao criar tag.'));
  } finally {
    creating.value = false;
  }
};

const handleRenameTag = async (id: string, name: string) => {
  try {
    await tagStore.renameTag(id, name);
    toast.success('Tag atualizada.');
  } catch (error) {
    toast.error(duplicateOr(error, 'Erro ao renomear tag.'));
  }
};

const handleDeleteTag = async (id: string, name: string) => {
  const confirmed = await confirm({
    title: `Remover a tag "${name}"?`,
    message: 'Ela será desvinculada de todas as transações. As transações em si não são apagadas.',
    confirmLabel: 'Remover',
    tone: 'danger',
  });
  if (!confirmed) return;

  try {
    await tagStore.deleteTag(id);
    toast.success('Tag removida.');
  } catch {
    toast.error('Erro ao remover tag.');
  }
};

onMounted(() => {
  tagStore.fetchTags();
});
</script>

<template>
  <section class="card">
    <form class="tag-create" @submit.prevent="handleAddTag">
      <label for="new-tag" class="sr-only">Nome da nova tag</label>
      <input
        id="new-tag"
        v-model="newTagName"
        type="text"
        class="input"
        placeholder="Nova tag — ex: Fornecedores, Marketing..."
        autocomplete="off"
      />
      <BaseButton type="submit" :loading="creating" :disabled="!newTagName.trim()">
        <Plus :size="17" />
        Adicionar
      </BaseButton>
    </form>

    <div v-if="tagStore.loading && tagStore.tags.length === 0" class="tags-list">
      <span v-for="n in 3" :key="n" class="skeleton" style="height: 52px" />
    </div>

    <div v-else-if="tagStore.tags.length === 0" class="empty-state">
      <TagIcon :size="26" />
      Nenhuma tag cadastrada ainda. Crie a primeira acima.
    </div>

    <TransitionGroup v-else tag="ul" name="list" class="tags-list">
      <TagListItem
        v-for="tag in tagStore.tags"
        :key="tag.id"
        :tag="tag"
        @rename="handleRenameTag"
        @delete="handleDeleteTag(tag.id, tag.name)"
      />
    </TransitionGroup>
  </section>
</template>

<style scoped>
.tag-create {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}

.tag-create .input {
  flex: 1;
}

.tags-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.list-enter-active,
.list-leave-active {
  transition:
    opacity var(--duration) ease,
    transform var(--duration) var(--ease-out);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

@media (max-width: 480px) {
  .tag-create {
    flex-direction: column;
  }
}
</style>
