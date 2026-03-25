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

            <div class="tenant-logo" v-if="useAuth.empresa">
                <img :src="useAuth.empresa.logo?.url" />
            </div>
        </div>
    </header>
</template>

<script>
import { useAuth } from '@/pinia/auth.js'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, patch } from '@/utils/crud'

export default {
    components: {},
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
    }),
    computed: {
        breadcrumbs() {
            const crumbs = []
            const currentRouteName = this.$route.name
            if (!currentRouteName) return crumbs

            const findCrumbs = (items) => {
                if (!items) return null
                for (const item of items) {
                    if (item.goto === currentRouteName) {
                        return [item]
                    }
                    if (item.children && item.children.length > 0) {
                        const childCrumbs = findCrumbs(item.children)
                        if (childCrumbs) {
                            return [item, ...childCrumbs]
                        }
                    }
                }
                return null
            }

            const pathItems = findCrumbs(this.useAuth.menu)
            if (!pathItems) return crumbs

            pathItems.forEach((item, index) => {
                let label = item.label
                const isLast = index === pathItems.length - 1

                if (item.path && item.path.includes(':')) {
                    const vista = this.useVistas[item.goto]

                    const dynamicName =
                        vista?.data?.nombre ||
                        vista?.data?.nombres ||
                        vista?.data?.label ||
                        vista?.data?.codigo

                    label = dynamicName || label
                }

                if (label && label.length > 30) {
                    label = label.substring(0, 27) + '...'
                }

                crumbs.push({
                    label,
                    icon: item.icon,
                    name: isLast ? null : item.goto,
                })
            })

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
                // Filtramos los params para que solo pasen los que la ruta destino necesita.
                // Esto evita el warning de "Discarded invalid param(s)" de Vue Router.
                const allRoutes = this.$router.getRoutes()
                const targetRoute = allRoutes.find((r) => r.name === name)
                const targetParams = {}

                if (targetRoute) {
                    // Buscamos los tokens :nombreParam en el path de la ruta.
                    const paramMatches = targetRoute.path.match(/:([a-zA-Z0-9_]+)/g)
                    if (paramMatches) {
                        paramMatches.forEach((m) => {
                            const paramKey = m.substring(1)
                            if (this.$route.params[paramKey] !== undefined) {
                                targetParams[paramKey] = this.$route.params[paramKey]
                            }
                        })
                    }
                }

                this.$router.push({ name, params: targetParams })
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
                            cursor: pointer;
                            color: var(--text-color);
                            * {
                                color: var(--text-color);
                            }
                        }

                        &.active {
                            color: var(--text-color);
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
