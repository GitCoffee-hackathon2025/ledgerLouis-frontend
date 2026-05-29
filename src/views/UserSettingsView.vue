<template>
  <main class="settings-page">
    <div class="settings-container">
      <!-- Page Title -->
      <header class="page-header">
        <h1>Configurações</h1>
        <p>Gerencie suas informações pessoais e preferências</p>
      </header>

      <!-- User Settings Section -->
      <section class="settings-card">
        <div class="card-header" @click="toggleUserSection">
          <div class="header-content">
            <User :size="24" class="icon" />
            <div>
              <h2>Meu Perfil</h2>
              <span class="subtitle">Informações da sua conta</span>
            </div>
          </div>
          <ChevronDown 
            :size="24" 
            :class="{ 'rotated': isUserExpanded }"
            class="chevron"
          />
        </div>

        <!-- Expandable User Content -->
        <transition name="slide">
          <div v-show="isUserExpanded" class="card-content">
            <!-- Avatar Upload Section -->
            <div class="section-divider">
              <div class="avatar-area">
                <div class="avatar-display">
                  <img 
                    v-if="displayAvatarUrl" 
                    :src="displayAvatarUrl" 
                    alt="Seu avatar"
                    class="avatar-image"
                  />
                  <div v-else class="avatar-placeholder">
                    <User :size="48" />
                  </div>
                </div>

                <div class="avatar-actions">
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    @change="handleAvatarSelect"
                    class="file-input"
                    hidden
                  />
                  
                  <button 
                    @click="fileInput?.click()"
                    :disabled="isUploading"
                    class="btn-primary"
                  >
                    <span v-if="!isUploading">Trocar Foto de Perfil</span>
                    <span v-else>Enviando...</span>
                  </button>

                  <div class="message-box">
                    <p v-if="uploadError" class="error-msg">{{ uploadError }}</p>
                    <p v-if="uploadSuccess" class="success-msg">{{ uploadSuccess }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- User Information Section -->
            <div class="info-grid">
              <div class="info-item">
                <label class="info-label">Nome Completo</label>
                <div class="info-value">{{ userInfo.name || 'Carregando...' }}</div>
              </div>

              <div class="info-item">
                <label class="info-label">Email</label>
                <div class="info-value">{{ userInfo.email || 'Carregando...' }}</div>
              </div>


            </div>
          </div>
        </transition>
      </section>

      <!-- Additional Settings Sections (for future use) -->
      <section class="settings-card disabled">
        <div class="card-header">
          <div class="header-content">
            <Lock :size="24" class="icon" />
            <div>
              <h2>Segurança</h2>
              <span class="subtitle">Gerencie sua senha e autenticação</span>
            </div>
          </div>
        </div>
      </section>

      <section class="settings-card disabled">
        <div class="card-header">
          <div class="header-content">
            <Bell :size="24" class="icon" />
            <div>
              <h2>Notificações</h2>
              <span class="subtitle">Controle suas preferências de notificação</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { User, ChevronDown, Lock, Bell } from 'lucide-vue-next'
import UserService from '@/services/userService'
import { useUserStore } from '@/stores/userStore'

interface UserInfo {
  id: string
  name: string
  email: string
  avatar?: string
}

const isUserExpanded = ref(true)
const isUploading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref('')
const fileInput = ref<HTMLInputElement>()

const userStore = useUserStore()

const userInfo = reactive<UserInfo>({
  id: '',
  name: '',
  email: '',
  avatar: '',
})

const userService = new UserService()

// Avatar URL da store (prioridade)
const displayAvatarUrl = computed(() => userStore.avatar || userInfo.avatar)

const toggleUserSection = () => {
  isUserExpanded.value = !isUserExpanded.value
}

const loadUserInfo = async () => {
  try {
    const response = await userService.getUserInfo()
    if (response) {
      userInfo.id = response.id || ''
      userInfo.name = response.name || ''
      userInfo.email = response.email || ''
      userInfo.avatar = response.avatar || ''
      
      // Salvar na store se houver URL
      if (response.avatar) {
        userStore.setavatar(response.avatar)
      }
    }
  } catch (error) {
    console.error('Erro ao carregar informações do usuário:', error)
  }
}

const handleAvatarSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validações
  if (!file.type.startsWith('image/')) {
    uploadError.value = '❌ Por favor, selecione um arquivo de imagem'
    setTimeout(() => { uploadError.value = '' }, 4000)
    return
  }

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    uploadError.value = '❌ Arquivo muito grande. Máximo 5MB'
    setTimeout(() => { uploadError.value = '' }, 4000)
    return
  }

  // Preview local
  const reader = new FileReader()
  reader.onload = (e) => {
    userInfo.avatar = e.target?.result as string
  }
  reader.readAsDataURL(file)

  // Upload para servidor
  try {
    isUploading.value = true
    uploadError.value = ''
    uploadSuccess.value = ''

    await userService.uploadAvatar(file)

    uploadSuccess.value = '✅ Foto de perfil atualizada com sucesso!'
    setTimeout(() => {
      uploadSuccess.value = ''
    }, 4000)

  } catch (error) {
    uploadError.value = '❌ Erro ao fazer upload. Tente novamente.'
    // Recarregar dados originais em caso de erro
    await loadUserInfo()
    console.error('Erro ao fazer upload:', error)
  } finally {
    isUploading.value = false
  }

  // Limpar input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.settings-page {
  min-height: calc(100vh - 65px);
  padding: 32px 20px;
  background-color: var(--color-surface-soft);
}

