<template>
    <header>
        <div class="left">
            <nav class="breadcrumbs" v-if="breadcrumbs.length">
                <ul>
                    <li v-for="(crumb, index) in breadcrumbs" :key="index">
                        <span v-if="index > 0" class="separator">></span>
                        <a
                            @click="crumb.name ? navigateTo(crumb.name) : null"
                            :class="{
                                clickable: crumb.name,
                                active: index === breadcrumbs.length - 1,
                            }"
                        >
                            <i v-if="crumb.icon" :class="crumb.icon"></i>
                            <span>{{ crumb.label }}</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>

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

                <div class="btn" @click="fullScreen" title="Pantalla completa">
                    <i class="fa-solid fa-expand"></i>
                </div>
            </div>

            <div class="tenant-logo" v-if="useAuth.usuario?.empresa">
                <img src="@/assets/img/logo-sunka-black.webp" v-if="!useAuth.isDarkMode" />
                <img src="@/assets/img/logo-sunka-white.webp" v-else />
            </div>
        </div>
    </header>
</template>

<script>
import { useAuth } from '@/pinia/auth.js'
import { useModals } from '@/pinia/modals'

import { urls, patch } from '@/utils/crud'

export default {
    components: {},
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
    }),
    computed: {
        breadcrumbs() {
            const crumbs = []
            const routeName = this.$route.name

            if (!routeName) return crumbs

            // Buscar en el menú
            for (const section of this.useAuth.menu) {
                const activeChild = section.children.find((child) => child.goto === routeName)
                if (activeChild) {
                    crumbs.push({ label: section.label, icon: section.icon })
                    crumbs.push({ label: activeChild.label, name: activeChild.goto })
                    break
                }
            }

            return crumbs
        },
    },
    methods: {
        reloadWindow() {
            window.location.reload()
        },
        async darkLigthMode() {
            const send = {
                id: this.useAuth.usuario.id,
                theme: this.useAuth.isDarkMode == true ? '1' : '2',
            }

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(`${urls.colaboradores}/preferencias`, send, false)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useAuth.setTheme(send.theme)
        },
        fullScreen() {
            // Alterna el modo pantalla completa
            const doc = window.document
            const docEl = doc.documentElement

            const requestFullScreen =
                docEl.requestFullscreen ||
                docEl.mozRequestFullScreen ||
                docEl.webkitRequestFullscreen ||
                docEl.msRequestFullscreen
            const cancelFullScreen =
                doc.exitFullscreen ||
                doc.mozCancelFullScreen ||
                doc.webkitExitFullscreen ||
                doc.msExitFullscreen

            if (
                !doc.fullscreenElement &&
                !doc.mozFullScreenElement &&
                !doc.webkitFullscreenElement &&
                !doc.msFullscreenElement
            ) {
                requestFullScreen.call(docEl)
            } else {
                cancelFullScreen.call(doc)
            }
        },

        navigateTo(name) {
            if (this.$route.name !== name) {
                this.$router.push({ name })
            }
        },
    },
}
</script>

<style lang="scss" scoped>
header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0 1.5rem;
    height: 3rem;
    background-color: var(--bg-color);

    .left {
        display: flex;
        align-items: center;
        gap: 1rem;

        .breadcrumbs {
            ul {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                list-style: none;
                padding: 0;
                margin: 0;

                li {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    // font-size: 0.95rem;

                    .separator {
                        color: var(--text-color2);
                        opacity: 0.5;
                        font-family: inherit;
                    }

                    a {
                        color: var(--text-color2);
                        text-decoration: none;
                        display: flex;
                        align-items: center;
                        gap: 0.4rem;
                        transition: all 0.2s;

                        * {
                            font-size: 0.9rem;
                            color: var(--text-color2);
                        }

                        &.clickable:hover {
                            color: var(--primary-color);
                            cursor: pointer;
                        }

                        &.active {
                            * {
                                color: var(--text-color) !important;
                            }
                        }
                    }
                }
            }
        }
    }

    .right {
        display: flex;
        align-items: center;
        gap: 1rem;

        .actions {
            display: flex;
            gap: 0.2rem;
        }

        .tenant-logo {
            height: 1.5rem;
            display: flex;
            align-items: center;

            img {
                height: 100%;
                width: auto;
                object-fit: contain;
                border-radius: 4px;
            }
        }
    }

    .btn {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: background-color 0.2s;

        i {
            font-size: 1.1rem;
            color: var(--text-color2);
        }

        &:hover {
            background-color: var(--bg-color);

            i {
                color: var(--primary-color);
            }
        }
    }
}
</style>
