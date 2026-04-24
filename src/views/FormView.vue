<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthLogin from '@/components/Forms/AuthLogin.vue';
import AuthRegister from '@/components/Forms/AuthRegister.vue';
import NavAuth from '@/components/Forms/NavAuth.vue';

const route = useRoute();
const router = useRouter();
const activeTab = ref(route.meta.tab === 'login' ? 'login' : 'register');

const toggleTab = (tab: string) => {
  activeTab.value = tab;
  router.replace({ name: tab === 'login' ? 'entrar' : 'cadastro' });
};

watch(
  () => route.meta.tab,
  (tab) => {
    activeTab.value = tab === 'login' ? 'login' : 'register';
  }
);
</script>

<template>
  <div class="main-container">
      <div class="auth-wrapper">
            <NavAuth :active-tab="activeTab" @change-tab="toggleTab" />
            <AuthRegister v-if="activeTab === 'register'" />
            <AuthLogin v-else />
      </div>
  </div>
</template>

<style scoped>
.main-container {
    width: 100%;
    min-height: calc(100vh - 175px);
    display: flex;
    flex-direction: column;
    align-items: center; 
    justify-content: center;
    background-color: var(--color-bg);
}

.auth-wrapper {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    border-radius: 20px 20px 0 0;
    overflow: hidden; 
    background-color: transparent; 
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}



</style>