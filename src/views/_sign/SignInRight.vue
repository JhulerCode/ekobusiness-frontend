<template>
    <div class="right">
        <div class="actions">
            <div class="btn" @click="reloadWindow">
                <i class="fa-solid fa-rotate-right"></i>
            </div>

            <div
                class="btn"
                @click="darkLigthMode"
                :title="`Modo ${!useAuth.isDarkMode ? 'oscuro' : 'claro'}`"
            >
                <i class="fa-regular fa-moon" v-if="!useAuth.isDarkMode"></i>
                <i class="fa-regular fa-sun" v-else></i>
            </div>
        </div>

        <div class="info">
            <strong>¡Bienvenido!</strong>
            <p>Ingrese sus datos de acceso</p>
        </div>

        <JdInput :nec="true" placeholder="Usuario" v-model="usuario" height="3" class="mrg-btm1" />

        <JdInputPassword
            :nec="true"
            placeholder="Contraseña"
            v-model="contrasena"
            height="3"
            class="mrg-btm2"
        />
        <JdButton text="INGRESAR" @click="signin()" class="boton-ingresar" />
    </div>
</template>

<script>
import { JdInput, JdInputPassword, JdButton } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

import { urls, post } from '@/utils/crud'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdInput,
        JdInputPassword,
        JdButton,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),

        usuario: '',
        contrasena: '',
        token: '',
        shown: false,
    }),
    created() {},
    mounted() {
        const remembered = localStorage.getItem('remember-usuario')
        if (remembered) {
            this.usuario = remembered
            // this.contrasena = remembered
        }
    },
    methods: {
        reloadWindow() {
            window.location.reload()
        },
        async darkLigthMode() {
            const send = {
                id: this.useAuth.usuario.colaborador,
                theme: this.useAuth.isDarkMode == true ? '1' : '2',
            }

            this.useAuth.setTheme(send.theme)
        },

        async signin() {
            if (this.usuario == '' || this.contrasena == '') {
                return jmsg('warning', 'Ingrese usuario y contraseña')
            }

            const auth = {
                usuario: this.usuario,
                contrasena: this.contrasena,
            }

            this.useAuth.setLoading(true, 'Ingresando...')
            const { code, token } = await post(urls.signin, auth, 'Acceso correcto')
            this.useAuth.setLoading(false)

            if (code != 0) return

            this.useAuth.token = token

            await this.useAuth.login()
            this.$router.replace({ name: 'ConsolaView' })
            this.useVistas.showVista(this.useAuth.usuario.vista_inicial)
        },
    },
}
</script>

<style lang="scss" scoped>
.right {
    // width: 30rem;
    // max-width: 80%;
    padding: 5rem 5rem;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    border-radius: 0 2rem 2rem 0;
    // backdrop-filter: blur(3px);
    // -webkit-backdrop-filter: blur(3px);

    .actions {
        position: absolute;
        top: 1.5rem;
        right: 2rem;
        display: flex;

        .btn {
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;

            i {
                color: var(--text-color2);
            }

            &:hover {
                * {
                    color: var(--text-color);
                }
            }
        }
    }

    .container-logo {
        height: 8rem;
        max-width: 20rem;
        margin-bottom: 2rem;

        img {
            border-radius: 1rem;
            max-height: 100%;
            max-width: 100%;
        }
    }

    .info {
        margin-bottom: 2rem;

        strong {
            font-size: 1.4rem;
        }

        p {
            margin-top: 1rem;
            color: var(--text-color2);
        }
    }

    .boton-ingresar {
        width: 100%;
        height: 3rem;
    }
}
</style>
