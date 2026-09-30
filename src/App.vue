<template>
  <div class="app-layout">
    <TopNav />
    <SideNav />

    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <BottomNav />
    <ToastHost />
    <ConfirmHost />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCompanyStore } from './stores/CompanyStore';
import { useUserStore } from './stores/userStore';
import { useTransactionStore } from './stores/transactionStore';
import { useTagStore } from './stores/tagStore';
import { useAnalyticsStore } from './stores/analyticsStore';
import { useRecurringTransactionStore } from './stores/recurringTransactionStore';
import TopNav from './components/layout/TopNav.vue';
import SideNav from './components/layout/SideNav.vue';
import BottomNav from './components/layout/BottomNav.vue';
import ToastHost from './components/ui/ToastHost.vue';
import ConfirmHost from './components/ui/ConfirmHost.vue';

const router = useRouter();
const companyStore = useCompanyStore();
const userStore = useUserStore();
const transactionStore = useTransactionStore();
const tagStore = useTagStore();
const analyticsStore = useAnalyticsStore();
const recurringTransactionStore = useRecurringTransactionStore();

onMounted(async () => {
  if (userStore.accessToken) {
    await companyStore.syncFromBackend();
  }
});

watch(
  () => userStore.accessToken,
  async (newToken, oldToken) => {
    if (!oldToken && newToken) {
      await companyStore.syncFromBackend();
    }
    if (oldToken && !newToken && router.currentRoute.value.name !== 'entrar') {
      router.push({ name: 'entrar' });
    }
  },
);

// Limpar dados escopados por empresa quando não houver empresa selecionada
watch(
  () => companyStore.company.hasCompany,
  (hasCompany) => {
    if (!hasCompany) {
      transactionStore.clearTransactions();
      tagStore.clearTags();
      analyticsStore.clearAnalytics();
      recurringTransactionStore.clearRecurringTransactions();
    }
  },
);
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.app-main {
  min-width: 0;
  padding-top: var(--topbar-height);
  padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom));
}

@media (min-width: 1024px) {
  .app-main {
    margin-left: var(--sidebar-width);
    padding-bottom: 0;
  }
}
</style>
