<template>
  <div class="avatar-upload">
    <div class="avatar-preview">
      <img 
        v-if="previewUrl" 
        :src="previewUrl" 
        alt="Avatar preview"
        class="avatar-img"
      />
      <div v-else class="avatar-placeholder">
        <User :size="40" />
      </div>
    </div>

    <div class="upload-section">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileSelect"
        class="file-input"
        hidden
      />
      
      <button 
        @click="fileInput?.click()"
        :disabled="isUploading"
        class="btn-upload"
      >
        {{ isUploading ? 'Enviando...' : 'Escolher Foto' }}
      </button>

      <p v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>
      <p v-if="successMessage" class="success-message">
        {{ successMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { User } from 'lucide-vue-next'
import UserService from '@/services/userService'

const fileInput = ref<HTMLInputElement>()
const previewUrl = ref<string>('')
const isUploading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const userService = new UserService()

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validar tipo de arquivo
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Por favor, selecione um arquivo de imagem'
    return
  }

  // Validar tamanho (máximo 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    errorMessage.value = 'Arquivo muito grande. Máximo 5MB'
    return
  }

  // Mostrar preview
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  // Upload
  try {
    isUploading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    await userService.uploadAvatar(file)

    successMessage.value = '✅ Avatar atualizado com sucesso!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)

  } catch (error) {
    errorMessage.value = '❌ Erro ao fazer upload. Tente novamente.'
    console.error(error)
  } finally {
    isUploading.value = false
  }
}
</script>

<style scoped>
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
}

.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.btn-upload {
  padding: 10px 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-upload:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

.btn-upload:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: var(--color-error, #ef4444);
  font-size: 14px;
  margin: 0;
}

.success-message {
  color: var(--color-success, #10b981);
  font-size: 14px;
  margin: 0;
}
</style>
