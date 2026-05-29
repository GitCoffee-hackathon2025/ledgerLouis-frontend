
<script setup lang="ts">
import { useRouter } from 'vue-router';
import UserService from '@/services/userService';

const router = useRouter();
const userService = new UserService();

const handleLogout = () => {
  userService.logout();
  router.push('/entrar');
};
</script>

<template>
    <div class="profile-card">
      <div class="header">
        <h2>Meu Perfil</h2>
        <span class="subtitle">Informações da sua conta</span>
      </div>
  
      <div class="info-section">
  
        <div class="info-group">
          <label>Nome</label>
          <div class="info-box"></div>
        </div>
  
        <div class="info-group">
          <label>Email</label>
          <div class="info-box"></div>
        </div>
  
        <div class="info-group">
          <label>ID do usuário</label>
          <div class="info-box"></div>
        </div>
  
        <div class="info-group">
          <label>Status da conta</label>
          <div class="info-box status-active"></div>
        </div>
  
      </div>
  
      <div class="actions">
        <button class="btn-primary">Editar Perfil</button>
        <button class="btn-logout" @click="handleLogout">Sair</button>
      </div>
    </div>
  </template>
  
  <style scoped>
  
  .profile-card {
    background-color: var(--color-surface);
    width: 100%;
    max-width: 420px;
    border-radius: 20px;
    padding: 2rem 1.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    font-family: var(--font-body);
  }
  
  
  .header {
    margin-bottom: 1.5rem;
  }
  
  .header h2 {
    margin: 0;
    font-size: 1.4rem;
    color: #1db954;
  }
  
  .subtitle {
    font-size: 0.85rem;
    color: var(--color-placeholder);
  }
  

  .info-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .info-group label {
    font-size: 0.8rem;
    margin-left: 12px;
    color: var(--color-placeholder);
    font-weight: 600;
    margin-bottom: 6px;
  }
  
  .info-box {
    background-color: var(--color-bg);
    padding: 14px 20px;
    border-radius: var(--radius-input);
    border: 2px solid transparent;
    font-size: 0.95rem;
    color: var(--color-text);
    transition: 0.3s ease;
  }
  
  .info-box:hover {
    border-color: var(--color-primary);
    box-shadow: 0 4px 12px var(--color-primary-glow);
  }
  

  .status-active {
    color: #1db954;
    font-weight: bold;
  }
  
  
  .actions {
    margin-top: 2rem;
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
  
  .btn-primary {
    background-color: var(--color-primary);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: var(--radius-input);
    cursor: pointer;
    font-weight: 600;
    transition: 0.3s ease;
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px var(--color-primary-glow);
  }

  .btn-logout {
    background-color: #ff4444;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: var(--radius-input);
    cursor: pointer;
    font-weight: 600;
    transition: 0.3s ease;
  }

  .btn-logout:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(255, 68, 68, 0.4);
  }
  </style>