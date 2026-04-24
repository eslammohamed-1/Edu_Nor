import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/css/main.css';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';
import { useCoursesStore } from '@/stores/courses';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

const themeStore = useThemeStore();
themeStore.init();

const authStore = useAuthStore();
authStore.hydrate();
useCoursesStore().applyUserCurriculumContext(authStore.user);

app.use(router);
app.mount('#app');
