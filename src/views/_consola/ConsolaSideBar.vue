<template>
    <div class="side-bar" :class="`${useAuth.showNavbar ? 'visible' : 'no-visible'}`">
        <div class="header">
            <div class="btn" @click="toogleNavbar">
                <i class="fa-solid fa-bars"></i>
            </div>
        </div>

        <div class="menu">
            <div v-for="(a, i) in menu" :key="i" class="menu-item-wrapper">
                <div
                    class="btn option"
                    @click="this.toggleList(a.label, $event)"
                    :key="a.label"
                    :class="{
                        'option-active': a.children.some((b) => $route.name === b.goto),
                        'is-expanded': grupoExpandido === a.label,
                    }"
                >
                    <i :class="a.icon"></i>

                    <transition name="to-width-cero">
                        <span v-if="useAuth.showNavbar">{{ a.label }}</span>
                    </transition>
                </div>

                <div
                    v-if="a.children && grupoExpandido === a.label"
                    class="items-container"
                    ref="itemsContainer"
                    :style="{
                        position: 'fixed',
                        top: flyoutPosition.top + 'px',
                        left: flyoutPosition.left + 14 + 'px',
                    }"
                >
                    <strong class="items-container-daddy" v-if="!useAuth.showNavbar">
                        {{ a.label }}
                    </strong>

                    <div
                        v-for="(b, j) in a.children"
                        :key="j"
                        class="btn"
                        :class="{
                            'option-active': useVistas.show?.[b.goto] || $route.name === b.goto,
                        }"
                        @click="navigateTo(b.goto)"
                    >
                        <span>{{ b.label }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            <div
                class="btn user-info"
                v-if="useAuth.usuario"
                @click="toggleUserMenu($event)"
                :class="{ 'user-info-active': showUserFlyout }"
            >
                <div class="user-foto">
                    {{ useAuth.usuario.nombres ? useAuth.usuario.nombres[0] : '' }}
                </div>

                <transition name="to-width-cero">
                    <div class="user-texts" v-if="useAuth.showNavbar">
                        <p class="user-name max-1line" :title="``">
                            {{ useAuth.usuario.nombres }}
                        </p>
                        <p class="max-1line" :title="useAuth.usuario.cargo">
                            <small>{{ useAuth.usuario.cargo }}</small>
                        </p>
                    </div>
                </transition>
            </div>

            <div class="version">
                <small>v{{ useAuth.app_version }}</small>
            </div>
        </div>

        <!-- User Menu Flyout -->
        <div
            v-if="showUserFlyout"
            class="user-menu-flyout"
            ref="userFlyout"
            :style="{
                position: 'fixed',
                top: userFlyoutPosition.top + 'px',
                left: userFlyoutPosition.left + 14 + 'px',
            }"
        >
            <div class="user-header">
                <div class="user-avatar-large">
                    {{ useAuth.usuario.nombres ? useAuth.usuario.nombres[0] : '' }}
                </div>
                <div class="user-details">
                    <p class="user-name max-1line" :title="``">
                        {{ useAuth.usuario.nombres }}
                    </p>
                    <p class="max-1line" :title="useAuth.usuario.cargo">
                        <small>{{ useAuth.usuario.cargo }}</small>
                    </p>
                </div>
            </div>

            <div class="user-menu-list">
                <div class="user-menu-item" @click="openPreferenciasUsuario">
                    <i class="fa-solid fa-sliders"></i>
                    <span>Preferencias</span>
                </div>

                <div class="user-menu-item" @click="updateSession">
                    <i class="fa-solid fa-rotate-right"></i>
                    <span>Actualizar sesión</span>
                </div>

                <div class="user-menu-item" @click="logout">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span>Cerrar sesión</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas.js'
import { useModals } from '@/pinia/modals.js'
import { urls, get } from '@/utils/crud'
import { nextTick } from 'vue'

