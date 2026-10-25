<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Plus } from 'lucide-vue-next';
import TagListItem from './TagListItem.vue';
import { useTagStore } from '@/stores/tagStore';
import { useCompanyStore } from '@/stores/CompanyStore';

const tagStore = useTagStore();
const companyStore = useCompanyStore();

const showForm = ref(false);
const newTagName = ref('');
const message = reactive({ status: '', text: '', show: false });

const extractErrorCode = (error: unknown): string | undefined => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    return (error as { response?: { data?: { error?: string } } }).response?.data?.error;
  }
  return undefined;
};

const notify = (status: 'success' | 'error', text: string) => {
  message.status = status;
  message.text = text;
  message.show = true;
  setTimeout(() => {
    message.show = false;
  }, 3000);
};

const resetForm = () => {
  newTagName.value = '';
  showForm.value = false;
};

const handleAddTag = async () => {
  if (!newTagName.value.trim()) {
    notify('error', 'Digite um nome para a tag.');
    return;
  }

  try {
    await tagStore.createTag(newTagName.value.trim());
    notify('success', 'Tag criada com sucesso.');
    resetForm();
  } catch (error) {
    const code = extractErrorCode(error);
    notify('error', code === 'TAG_ALREADY_EXISTS' ? 'Já existe uma tag com esse nome.' : 'Erro ao criar tag.');
  }
};

const handleRenameTag = async (id: string, name: string) => {
  try {
    await tagStore.renameTag(id, name);
    notify('success', 'Tag atualizada com sucesso.');
  } catch (error) {
    const code = extractErrorCode(error);
    notify('error', code === 'TAG_ALREADY_EXISTS' ? 'Já existe uma tag com esse nome.' : 'Erro ao renomear tag.');
  }
};

const handleDeleteTag = async (id: string) => {
  try {
    await tagStore.deleteTag(id);
    notify('success', 'Tag removida com sucesso.');
  } catch {
    notify('error', 'Erro ao remover tag.');
  }
};

onMounted(() => {
  if (companyStore.company.hasCompany) {
    tagStore.fetchTags();
  }
});
</script>

<script lang="ts">
export default {
  name: 'TagManager',
};
</script>

<template>
  <div class="lg-section">
    <header class="lg-section-head">
      <div>
        <h2 class="lg-h2">Tags</h2>
        <p class="lg-note">Rótulos livres para catalogar e filtrar lançamentos financeiros.</p>
      </div>

      <button
        v-if="!showForm"
        type="button"
        class="lg-btn lg-btn--primary"
        @click="showForm = true"
      >
        <Plus :size="16" aria-hidden="true" />
        <span>Nova tag</span>
      </button>
    </header>

    <div
      v-if="message.show"
      :class="message.status === 'error' ? 'lg-error' : 'is-income'"
      class="tag-feedback"
      role="alert"
      aria-live="polite"
    >
      {{ message.text }}
    </div>

    <!-- Formulário inline de nova tag -->
    <form
      v-if="showForm"
      class="new-tag-form"
      @submit.prevent="handleAddTag"
    >
      <div class="lg-field tag-name-field">
        <label for="new-tag-name-input" class="lg-label">Nome da nova tag</label>
        <input
          id="new-tag-name-input"
          v-model="newTagName"
          type="text"
          class="lg-input"
          placeholder="Ex: Fornecedores, Alimentação, Clientes"
          autofocus
          required
        />
      </div>

      <div class="lg-actions tag-form-actions">
        <button type="submit" class="lg-btn lg-btn--primary">
          Salvar tag
        </button>
        <button type="button" class="lg-btn lg-btn--quiet" @click="resetForm">
          Cancelar
        </button>
      </div>
    </form>

    <div v-if="tagStore.tags.length === 0" class="lg-empty">
      Nenhuma tag cadastrada ainda nesta empresa.
    </div>

    <ul v-else class="lg-rows" role="list">
      <TagListItem
        v-for="tag in tagStore.tags"
        :key="tag.id"
        :tag="tag"
        @rename="handleRenameTag"
        @delete="handleDeleteTag"
      />
    </ul>
  </div>
</template>

<style scoped>
.tag-feedback {
  margin-bottom: 16px;
  font-size: 0.875rem;
  font-weight: 500;
}

.new-tag-form {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
  padding-bottom: 20px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--lg-line);
}

.tag-name-field {
  flex: 1;
  min-width: 240px;
}

.tag-form-actions {
  display: flex;
  gap: 8px;
}
</style>
