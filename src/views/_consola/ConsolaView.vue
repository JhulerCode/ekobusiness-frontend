<template>
    <main>
        <ConsolaSideBar class="side-bar" />

        <div class="main-body">
            <ConsolaHeader />

            <ConsolaCenter v-if="useAuth?.usuario?.id" />
        </div>
    </main>

    <mUserMenu v-if="useModals?.show?.mUserMenu" class="user-menu" />
    <mUserPreferences v-if="useModals?.show?.mUserPreferences" />

    <mLogin v-if="useModals?.show?.mLogin" />
</template>

<script>
import { mLogin } from '@jhuler/components'

import ConsolaHeader from '@/views/_consola/ConsolaHeader.vue'
import ConsolaSideBar from '@/views/_consola/ConsolaSideBar.vue'
import ConsolaCenter from '@/views/_consola/ConsolaCenter.vue'

import mUserMenu from './mUserMenu.vue'
import mUserPreferences from './mUserPreferences.vue'

import { useAuth } from '@/pinia/auth.js'
import { useModals } from '@/pinia/modals.js'

export default {
    components: {
        ConsolaHeader,
        ConsolaSideBar,
        ConsolaCenter,

        mUserMenu,
        mUserPreferences,

        mLogin,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
    }),
    created() {
        this.useAuth.setLoading(false)
    },
    mounted() {
        window.addEventListener('keydown', this.shortCuts)
    },
    unmounted() {
        window.removeEventListener('keydown', this.shortCuts)
    },
    methods: {
        shortCuts(event) {
            if (event.ctrlKey && event.key.toLowerCase() === 'b') {
                event.preventDefault()
                this.useAuth.showNavbar = !this.useAuth.showNavbar
            }
        },
    },
}
</script>

<style lang="scss">
main {
    height: 100dvh;
    width: 100%;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: 1fr;
    overflow-x: hidden;
    background-color: var(--bg-color2);

    .main-body {
        height: 100%;
        display: grid;
        grid-template-rows: auto 1fr;
        overflow-y: hidden;
    }
}

.user-menu {
    bottom: 6rem;
    left: 0.5rem;
}
</style>
