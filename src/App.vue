<template>
    <router-view />

    <div class="box-app-version">
        <small>v{{ useAuth.app_version }}</small>
    </div>

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

        this.isLogged()
    },
    methods: {
        async isLogged() {
            const auth = await this.useAuth.login()

            if (!auth) {
                if (this.$route.name != 'SignIn') {
                    this.$router.replace({ name: 'SignIn' })
                    this.useAuth.initVars()
                    this.useVistas.initVars()
                    this.useModals.initVars()
                }
            } else {
                const isInConsola = this.$route.path.startsWith('/consola')
                if (!isInConsola) {
                    const vistaInicial = this.useAuth.usuario.vista_inicial
                    this.$router.replace({ name: vistaInicial || 'ConsolaView' })
                }
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.box-app-version {
    position: absolute;
    bottom: 0.25rem;
    right: 0.25rem;
}
</style>
