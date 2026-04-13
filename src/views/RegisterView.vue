<script setup lang="ts">
    import AuthRegister from '@/components/Forms/AuthRegister.vue';
</script>

<template>
  <div class="main-container">
      <div class="auth-wrapper">
           <AuthRegister/>
      </div>
  </div>
</template>

<style scoped>
.main-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center; 
    justify-content: center;
    background-color: var(--color-bg);
}

.auth-wrapper {
  
    width: 100%;
    max-width: 400px; 
    padding: 20px;
}
</style>