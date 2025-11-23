<template>
    <main>
        <MainHead />

        <div class="main-body">
            <SideBar class="side-bar" />

            <MainCenter />
        </div>
    </main>

    <mUserMenu v-if="useModals?.show?.mUserMenu" class="user-menu" />
    <mUserPreferences v-if="useModals?.show?.mUserPreferences" />

    <mLogin v-if="useModals?.show?.mLogin" />
</template>

<script>
import { mLogin } from '@jhuler/components'

import MainHead from '@/views/_consola/MainHead.vue'
import SideBar from '@/views/_consola/SideBar.vue'
import MainCenter from '@/views/_consola/MainCenter.vue'

import mUserMenu from './mUserMenu.vue'
import mUserPreferences from './mUserPreferences.vue'

import { useAuth } from '@/pinia/auth.js'
import { useVistas } from '@/pinia/vistas.js'
import { useModals } from '@/pinia/modals.js'

export default {
    components: {
        MainHead,
        SideBar,
        MainCenter,

        mUserMenu,
        mUserPreferences,

        mLogin,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),
    }),
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
    grid-template-rows: auto 1fr;
    grid-template-columns: 1fr;
    overflow-x: hidden;
    background-color: var(--bg-color2);

    .main-body {
        height: 100%;
        display: grid;
        grid-template-columns: auto 1fr;
        overflow-y: hidden;
        padding: 0 1rem 1rem 1rem;
    }
}

.user-menu {
    top: 4rem;
    right: 2rem;
}
</style>
