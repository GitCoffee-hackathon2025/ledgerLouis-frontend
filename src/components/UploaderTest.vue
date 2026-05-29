<template>
  <div class="container">
    <h2>Upload de Avatar</h2>

    <!-- Preview atual -->
    <div v-if="avatar" class="preview">
      <img :src="avatar" alt="Avatar" />
    </div>

    <!-- Input file -->
    <input type="file" accept="image/*" @change="onFileChange" />

    <!-- Botão upload -->
    <button @click="upload" :disabled="!selectedFile || loading">
      {{ loading ? "Enviando..." : "Upload" }}
    </button>

    <p v-if="error" class="error">{{ error }}</p>



    <img :src="avatar" alt="" v-if="avatar" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import UserService from "@/services/userService";

const userService = new UserService();

const selectedFile = ref<File | null>(null);
const avatar = ref<string | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;

  if (!target.files?.length) return;

  selectedFile.value = target.files[0] ?? null;

  // preview local antes do upload (UX melhor)
  avatar.value = URL.createObjectURL(selectedFile.value as Blob);
}

async function upload() {
  if (!selectedFile.value) return;

  loading.value = true;
  error.value = null;

  try {
    const response = await userService.uploadAvatar(selectedFile.value);

    // backend retorna avatar
    avatar.value = response.avatar ?? null;

  } catch (err) {
    console.error(err);
    error.value = "Erro ao fazer upload do avatar";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 300px;
}

.preview img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ccc;
}

.error {
  color: red;
}
</style>