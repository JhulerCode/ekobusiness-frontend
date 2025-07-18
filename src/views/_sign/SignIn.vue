<template>
    <main class="signin">
        <div class="degradado">
            <div class="particles"></div>

            <div class="branding-info">
                <h2>Gestión Integral Empresarial</h2>

                <p class="slogan">Soluciones para cada etapa de tu operación</p>

                <ul class="areas">
                    <li>
                        <span class="icon">🚚</span>
                        <span><strong>Logística de Entrada</strong><br><small>Recepción y control eficiente de insumos y
                                materiales.</small></span>
                    </li>
                    <li>
                        <span class="icon">🏭</span>
                        <span><strong>Producción</strong><br><small>Planificación, seguimiento y control de
                                procesos productivos.</small></span>
                    </li>
                    <li>
                        <span class="icon">⚙️</span>
                        <span><strong>Operaciones</strong><br><small>Gestión centralizada de recursos y actividades
                                diarias.</small></span>
                    </li>
                    <li>
                        <span class="icon">🧪</span>
                        <span><strong>Calidad</strong><br><small>Control y aseguramiento de la calidad en cada
                                etapa.</small></span>
                    </li>
                    <li>
                        <span class="icon">🚚</span>
                        <span><strong>Logística de Salida</strong><br><small>Despacho y distribución eficiente de
                                productos terminados.</small></span>
                    </li>
                </ul>
                <!-- <div class="frase-final">
                    <em>Impulsando la eficiencia y el crecimiento de tu empresa.</em>
                </div> -->
            </div>
        </div>

        <div class="card">
            <div class="actions">
                <div class="btn" @click="darkLigthMode" :title="`Modo ${!useAuth.isDarkMode ? 'oscuro' : 'claro'}`">
                    <i class="fa-regular fa-moon" v-if="!useAuth.isDarkMode"></i>
                    <i class="fa-regular fa-sun" v-else></i>
                </div>
            </div>

            <div class="container-logo">
                <img src="@/assets/img/logo-sunka-black.webp" v-if="!useAuth.isDarkMode">
                <img src="@/assets/img/logo-sunka-white.webp" v-else>
            </div>

            <div class="info">
                <strong>¡Bienvenido!</strong>
                <p>Ingrese sus datos de acceso</p>
            </div>

            <JdInput :nec="true" label="Usuario" v-model="usuario" height="3" class="mrg-btm1" />
            <JdInputPassword :nec="true" label="Contraseña" v-model="contrasena" height="3" class="mrg-btm2" />
            <JdButton text="INGRESAR" @click="signin()" class="boton-ingresar" />
        </div>
    </main>
</template>

<script>
import JdInput from '@/components/inputs/JdInput.vue'
import JdInputPassword from '@/components/inputs/JdInputPassword.vue'
import JdButton from '@/components/inputs/JdButton.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas.js'

import { urls, post } from '@/utils/crud'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdInput,
        JdInputPassword,
        JdButton
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),

        usuario: '', contrasena: '',
    }),
    mounted() {
        this.generateParticles()

        const remembered = localStorage.getItem('remember-usuario')
        if (remembered) {
            this.usuario = remembered
            // this.contrasena = remembered
        }
    },
    methods: {
        async signin() {
            if (this.spinBtnSignIn) return

            if (this.usuario == '' || this.contrasena == '') {
                return jmsg('warning', 'Ingrese usuario y contraseña')
            }

            const auth = {
                usuario: this.usuario,
                contrasena: this.contrasena,
            }

            this.useAuth.setLoading(true, 'Ingresando...')
            const { code, token } = await post(urls.signin, auth, 'Acceso correcto')
            this.useAuth.setLoading(false, '')

            if (code != 0) return

            this.useAuth.token = token

            localStorage.setItem('remember-usuario', this.usuario)

            await this.useAuth.login()
            this.$router.replace({ name: 'ConsolaView' })
            this.useVistas.showVista(this.useAuth.usuario.vista_inicial)
        },
        darkLigthMode() {
            document.body.classList.toggle('dark-mode')
            this.useAuth.isDarkMode = document.body.classList.contains('dark-mode')
        },
        generateParticles() {
            const particleContainer = this.$el.querySelector(".particles");

            const createParticle = () => {
                const particle = document.createElement("div");
                particle.className = "particle";

                const randomX = Math.random() * 100; // % de ancho
                const randomY = Math.random() * 100; // % de altura
                const randomDX = (Math.random() - 0.5) * 2; // Desplazamiento horizontal
                const randomDY = (Math.random() - 0.5) * 2; // Desplazamiento vertical
                const duration = Math.random() * 3 + 3; // Entre 3s y 6s

                particle.style.left = `${randomX}%`;
                particle.style.top = `${randomY}%`;
                particle.style.setProperty("--dx", randomDX);
                particle.style.setProperty("--dy", randomDY);
                particle.style.animationDuration = `${duration}s`;

                particleContainer.appendChild(particle);

                setTimeout(() => {
                    particle.remove();
                }, duration * 1000);
            };

            setInterval(createParticle, 300);
        }
    }
}
</script>

