<template>
  <header class="top-navbar">
    <div class="logo-section">
      <span class="logo-text">LEDGER</span>
    </div>

    <button class="profile-button" @click="goToCompany">
      <Briefcase :size="28" stroke-width="2.5" />
    </button>
  </header>
</template>

<script setup lang="ts">
import { Briefcase } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const router = useRouter();

const goToCompany = () => {
  router.push({ name: 'company' });
};
</script>

<style scoped>
.top-navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 65px;
  background-color: var(--color-surface);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box;
  z-index: 1001;

  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.logo-text {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 18px;
  letter-spacing: 1px;
  color: var(--color-text);
}
.profile-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;

  color: var(--color-success-alt); /* Fallback */
}


.profile-button :deep(svg) {
  stroke: url(#green-gradient);
}

.profile-button:active {
  transform: scale(0.9);
}
</style>