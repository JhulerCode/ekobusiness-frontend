<template>
    <JdModal
        modal="mUserMenu"
        :hasHead="false"
        :hasBack="false"
        padding="0.5rem"
        :closeOnClickOutside="true"
        :closeOnInputEsc="true"
    >
        <ul>
            <li @click="openPreferenciasUsuario">
                <i class="fa-solid fa-sliders" @click="openPreferencias"></i>
                <span>Preferencias</span>
            </li>

            <li @click="updateSession">
                <i class="fa-solid fa-rotate-right"></i>
                <span>Actualizar sesión</span>
            </li>

            <li @click="logout">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>Salir del sistema</span>
            </li>
        </ul>
    </JdModal>
</template>

<script>
import { JdModal } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

export default {
    components: {
        JdModal,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),

        modal: {},
    }),
    created() {
        this.modal = this.useModals.mUserMenu
    },
    methods: {
        async openPreferenciasUsuario() {
            this.useModals.setModal('mUserPreferences', 'Preferencias', null, null, true)
            this.useModals.show.mUserMenu = false
        },
        updateSession() {
            this.useAuth.login()
        },
        async logout() {
            await this.useAuth.logout(this.$router)
        },
    },
}
</script>

<style lang="scss" scoped>
li {
    cursor: pointer;
    padding: 0.5rem 0.8rem;
    border-radius: 0.5rem;
    display: flex;
    gap: 0.5rem;

    &:hover {
        background-color: var(--bg-color-hover);
    }

    * {
        font-size: 0.9rem;
    }
}
</style>
