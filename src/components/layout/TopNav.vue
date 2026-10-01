<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Building2, ChevronRight, Mail, Search } from 'lucide-vue-next';
import CompanyService from '@/services/companyService';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useUserStore } from '@/stores/userStore';
import { useCommandPalette } from '@/composables/useCommandPalette';
import BaseButton from '@/components/ui/BaseButton.vue';
import AppLogo from './AppLogo.vue';

const route = useRoute();
const companyStore = useCompanyStore();
const userStore = useUserStore();
const palette = useCommandPalette();
const service = new CompanyService();

const authed = computed(() => !!userStore.accessToken);
const pendingInvitations = ref(0);
const pageTitle = computed(() => route.meta.title);

watch(
  authed,
  async (isAuthed) => {
    if (!isAuthed) {
      pendingInvitations.value = 0;
      return;
    }
    try {
      pendingInvitations.value = (await service.listUserInvitations()).items.length;
    } catch {
      pendingInvitations.value = 0;
    }
  },
  { immediate: true },
);

const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);
</script>

<template>
  <header class="topbar" :class="{ 'topbar--shell': authed }">
    <RouterLink to="/" class="topbar-brand" aria-label="Ledger Louis, início" :class="{ 'is-rail-logo': authed }">
      <AppLogo />
    </RouterLink>

    <!-- Sessao autenticada: contexto (empresa e pagina) + busca + convites -->
    <template v-if="authed">
      <nav class="crumbs" aria-label="Contexto atual">
        <RouterLink
          v-if="companyStore.company.hasCompany"
          :to="{ name: 'company' }"
          class="crumb crumb--company"
          title="Trocar de empresa"
        >
          <Building2 :size="14" />
          <span>{{ companyStore.company.name }}</span>
        </RouterLink>
        <template v-if="pageTitle && route.name !== 'home'">
          <ChevronRight v-if="companyStore.company.hasCompany" :size="14" class="crumb-sep" />
          <span class="crumb crumb--page" aria-current="page">{{ pageTitle }}</span>
        </template>
      </nav>

      <div class="topbar-actions">
        <button type="button" class="command-trigger" @click="palette.open()">
          <Search :size="15" />
          <span class="command-label">Buscar ou ir para</span>
          <kbd>{{ isMac ? '⌘' : 'Ctrl' }} K</kbd>
        </button>

        <RouterLink :to="{ name: 'invitations' }" class="icon-button" title="Convites" aria-label="Convites">
          <Mail :size="18" :stroke-width="1.75" />
          <span v-if="pendingInvitations > 0" class="icon-badge">{{ pendingInvitations }}</span>
        </RouterLink>
      </div>
    </template>

    <!-- Visitante: so o essencial -->
    <div v-else class="topbar-actions">
      <BaseButton variant="ghost" size="sm" :to="{ name: 'entrar' }">Entrar</BaseButton>
      <BaseButton size="sm" :to="{ name: 'cadastro' }">Criar conta</BaseButton>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: fixed;
  inset: 0 0 auto;
  z-index: var(--z-nav);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  height: var(--topbar-height);
  padding: 0 var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-bg) 72%, transparent);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

@media (min-width: 1024px) {
  .topbar {
    padding: 0 var(--space-8);
  }

  /* No desktop autenticado o logo vive no trilho lateral. */
  .topbar--shell {
    left: var(--sidebar-width);
  }

  .topbar-brand.is-rail-logo {
    display: none;
  }
}

.topbar-brand {
  display: inline-flex;
  align-items: center;
}

.crumbs {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
  font-size: var(--text-sm);
}

.crumb {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.crumb--company {
  max-width: 220px;
  padding: 5px 10px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-full);
  font-weight: 500;
  color: var(--color-text);
  transition: background-color var(--duration-fast) ease;
}

.crumb--company span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.crumb--company svg {
  color: var(--color-primary);
}

.crumb--company:hover {
  background: var(--color-surface-3);
}

.crumb-sep {
  flex-shrink: 0;
  color: var(--color-text-subtle);
}

.crumb--page {
  color: var(--color-text-muted);
}

/* Em telas estreitas so a empresa cabe no contexto. */
@media (max-width: 640px) {
  .crumb--page,
  .crumb-sep {
    display: none;
  }
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}

.command-trigger {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 36px;
  padding: 0 8px 0 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  transition:
    border-color var(--duration-fast) ease,
    color var(--duration-fast) ease;
}

.command-trigger:hover {
  border-color: var(--color-primary-ring);
  color: var(--color-text);
}

.command-trigger kbd {
  padding: 2px 7px;
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-subtle);
}

@media (max-width: 760px) {
  .command-label,
  .command-trigger kbd {
    display: none;
  }

  .command-trigger {
    width: 38px;
    padding: 0;
    justify-content: center;
  }
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
  transition:
    background-color var(--duration-fast) ease,
    color var(--duration-fast) ease;
}

.icon-button:hover {
  background: var(--color-surface-3);
  color: var(--color-text);
}

.icon-badge {
  position: absolute;
  top: 3px;
  right: 3px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  text-align: center;
}
</style>
