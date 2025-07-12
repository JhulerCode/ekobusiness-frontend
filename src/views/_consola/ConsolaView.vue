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

    <LoadingSpin v-if="useAuth.loading.show" :text="useAuth.loading.text" scale="1.5" style="z-index: 3" />
</template>

<script>
import MainHead from '@/views/_consola/header/MainHead.vue'
import SideBar from '@/views/_consola/sidebar/SideBar.vue'
import MainCenter from '@/views/_consola/center/MainCenter.vue'
import mLogin from '@/components/mLogin.vue'
import LoadingSpin from '@/components/LoadingSpin.vue'

import mUserMenu from './header/mUserMenu.vue'
import mUserPreferences from './header/mUserPreferences.vue'

import { useAuth } from '@/pinia/auth.js'
import { useVistas } from '@/pinia/vistas.js'
import { useModals } from '@/pinia/modals.js'

export default {
    components: {
        MainHead,
        SideBar,
        MainCenter,
        mLogin,
        LoadingSpin,

        mUserMenu,
        mUserPreferences,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),
    }),
    created() {
        this.isLogged()
    },
    methods: {
        async isLogged() {
            const auth = await this.useAuth.login()
            // console.log(this.useAuth.usuario)
            if (!auth) {
                this.$router.replace({ name: 'SignIn', query: { ruc: this.useAuth.ruc } })
            }
            else {
                this.useVistas.showVista(this.useAuth.usuario.vista_inicial)
            }
        }
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
    // background-color: var(--primary-color);

    .main-body {
        height: 100%;
        // display: flex;
        display: grid;
        grid-template-columns: auto 1fr;
        overflow-y: hidden;
        padding: 0 1rem 1rem 1rem;
        // gap: 1rem;
    }
}

.user-menu {
    top: 4rem;
    right: 2rem;
}

// @media (max-width: 540px) {
//     .main-body{
//         grid-template-columns: auto 100% !important;
//         // overflow-x: hidden;
//     }
// }</style>