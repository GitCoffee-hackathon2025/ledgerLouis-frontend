<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Bell, Camera, Lock, LogOut, Moon, Palette, Sun, User } from 'lucide-vue-next';
import UserService from '@/services/userService';
import { useUserStore } from '@/stores/userStore';
import { useThemeStore } from '@/stores/themeStore';
import PageHeader from '@/components/ui/PageHeader.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSwitch from '@/components/ui/BaseSwitch.vue';
import { useToast } from '@/composables/useToast';
import { useConfirm } from '@/composables/useConfirm';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const userStore = useUserStore();
const themeStore = useThemeStore();
const router = useRouter();
const toast = useToast();
const { confirm } = useConfirm();
const userService = new UserService();

const userInfo = reactive({ id: '', name: '', email: '', avatar: '' });
const isLoadingUser = ref(true);
const loadError = ref('');
const isUploading = ref(false);
const fileInput = ref<HTMLInputElement>();

const displayAvatarUrl = computed(() => userStore.avatar || userInfo.avatar);

const isDark = computed({
  get: () => themeStore.theme === 'dark',
  set: (value) => themeStore.setTheme(value ? 'dark' : 'light'),
});

const upcoming = [
  { icon: Lock, title: 'Segurança', description: 'Senha e autenticação' },
  { icon: Bell, title: 'Notificações', description: 'Preferências de alertas' },
];

const loadUserInfo = async () => {
  isLoadingUser.value = true;
  loadError.value = '';
  try {
    const response = await userService.getUserInfo();
    userInfo.id = response.id || '';
    userInfo.name = response.name || '';
    userInfo.email = response.email || '';
    userInfo.avatar = response.avatar || '';
    if (response.avatar) userStore.setavatar(response.avatar);
  } catch (error) {
    console.error('Erro ao carregar informações do usuário:', error);
    loadError.value = 'Não foi possível carregar seus dados. Verifique se você está logado.';
  } finally {
    isLoadingUser.value = false;
  }
};

const handleAvatarSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toast.error('Selecione um arquivo de imagem.');
    return;
  }
  if (file.size > MAX_AVATAR_BYTES) {
    toast.error('Arquivo muito grande. O máximo é 5MB.');
    return;
  }

  // Preview local imediato
  const reader = new FileReader();
  reader.onload = (e) => {
    userInfo.avatar = e.target?.result as string;
  };
  reader.readAsDataURL(file);

  isUploading.value = true;
  try {
    await userService.uploadAvatar(file);
    toast.success('Foto de perfil atualizada!');
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    toast.error('Erro ao enviar a foto. Tente novamente.');
    await loadUserInfo();
  } finally {
    isUploading.value = false;
  }
};

const handleLogout = async () => {
  const confirmed = await confirm({ title: 'Sair da conta?', confirmLabel: 'Sair', tone: 'danger' });
  if (!confirmed) return;
  userService.logout();
  router.push({ name: 'entrar' });
};

onMounted(loadUserInfo);
</script>

<template>
  <div class="page">
    <div class="page-shell page-shell--narrow">
      <PageHeader title="Configurações" description="Gerencie seu perfil e as preferências do aplicativo." />

      <section class="card profile-card">
        <div class="avatar-wrap">
          <div class="avatar">
            <img v-if="displayAvatarUrl" :src="displayAvatarUrl" alt="Sua foto de perfil" />
            <User v-else :size="32" />
          </div>
          <button
            type="button"
            class="avatar-edit"
            :disabled="isUploading"
            aria-label="Alterar foto de perfil"
            title="Alterar foto de perfil"
            @click="fileInput?.click()"
          >
            <span v-if="isUploading" class="avatar-spinner" />
            <Camera v-else :size="14" />
          </button>
          <input ref="fileInput" type="file" accept="image/*" hidden @change="handleAvatarSelect" />
        </div>

        <div class="profile-copy">
          <template v-if="isLoadingUser">
            <span class="skeleton" style="width: 160px; height: 20px" />
            <span class="skeleton" style="width: 210px; height: 14px; margin-top: 8px" />
          </template>
          <template v-else>
            <h2>{{ userInfo.name || 'Seu nome' }}</h2>
            <p>{{ userInfo.email || 'seuemail@exemplo.com' }}</p>
          </template>
        </div>

        <BaseButton variant="secondary" size="sm" class="logout-button" @click="handleLogout">
          <LogOut :size="15" />
          Sair da conta
        </BaseButton>

        <p v-if="loadError" class="alert alert--error profile-error" role="alert">{{ loadError }}</p>
      </section>

      <section class="card settings-list">
        <div class="setting-row">
          <span class="icon-tile icon-tile--neutral"><Palette :size="18" /></span>
          <div class="setting-copy">
            <strong>Aparência</strong>
            <span>Tema {{ isDark ? 'escuro' : 'claro' }}</span>
          </div>
          <div class="theme-toggle">
            <Sun :size="16" :class="{ 'is-on': !isDark }" />
            <BaseSwitch v-model="isDark" label="Alternar modo escuro" />
            <Moon :size="16" :class="{ 'is-on': isDark }" />
          </div>
        </div>

        <div v-for="item in upcoming" :key="item.title" class="setting-row is-disabled" aria-disabled="true">
          <span class="icon-tile icon-tile--neutral"><component :is="item.icon" :size="18" /></span>
          <div class="setting-copy">
            <strong>{{ item.title }}</strong>
            <span>{{ item.description }}</span>
          </div>
          <span class="badge">Em breve</span>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.profile-card {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-5);
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-surface-3);
  color: var(--color-text-subtle);
  box-shadow: 0 0 0 4px var(--color-surface), 0 0 0 5px var(--color-border);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-edit {
  position: absolute;
  right: -2px;
  bottom: -2px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 3px solid var(--color-surface);
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-on-primary);
  transition: transform var(--duration-fast) ease, background-color var(--duration-fast) ease;
}

.avatar-edit:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: scale(1.08);
}

.avatar-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.profile-copy {
  flex: 1 1 200px;
  min-width: 0;
}

.profile-copy h2 {
  font-size: var(--text-xl);
}

.profile-copy p {
  color: var(--color-text-muted);
  overflow-wrap: anywhere;
}

.logout-button:hover {
  color: var(--color-danger);
}

.profile-error {
  width: 100%;
}

.settings-list {
  padding: var(--space-2) var(--space-5);
}

.setting-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) 0;
}

.setting-row + .setting-row {
  border-top: 1px solid var(--color-border);
}

.setting-row.is-disabled {
  opacity: 0.55;
}

.setting-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.setting-copy span {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-subtle);
}

.theme-toggle .is-on {
  color: var(--color-primary);
}

@media (max-width: 520px) {
  .profile-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
