<script lang="ts" setup>
import UserInfo from "../components/UserInfo.vue"
</script>
<template>
    <div class="main-container">
        <div class="auth-wrapper">
            <UserInfo />
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