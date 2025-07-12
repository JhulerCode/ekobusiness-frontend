import '@/assets/base.css'

import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

createApp(App)
    .use(router)
    .use(createPinia().use(piniaPluginPersistedstate))
    .mount('#app')