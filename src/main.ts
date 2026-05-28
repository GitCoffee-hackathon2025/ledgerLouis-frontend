import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { registerSW } from 'virtual:pwa-register';
import '@/assets/global/Global.css'
import App from './App.vue';
import router from './router';
import { useUserStore } from './stores/userStore.ts';

const updateSW = registerSW({
  onNeedRefresh() {
    // opcional: notificar usuário para atualizar app
    console.log('Nova versão disponível.');
  },
  onOfflineReady() {
    console.log('App PWA está pronto offline.');
  }
});

const app = createApp(App);

app.use(createPinia());
app.use(router);


app.mount('#app');

const userStore = useUserStore();
const savedAcessToken = localStorage.getItem('token')
if (!savedAcessToken) {
  console.log('Nenhum token encontrado no localStorage.')
}
if (savedAcessToken) {
  console.log('Token encontrado no localStorage, restaurando na store:', savedAcessToken)
  userStore.restoreAccessToken(savedAcessToken)
} else {
  console.log('Nenhum token para restaurar.')
}
export { updateSW };