.settings-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-header h1 {
  font-size: 2rem;
  color: var(--color-text);
  margin: 0 0 8px 0;
  font-weight: 700;
}

.page-header p {
  font-size: 1rem;
  color: var(--color-placeholder);
  margin: 0;
}

/* Settings Card */
.settings-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.settings-card:not(.disabled):hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.settings-card.disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.2s ease;
}

.card-header:hover {
  background-color: var(--color-bg);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-content .icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.header-content h2 {
  font-size: 1.15rem;
  margin: 0 0 4px 0;
  color: var(--color-text);
  font-weight: 600;
}

.subtitle {
  display: block;
  font-size: 0.85rem;
  color: var(--color-placeholder);
  margin: 0;
}

.chevron {
  color: var(--color-placeholder);
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.chevron.rotated {
  transform: rotate(180deg);
}

/* Card Content */
.card-content {
  padding: 24px;
}

.section-divider {
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 24px;
}

/* Avatar Area */
.avatar-area {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.avatar-display {
  flex-shrink: 0;
}

.avatar-image {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  object-fit: cover;
  border: 3px solid var(--color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  background-color: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-placeholder);
  border: 3px dashed var(--color-border);
}

.avatar-actions {
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: flex-start;
}

.btn-primary {
  padding: 12px 20px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: fit-content;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1ed760;
  box-shadow: 0 4px 12px rgba(30, 215, 96, 0.3);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message-box {
  min-height: 24px;
}

.error-msg,
.success-msg {
  margin: 0;
  font-size: 0.85rem;
}

.error-msg {
  color: #ef4444;
}

.success-msg {
  color: #1db954;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 0.75rem;
  color: var(--color-placeholder);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  padding: 12px 16px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 0.95rem;
  word-break: break-all;
}

.info-value.mono {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.status-badge {
  color: #1db954;
  font-weight: 600;
  border-color: #1db954;
  background-color: rgba(29, 185, 84, 0.1);
}

/* Animations */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  max-height: 0;
}

.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

/* Responsive */
@media (max-width: 600px) {
  .settings-page {
    padding: 20px 16px;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .avatar-area {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .avatar-actions {
    width: 100%;
  }

  .btn-primary {
    width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    padding: 16px;
  }

  .card-content {
    padding: 16px;
  }
}
</style>
