<template>
    <router-view />

    <LoadingSpin
        v-if="useAuth.loading.show"
        :text="useAuth.loading.text"
        scale="1.5"
        style="z-index: 3"
    />
</template>

<script>
import { LoadingSpin } from '@jhuler/components'

import { useAuth } from '@/pinia/auth.js'
import { useVistas } from '@/pinia/vistas.js'
import { useModals } from '@/pinia/modals.js'

export default {
    components: {
        LoadingSpin,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),
    }),
    created() {
        if (this.useAuth.isDarkMode) {
            document.body.classList.add('dark-mode')
        }
    },
}
</script>
