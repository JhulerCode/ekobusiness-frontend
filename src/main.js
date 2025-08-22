import './assets/base.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import './registerServiceWorker.js'

createApp(App)
    .use(router)
    .use(createPinia().use(piniaPluginPersistedstate))
    .mount('#app')