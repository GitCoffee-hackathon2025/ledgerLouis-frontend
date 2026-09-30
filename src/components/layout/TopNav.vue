<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Building2, Mail, Moon, Sun } from 'lucide-vue-next';
import CompanyService from '@/services/companyService';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useThemeStore } from '@/stores/themeStore';
import AppLogo from './AppLogo.vue';

const companyStore = useCompanyStore();
const themeStore = useThemeStore();
const service = new CompanyService();

const pendingInvitations = ref(0);
const isDark = computed(() => themeStore.theme === 'dark');

onMounted(async () => {
  try {
    const response = await service.listUserInvitations();
    pendingInvitations.value = response.items.length;
  } catch {
    pendingInvitations.value = 0;
  }
});
</script>

<template>
  <header class="topbar">
    <RouterLink to="/" class="topbar-brand" aria-label="Ledger Louis — início">
      <AppLogo />
    </RouterLink>

    <div class="topbar-actions">
      <RouterLink
        v-if="companyStore.company.hasCompany"
        :to="{ name: 'companySettings' }"
        class="company-pill"
        title="Empresa atual"
      >
        <Building2 :size="15" />
        <span>{{ companyStore.company.name }}</span>
      </RouterLink>

      <button
        type="button"
        class="icon-button"
        :aria-label="isDark ? 'Usar tema claro' : 'Usar tema escuro'"
        :title="isDark ? 'Tema claro' : 'Tema escuro'"
        @click="themeStore.toggleTheme()"
      >
        <Sun v-if="isDark" :size="19" />
        <Moon v-else :size="19" />
      </button>

      <RouterLink :to="{ name: 'invitations' }" class="icon-button" title="Convites" aria-label="Convites">
        <Mail :size="19" />
        <span v-if="pendingInvitations > 0" class="icon-badge">{{ pendingInvitations }}</span>
      </RouterLink>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: fixed;
  inset: 0 0 auto;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  height: var(--topbar-height);
  padding: 0 var(--space-4);
  background: color-mix(in srgb, var(--color-surface) 82%, transparent);
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: saturate(1.6) blur(14px);
  -webkit-backdrop-filter: saturate(1.6) blur(14px);
}

@media (min-width: 1024px) {
  .topbar {
    padding: 0 var(--space-6) 0 22px;
  }
}

.topbar-brand {
  display: inline-flex;
  align-items: center;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.company-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 200px;
  height: 34px;
  margin-right: 4px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface-2);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-muted);
  transition: border-color var(--duration-fast) ease, color var(--duration-fast) ease;
}

.company-pill span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.company-pill svg {
  color: var(--color-primary);
}

.company-pill:hover {
  border-color: var(--color-border-strong);
  color: var(--color-text);
}

.icon-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-full);
  color: var(--color-text-muted);
  transition: background-color var(--duration-fast) ease, color var(--duration-fast) ease;
}

.icon-button:hover {
  background: var(--color-surface-3);
  color: var(--color-text);
}

.icon-badge {
  position: absolute;
  top: 3px;
  right: 3px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border: 2px solid var(--color-surface);
  border-radius: var(--radius-full);
  background: var(--color-danger);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  line-height: 13px;
  text-align: center;
}

@media (max-width: 420px) {
  .company-pill {
    max-width: 130px;
  }
}
</style>
