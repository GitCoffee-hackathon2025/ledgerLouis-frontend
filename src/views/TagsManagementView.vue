<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue';
import TagManager from '@/components/company/TagManager.vue';
</script>

<template>
  <div class="page">
    <div class="page-shell page-shell--narrow">
      <PageHeader
        back
        eyebrow="Gerenciamento"
        title="Tags"
        description="Crie, renomeie e remova rótulos para catalogar e filtrar suas transações."
      />
      <TagManager />
    </div>
  </div>
</template>
