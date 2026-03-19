import './assets/base.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// --- Components --- //
import JdTable from '@/components/JdTable/JdTable.vue'
import VistaLayout from '@/components/VistaLayout/VistaLayout.vue'
import VistaDetalleLayout from '@/components/VistaDetalleLayout.vue'
import {
    JdButton,
    JdCheckBox,
    JdInputPassword,
    JdSelect,
    JdSwitch,
    JdTextArea,
    // Modals
    JdModal,
    mAnular,
    mLogin,
    mPdfViewer,
    LoadingSpin,
} from '@jhuler/components'
import JdInput from '@/components/inputs/JdInput.vue'
import JdSelectQuery from '@/components/inputs/JdSelectQuery.vue'
import JdInputFile from '@/components/inputs/JdInputFile.vue'
import JdInputImage from '@/components/inputs/JdInputImage.vue'

createApp(App)
    .use(router)
    .use(createPinia().use(piniaPluginPersistedstate))
    .component('JdTable', JdTable)
    .component('VistaLayout', VistaLayout)
    .component('VistaDetalleLayout', VistaDetalleLayout)
    .component('JdButton', JdButton)
    .component('JdCheckBox', JdCheckBox)
    .component('JdInput', JdInput)
    .component('JdInputFile', JdInputFile)
    .component('JdInputImage', JdInputImage)
    .component('JdInputPassword', JdInputPassword)
    .component('JdSelect', JdSelect)
    .component('JdSelectQuery', JdSelectQuery)
    .component('JdSwitch', JdSwitch)
    .component('JdTextArea', JdTextArea)
    .component('JdModal', JdModal)
    .component('mAnular', mAnular)
    .component('mLogin', mLogin)
    .component('mPdfViewer', mPdfViewer)
    .component('LoadingSpin', LoadingSpin)
    .mount('#app')