export default {
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        grupoExpandido: null,
        showUserFlyout: false,
        flyoutPosition: { top: 0, left: 0 },
        userFlyoutPosition: { top: 0, left: 0 },
    }),
    computed: {
        menu() {
            return this.useAuth.menu
                .map((seccion) => {
                    const hijosFiltrados = seccion.children.filter(
                        (a) =>
                            a.showInMenu !== false &&
                            (this.useAuth.usuario.permisos || []).some((p) =>
                                p.startsWith(a.goto + ':'),
                            ),
                    )

                    return hijosFiltrados.length > 0
                        ? { ...seccion, children: hijosFiltrados }
                        : null
                })
                .filter((seccion) => seccion !== null)
        },
    },
    mounted() {
        document.addEventListener('mousedown', this.handleClickOutside)
    },
    unmounted() {
        document.removeEventListener('mousedown', this.handleClickOutside)
    },
    methods: {
        toogleNavbar() {
            this.useAuth.showNavbar = !this.useAuth.showNavbar
            this.grupoExpandido = null
            this.showUserFlyout = false
        },
        async toggleUserMenu(event) {
            if (this.showUserFlyout) {
                this.showUserFlyout = false
                return
            }

            if (event) {
                const rect = event.currentTarget.getBoundingClientRect()
                this.userFlyoutPosition = {
                    top: rect.top,
                    left: rect.right,
                }
            }

            this.showUserFlyout = true
            this.grupoExpandido = null

            await nextTick()
            this.calculateUserFlyoutPosition()
        },
        calculateUserFlyoutPosition() {
            const container = this.$refs.userFlyout
            if (!container) return

            const rect = container.getBoundingClientRect()
            const windowHeight = window.innerHeight
            const rem = 14

            if (this.userFlyoutPosition.top + rect.height > windowHeight) {
                this.userFlyoutPosition.top = windowHeight - rect.height - rem
            }
        },
        async openPreferenciasUsuario() {
            this.useModals.setModal('mUserPreferences', 'Preferencias', null, null, true)
            this.showUserFlyout = false
        },
        async updateSession() {
            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await get(`${urls.colaboradores}/reload-user`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            if (res.data == null) {
                this.$router.replace({ name: 'SignIn' })
                this.useAuth.initVars()
                this.useVistas.initVars()
                this.useModals.initVars()
            } else {
                this.useAuth.setSessionDatos(res)
            }
            this.showUserFlyout = false
        },
        async logout() {
            await this.useAuth.logout(this.$router)
        },
        async toggleList(label, event) {
            if (this.grupoExpandido === label) {
                this.grupoExpandido = null
                return
            }

            if (event) {
                const rect = event.currentTarget.getBoundingClientRect()
                this.flyoutPosition = {
                    top: rect.top,
                    left: rect.right,
                }
            }

            this.grupoExpandido = label
            this.showUserFlyout = false

            // Ajustar posición si se sale de la pantalla
            await nextTick()
            this.calculateFlyoutPosition()
        },
        calculateFlyoutPosition() {
            const container = this.$refs.itemsContainer
            if (!container) return

            const rect = container[0].getBoundingClientRect()
            const windowHeight = window.innerHeight
            const rem = 14 // 1rem

            // Si la ventanita supera el límite inferior
            if (this.flyoutPosition.top + rect.height > windowHeight) {
                this.flyoutPosition.top = Math.max(
                    3 * rem + rem, // ConsolaHeader (3rem=48px) + un poco de margen
                    windowHeight - rect.height - rem,
                )
            }
        },
        handleClickOutside(event) {
            if (this.grupoExpandido) {
                const isOption = event.target.closest('.option')
                const isContainer = event.target.closest('.items-container')

                if (!isOption && !isContainer) {
                    this.grupoExpandido = null
                }
            }

            if (this.showUserFlyout) {
                const isUserInfo = event.target.closest('.user-info')
                const isUserFlyout = event.target.closest('.user-menu-flyout')

                if (!isUserInfo && !isUserFlyout) {
                    this.showUserFlyout = false
                }
            }
        },
        navigateTo(routeName) {
            this.grupoExpandido = null
            if (this.$route.name !== routeName) {
                this.$router.push({ name: routeName })
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.side-bar {
    height: 100dvh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    overflow-y: hidden;
    overflow-x: hidden;
    transition: width 0.3s linear;
    border-right: var(--border);
    background-color: var(--bg-color2);
}

.visible {
    width: 15rem;
}

.no-visible {
    width: 4.5rem;
}

.btn {
    padding: 0.8rem 1rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;

    i {
        font-size: 1.2rem;
        color: var(--text-color2);
    }

    &:hover {
        cursor: pointer;
        background-color: var(--bg-color);
    }
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
    border-bottom: var(--border);
    position: relative;

    i {
        text-align: center;
        width: 1.5rem;
        flex-shrink: 0;
    }
}

.menu {
    overflow-y: auto;
    overflow-x: visible;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.5rem;

    * {
        color: var(--text-color2);
    }

    .menu-item-wrapper {
        position: relative;
    }

    .option {
        display: grid;
        grid-template-columns: 1.5rem 1fr;

        span {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    .is-expanded {
        background-color: var(--bg-color);
    }

    .items-container {
        min-width: 15rem;
        max-height: calc(100vh - 4.5rem); // 3rem del header + márgenes
        overflow-y: auto;
        overflow-x: hidden;
        background-color: var(--bg-color2);
        border: var(--border);
        border-radius: 0.5rem;
        box-shadow: 0rem 0rem 1rem var(--shadow-color);
        z-index: 3;
        padding: 0.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;

        .items-container-daddy {
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            font-size: 1.2rem;
        }
    }

    .option-active {
        background-color: var(--bg-color);

        * {
            color: var(--primary-color) !important;
        }
    }
}

.footer {
    padding: 0.5rem;
    border-top: var(--border);

    .user-info {
        .user-foto {
            width: 1.5rem;
            height: 1.5rem;
            border-radius: 50%;
            background-color: var(--primary-color);
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1rem;
            color: white;
            overflow: hidden;
            flex-shrink: 0;
        }

        .user-texts {
            overflow: hidden;
            width: 10rem;

            .user-name {
                font-size: 0.85rem;
                font-weight: bold;
            }
        }
    }

    .user-info-active {
        background-color: var(--bg-color);
    }

    .version {
        text-align: center;
        margin-top: 0.5rem;
    }
}

.user-menu-flyout {
    min-width: 18rem;
    background-color: var(--bg-color2);
    border: var(--border);
    border-radius: 0.5rem;
    box-shadow: 0 0 1rem var(--shadow-color);
    z-index: 2;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .user-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: var(--border);

        .user-avatar-large {
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            background-color: var(--primary-color);
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.2rem;
            color: white;
            font-weight: bold;
        }

        .user-details {
            display: flex;
            flex-direction: column;

            .user-name-full {
                font-weight: bold;
                font-size: 1rem;
                color: var(--text-color);
            }

            .user-role {
                font-size: 0.85rem;
                color: var(--text-color2);
            }
        }
    }

    .user-menu-list {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;

        .user-menu-item {
            cursor: pointer;
            padding: 0.5rem 0.8rem;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;

            &:hover {
                background-color: var(--bg-color-hover);
            }

            * {
                font-size: 0.9rem;
            }

            &:hover {
                background-color: var(--bg-color);
            }
        }
    }
}

/* Estado inicial al entrar */
.to-width-cero-enter-from,
.to-width-cero-leave-to {
    width: 0;
}

/* Estado final al entrar */
.to-width-cero-enter-to,
.to-width-cero-leave-from {
    width: 120px;
}

/* Transición */
.to-width-cero-enter-active,
.to-width-cero-leave-active {
    transition: width 0.2s ease;
    overflow: hidden;
}
</style>
