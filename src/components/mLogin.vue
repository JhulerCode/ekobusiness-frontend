<template>
    <JdModal modal="mLogin" :buttons="buttons" @button-click="(action) => this[action]()" :btnClose="false">
        <div class="container-datos">
            <small>Ingrese sus datos de acceso</small>

            <JdInput label="Usuario" :nec="true" v-model="usuario" />
            <JdInputPassword label="Contraseña" :nec="true" v-model="contrasena" />
        </div>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdInput from './inputs/JdInput.vue'
import JdInputPassword from '@/components/inputs/JdInputPassword.vue'

import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'

import { urls, post } from '@/utils/crud'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdInputPassword,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),

        usuario: null,
        contrasena: null,

        buttons: [
            { text: 'Cancelar', action: 'cancelar', tipo: '2', show: true },
            { text: 'Ingresar', action: 'ingresar', show: true },
        ],
    }),
    created() {
        this.modal = this.useModals.mEditar
        this.usuario = localStorage.getItem('remember-usuario')
        // this.contrasena = localStorage.getItem('remember-usuario')
        if (this.usuario == 'jhuler') {
            this.contrasena = '2801'
        }
        else {
            this.contrasena = '1234'
        }
    },
    methods: {
        async ingresar() {
            if (this.usuario == '' || this.contrasena == '') {
                return jmsg('warning', 'Ingrese usuario y contraseña')
            }

            const auth = {
                usuario: this.usuario,
                contrasena: this.contrasena,
            }

            this.useAuth.setLoading(true, 'Ingresando...')
            const res = await post(urls.signin, auth, 'Acceso correcto')
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useAuth.token = res.token
            localStorage.setItem('remember-usuario', this.usuario)

            await this.useAuth.login()

            this.useModals.show.mLogin = false
        },
        cancelar() {
            this.$router.replace({ name: 'SignIn' })
        }
    }
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 20rem;
    gap: 1rem;
}
</style>
