import './assets/base.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import VistaLayout from '@/components/VistaLayout/VistaLayout.vue'
import VistaDetalleLayout from '@/components/VistaDetalleLayout.vue'
// import { JdModal } from '@jhuler/components'

// --- Components --- //
import JdTable from '@/components/JdTable/JdTable.vue'

createApp(App)
    .use(router)
    .use(createPinia().use(piniaPluginPersistedstate))
    .component('JdTable', JdTable)
    .component('VistaLayout', VistaLayout)
    .component('VistaDetalleLayout', VistaDetalleLayout)
    // .component('JdModal', JdModal)
    .mount('#app')
