import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/css/main.css';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

const themeStore = useThemeStore();
themeStore.init();

const authStore = useAuthStore();
authStore.hydrate();

app.use(router);
app.mount('#app');
