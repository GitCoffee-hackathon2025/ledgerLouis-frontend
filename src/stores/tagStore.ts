import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import type { TagDto } from '@/services/tagService';
import TagService from '@/services/tagService';

export const useTagStore = defineStore('tag', () => {
  const service = new TagService();
  const tags = ref<TagDto[]>([]);
  const transactionTagsMap = reactive<Record<string, TagDto[]>>({});
  const activeTagId = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const setTags = (data: TagDto[]) => {
    tags.value = data;
  };

  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  const setError = (message: string | null) => {
    error.value = message;
  };

  const clearError = () => {
    error.value = null;
  };

  const fetchTags = async () => {
    try {
      setLoading(true);
      clearError();
      setTags(await service.getTags());
    } catch (err) {
      console.error('Erro ao buscar tags:', err);
      setError('Erro ao carregar tags');
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (name: string) => {
    try {
      setLoading(true);
      clearError();
      const tag = await service.createTag(name);
      tags.value.push(tag);
      return tag;
    } catch (err) {
      console.error('Erro ao criar tag:', err);
      setError('Erro ao criar tag');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const renameTag = async (id: string, name: string) => {
    try {
      setLoading(true);
      clearError();
      const updated = await service.updateTag(id, name);
      const index = tags.value.findIndex((t) => t.id === id);
      if (index !== -1) tags.value[index] = updated;

      for (const txId of Object.keys(transactionTagsMap)) {
        const current = transactionTagsMap[txId];
        if (!current) continue;
        const linkIndex = current.findIndex((t) => t.id === id);
        if (linkIndex !== -1) current[linkIndex] = updated;
      }

      return updated;
    } catch (err) {
      console.error('Erro ao renomear tag:', err);
      setError('Erro ao renomear tag');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTag = async (id: string) => {
    try {
      setLoading(true);
      clearError();
      await service.deleteTag(id);
      tags.value = tags.value.filter((t) => t.id !== id);

      for (const txId of Object.keys(transactionTagsMap)) {
        const current = transactionTagsMap[txId];
        if (current) transactionTagsMap[txId] = current.filter((t) => t.id !== id);
      }

      if (activeTagId.value === id) activeTagId.value = null;
    } catch (err) {
      console.error('Erro ao remover tag:', err);
      setError('Erro ao remover tag');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchTagsForTransaction = async (transactionId: string) => {
    try {
      transactionTagsMap[transactionId] = await service.getTransactionTags(transactionId);
    } catch (err) {
      console.error('Erro ao buscar tags da transação:', err);
    }
  };

  const loadTagsForTransactions = async (transactionIds: string[]) => {
    const pending = transactionIds.filter((id) => !(id in transactionTagsMap));
    if (pending.length === 0) return;
    await Promise.all(pending.map((id) => fetchTagsForTransaction(id)));
  };

  const attachTag = async (transactionId: string, tagId: string) => {
    await service.attachTag(transactionId, tagId);
    await fetchTagsForTransaction(transactionId);
  };

  const detachTag = async (transactionId: string, tagId: string) => {
    await service.detachTag(transactionId, tagId);
    await fetchTagsForTransaction(transactionId);
  };

  const setActiveTag = (id: string | null) => {
    activeTagId.value = activeTagId.value === id ? null : id;
  };

  const tagsForTransaction = (transactionId: string) => transactionTagsMap[transactionId] ?? [];

  const transactionHasTag = (transactionId: string, tagId: string) =>
    tagsForTransaction(transactionId).some((t) => t.id === tagId);

  const clearTags = () => {
    tags.value = [];
    for (const key of Object.keys(transactionTagsMap)) delete transactionTagsMap[key];
    activeTagId.value = null;
    error.value = null;
  };

  return {
    tags,
    transactionTagsMap,
    activeTagId,
    loading,
    error,
    fetchTags,
    createTag,
    renameTag,
    deleteTag,
    fetchTagsForTransaction,
    loadTagsForTransactions,
    attachTag,
    detachTag,
    setActiveTag,
    tagsForTransaction,
    transactionHasTag,
    clearError,
    clearTags,
  };
});
