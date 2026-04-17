<script setup lang="ts">
const props = defineProps<{
  status: string;
  message: string;
  show: boolean;
}>();

const emit = defineEmits(['close']);

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <transition name="fade">
    <div v-if="show" class="overlay" @click="handleClose">
      <div class="popup" @click.stop>
        <div class="icon" :class="status">
          <span v-if="status === 'success'">✔</span>
          <span v-else>✖</span>
        </div>

        <h2 class="title">
          {{ status === 'success' ? 'Sucesso!' : 'Erro!' }}
        </h2>

        <p class="message">{{ message }}</p>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.popup {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 320px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  animation: pop 0.3s ease;
}

.icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.icon.success {
  background: var(--color-primary);
  box-shadow: 0 0 20px var(--color-primary-glow);
}

.icon.error {
  background: #ff4d4f;
}

.title {
  font-family: var(--font-display);
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.message {
  font-size: 14px;
  color: #555;
}

/* animação */
@keyframes pop {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>