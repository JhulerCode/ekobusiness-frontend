<template>
    <div class="side-bar" :class="`${useAuth.showNavbar ? 'visible' : 'no-visible'}`">
        <div class="header">
            <div class="btn" @click="toogleNavbar">
                <i class="fa-solid fa-bars"></i>
            </div>
        </div>

        <div class="menu">
            <div v-for="(a, i) in menu" :key="i">
                <div
                    class="btn option"
                    @click="this.toggleList(a.label)"
                    :class="{
                        'option-active': a.children.some((b) => $route.name === b.goto),
                        'has-children': !a.goto,
                    }"
                >
                    <i :class="a.icon"></i>

                    <transition name="to-width-cero">
                        <span v-if="useAuth.showNavbar">{{ a.label }}</span>
                    </transition>

                    <span v-if="!a.goto && useAuth.showNavbar">
                        <i class="fa-solid fa-caret-down" v-if="grupoExpandido === a.label"></i>
                        <i class="fa-solid fa-caret-right" v-else></i>
                    </span>
                </div>

                <div
                    v-if="a.children && grupoExpandido === a.label && useAuth.showNavbar"
                    class="items-container"
                >
                    <div
                        v-for="(b, j) in a.children"
                        :key="j"
                        class="btn"
                        :class="{ 'option-active': useVistas.show?.[b.goto] }"
                        @click="navigateTo(b.goto)"
                    >
                        <transition name="to-width-cero">
                            <span v-if="useAuth.showNavbar">{{ b.label }}</span>
                        </transition>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            <div
                class="btn user-info"
                v-if="useAuth.usuario"
                @click="openUserMenu"
                :class="{ 'user-info-active': useModals?.show?.mUserMenu }"
            >
                <div class="user-foto">
                    {{ useAuth.usuario.nombres[0] }}
                </div>

                <transition name="to-width-cero">
                    <div class="user-texts" v-if="useAuth.showNavbar">
                        <p
                            class="user-name max-1line"
                            :title="`${useAuth.usuario.nombres} ${useAuth.usuario.apellidos}`"
                        >
                            {{ useAuth.usuario.nombres }} {{ useAuth.usuario.apellidos }}
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
    </div>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas.js'
import { useModals } from '@/pinia/modals.js'

export default {
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        grupoExpandido: null,
    }),
    computed: {
        menu() {
            return this.useAuth.menu
                .map((seccion) => {
                    const hijosFiltrados = seccion.children.filter((a) =>
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
    watch: {
        '$route.name': {
            immediate: true,
            handler(routeName) {
                // Auto-expandir el grupo del menú que contiene la vista activa
                if (!routeName) return
                for (const seccion of this.useAuth.menu) {
                    if (seccion.children.some((b) => b.goto === routeName)) {
                        this.grupoExpandido = seccion.label
                        break
                    }
                }
            },
        },
    },
    methods: {
        toogleNavbar() {
            this.useAuth.showNavbar = !this.useAuth.showNavbar
        },
        openUserMenu() {
            this.useModals.setModal('mUserMenu', 'Menu de usuario', null, null, true)
        },
        toggleList(label) {
            this.grupoExpandido = this.grupoExpandido === label ? null : label
        },
        navigateTo(routeName) {
            if (this.$route.name !== routeName) {
                this.$router.push({ name: routeName })
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.side-bar {
    height: 100vh;
    // display: flex;
    // flex-direction: column;
    // overflow-y: auto;
    display: grid;
    grid-template-rows: auto 1fr auto;
    overflow-y: hidden;
    overflow-x: hidden;
    transition: width 0.3s linear;
    border-right: var(--border);
}

.visible {
    width: 15rem;
}

.no-visible {
    width: 4.5rem;
}

.item-no-visible {
    width: 0;
}

.item-visible {
    width: auto;
}

.btn {
    padding: 0.8rem 1rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    overflow-x: hidden;
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
    position: sticky;
    top: 0;
    padding: 0.5rem;
    background-color: var(--bg-color2);
    border-bottom: var(--border);

    img {
        height: 2rem;
    }

    i {
        text-align: center;
        width: 1.5rem;
        flex-shrink: 0;
    }
}

.menu {
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.5rem;

    * {
        color: var(--text-color2);
    }

    .option {
        display: grid;
        grid-template-columns: 1.5rem 1fr;

        .left {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.8rem;
            align-items: center;
            overflow-x: hidden;

            i {
                text-align: center;
                font-size: 1.2rem;
            }

            span {
                width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
    }

    .has-children {
        display: grid;
        grid-template-columns: 1.5rem 1fr 0.5rem;
    }

    .items-container {
        margin: 0.2rem 0 0.2rem 1rem;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
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
    background-color: var(--bg-color2);
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
    width: 120px; /* ajusta al ancho real de tu imagen */
}

/* Transición */
.to-width-cero-enter-active,
.to-width-cero-leave-active {
    transition: width 0.2s ease;
    overflow: hidden;
}
</style>
