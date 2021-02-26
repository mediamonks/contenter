import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import './firebase';

const vueApp = createApp(App);
vueApp.use(router);
vueApp.mount('#app');

export default vueApp;
