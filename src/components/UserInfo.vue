<template>
  <div class="user-info-card">
    <!-- Header com toggle -->
    <div class="card-header" @click="isExpanded = !isExpanded">
      <div class="header-left">
        <div class="avatar-small">
          <img 
            v-if="displayAvatarUrl" 
            :src="displayAvatarUrl" 
            alt="Avatar"
            class="avatar-img"
          />
          <User v-else :size="20" />
        </div>
        <div class="header-text">
          <h3>{{ userInfo.name || 'Meu Perfil' }}</h3>
          <span class="email">{{ userInfo.email }}</span>
        </div>
      </div>
      <ChevronDown 
        :size="20" 
        :class="{ 'rotated': isExpanded }"
        class="chevron"
      />
    </div>

    <!-- Conteúdo expansível -->
    <transition name="expand-card">
      <div v-show="isExpanded" class="card-body">
        <!-- Seção de Upload -->
        <div class="upload-section">
          <div class="upload-container">
            <div class="avatar-large">
              <img 
                v-if="displayAvatarUrl" 
                :src="displayAvatarUrl" 
                alt="Avatar"
                class="avatar-img-large"
              />
              <User v-else :size="40" />
            </div>
            <div class="upload-controls">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleFileSelect"
                hidden
              />
              <button 
                @click="fileInput?.click()"
                :disabled="isUploading"
                class="upload-btn"
              >
                {{ isUploading ? 'Enviando...' : 'Trocar Foto' }}
              </button>
              <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
              <p v-if="successMsg" class="success">{{ successMsg }}</p>
            </div>
          </div>
        </div>

        <!-- Informações do usuário -->
        <div class="info-list">
          <div class="info-row">
            <label>Nome</label>
            <span>{{ userInfo.name || '—' }}</span>
          </div>
          <div class="info-row">
            <label>Email</label>
            <span>{{ userInfo.email || '—' }}</span>
          </div>

        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { User, ChevronDown } from 'lucide-vue-next'
import UserService from '@/services/userService'
import { useUserStore } from '@/stores/userStore'

interface UserData {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

const isExpanded = ref(true)
const isUploading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const fileInput = ref<HTMLInputElement>()

const userStore = useUserStore()

const userInfo = reactive<UserData>({
  id: '',
  name: '',
  email: '',
  avatarUrl: ''
})

const userService = new UserService()

const displayAvatarUrl = computed(() => userStore.avatarUrl || userInfo.avatarUrl)

const loadUserInfo = async () => {
  try {
    const response = await userService.getUserInfo()
    if (response) {
      userInfo.id = response.id || ''
      userInfo.name = response.name || ''
      userInfo.email = response.email || ''
      userInfo.avatarUrl = response.avatarUrl || ''
      
      // Salvar na store se houver URL
      if (response.avatarUrl) {
        userStore.setAvatarUrl(response.avatarUrl)
      }
    }
  } catch (error) {
    console.error('Erro ao carregar usuário:', error)
  }
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    errorMsg.value = 'Selecione uma imagem válida'
    setTimeout(() => { errorMsg.value = '' }, 3000)
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    errorMsg.value = 'Arquivo muito grande (máx 5MB)'
    setTimeout(() => { errorMsg.value = '' }, 3000)
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    userInfo.avatarUrl = e.target?.result as string
  }
  reader.readAsDataURL(file)

  try {
    isUploading.value = true
    errorMsg.value = ''
    successMsg.value = ''

    await userService.uploadAvatar(file)
    successMsg.value = '✅ Foto atualizada!'
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (error) {
    errorMsg.value = '❌ Erro no upload'
    await loadUserInfo()
    console.error(error)
  } finally {
    isUploading.value = false
  }

  if (fileInput.value) fileInput.value.value = ''
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.user-info-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
  user-select: none;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.2s;
}

.card-header:hover {
  background-color: var(--color-bg);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  border: 2px solid var(--color-primary);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-text {
  min-width: 0;
}

.header-text h3 {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.email {
  display: block;
  font-size: 0.8rem;
  color: var(--color-placeholder);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron {
  color: var(--color-placeholder);
  transition: transform 0.3s;
  flex-shrink: 0;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.card-body {
  padding: 16px;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.upload-section {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 16px;
}

.upload-container {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.avatar-large {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid var(--color-primary);
  overflow: hidden;
  color: var(--color-placeholder);
}

.avatar-img-large {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-btn {
  padding: 8px 12px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  width: fit-content;
}

.upload-btn:hover:not(:disabled) {
  background-color: #1ed760;
  box-shadow: 0 2px 8px rgba(30, 215, 96, 0.3);
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #ef4444;
  font-size: 0.75rem;
  margin: 0;
}

.success {
  color: #1db954;
  font-size: 0.75rem;
  margin: 0;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--color-bg);
  border-radius: 6px;
  font-size: 0.9rem;
}

.info-row label {
  color: var(--color-placeholder);
  font-weight: 500;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.info-row span {
  color: var(--color-text);
  font-weight: 500;
}

.id-value {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
}

.status-badge {
  color: #1db954;
  font-weight: 600;
}

.expand-card-enter-active,
.expand-card-leave-active {
  transition: all 0.3s ease;
}

.expand-card-enter-from,
.expand-card-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
