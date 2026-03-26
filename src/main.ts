import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { registerSW } from 'virtual:pwa-register';

import App from './App.vue';
import router from './router';

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

export { updateSW };
