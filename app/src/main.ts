import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/css/main.css';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';
import { useAdminSettingsStore } from '@/stores/admin/adminSettings';
import { installGlobalErrorHandler } from './plugins/globalErrorHandler';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

const themeStore = useThemeStore();
themeStore.init();

useAdminSettingsStore().init();

const authStore = useAuthStore();
authStore.hydrate();

app.use(router);
installGlobalErrorHandler(app, router);
app.mount('#app');