<style lang="scss" scoped>
.signin {
    height: 100dvh;
    width: 100vw;
    overflow: hidden;
    display: flex;
}

.degradado {
    height: 100dvh;
    width: 65%;
    position: relative;
    // background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 40%, #60a5fa 70%, #22d3ee 100%);
    // background: radial-gradient(circle at 80% 20%, #38bdf8 0%, #1e3a8a 60%);
    // background-blend-mode: screen, lighten;
    // background-size: 200% 200%;
    // animation: gradientShift 5s ease infinite;
    background-color: var(--bg-color2);

    .particles {
        position: absolute;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: hidden;

        ::v-deep(.particle) {
            position: absolute;
            width: 0.7rem;
            height: 0.7rem;
            // background-color: rgba(255, 255, 255, 0.8);
            // background-color: var(--text-color2);
            background-color: var(--primary-color);
            border-radius: 50%;
            opacity: 0.8;
            animation: particleAnimation 6s linear infinite,
        }
    }

    .branding-info {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        h2 {
            font-size: 2.2rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            letter-spacing: 1px;
            color: var(--text-color);
        }

        .slogan {
            font-size: 1.1rem;
            margin-bottom: 2rem;
            color: var(--text-color2);
            font-weight: 500;
            letter-spacing: 0.5px;
        }

        .areas {
            list-style: none;
            padding: 0;
            // margin: 0 0 2rem 0;
            display: flex;
            flex-direction: column;
            gap: 1.2rem;

            li {
                display: flex;
                align-items: flex-start;
                gap: 1rem;
                // background-color: var(--bg-color-transparent);
                border-radius: 0.7rem;
                padding: 1rem 1.2rem;
                box-shadow: 0 2px 12px 0 rgba(30, 58, 138, 0.07);

                .icon {
                    font-size: 2rem;
                    flex-shrink: 0;
                    // filter: drop-shadow(0 2px 6px #38bdf8aa);
                }

                strong {
                    font-size: 1.2rem;
                    color: var(--text-color2);
                }

                small {
                    color: var(--text-color2);
                    font-size: 0.9rem;
                }
            }
        }

        // .frase-final {
        //     margin-top: 1.5rem;
        //     font-size: 1.08rem;
        //     color: #bae6fd;
        //     font-style: italic;
        //     text-shadow: 0 1px 8px #1e3a8a44;
        // }
    }
}

.card {
    height: 100dvh;
    width: 35%;
    max-width: 95%;
    padding: 0 5rem;
    text-align: center;
    background-color: var(--bg-color);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .actions {
        position: absolute;
        top: 2rem;
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
                // background-color: var(--bg-color2);
                // border: solid 1px var(--primary-color);

                * {
                    color: var(--primary-color);
                }
            }
        }
    }

    .container-logo {
        width: 15rem;
        margin-bottom: 2rem;

        img {
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

@keyframes gradientShift {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

@keyframes particleAnimation {
    0% {
        opacity: 1;
        transform: scale(1) translate3d(0, 0, 0);
    }

    100% {
        opacity: 0;
        transform: scale(1.5) translate3d(5rem, 10rem, 0);
    }
}


@media (max-width: 900px) {
    .degradado {
        display: none !important;
    }

    .card {
        width: 100vw !important;
        max-width: 100vw !important;
    }
}
</style>
