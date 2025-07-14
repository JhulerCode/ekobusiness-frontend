<template>
    <div class="side-bar" :class="`${useAuth.showNavbar ? 'visible' : 'no-visible'}`">
        <aside>
            <div v-for="(a, i) in menu" :key="i">

                <div class="option" @click="this.toggleList(a.label)"
                    :class="{ 'active': a.children.some(b => useVistas.show?.[b.goto]) }">

                    <div class="left" :class="{ 'has-icon': a.icon }">
                        <i v-if="a.icon" :class=a.icon></i>
                        <span>{{ a.label }}</span>
                    </div>

                    <span class="icono-expand" v-if="!a.goto">
                        <i class="fa-solid fa-caret-down" v-if="grupoExpandido === a.label"></i>
                        <i class="fa-solid fa-caret-right" v-else></i>
                    </span>
                </div>

                <div v-if="a.children && grupoExpandido === a.label" class="items-container">
                    <div v-for="(b, j) in a.children" :key="j" class="option2"
                        :class="{ 'active2': useVistas.show?.[b.goto] }" @click="useVistas.showVista(b.goto, b.label)">
                        {{ b.label }}
                    </div>
                </div>
            </div>
        </aside>
    </div>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas.js'

export default {
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),

        grupoExpandido: null,
    }),
    computed: {
        menu() {
            return this.useAuth.menu
                .map(seccion => {
                    const hijosFiltrados = seccion.children.filter(a =>
                        (this.useAuth.usuario.permisos || []).some(p => p.startsWith(a.goto + ':'))
                    )

                    return hijosFiltrados.length > 0
                        ? { ...seccion, children: hijosFiltrados }
                        : null
                })
                .filter(seccion => seccion !== null)
        },
    },
    methods: {
        toggleList(label) {
            this.grupoExpandido = this.grupoExpandido === label ? null : label
        }
    },
    created() {
        // for (const a of this.menu) {
        //     const asd = a.children.some(b => useVistas.show?.[b.goto])
        //     if (asd) {
        //         this.grupoExpandido = a.label
        //     }
        // }
    }
}
</script>

<style lang="scss" scoped>
.side-bar {
    height: 100%;
    overflow-y: auto;
    transition: width 0.3s linear;
    margin-right: 1rem;

    // &::-webkit-scrollbar {
    //     display: none;
    // }
}

.visible {
    width: 15rem;
}

.no-visible {
    width: 0rem;
    margin-right: 0;
}

aside {
    overflow-x: hidden;

    * {
        color: var(--text-color2);
    }

    .option {
        padding: 0.8rem 1rem;
        border-radius: 0.5rem;
        display: grid;
        grid-template-columns: 1fr 0.5rem;
        gap: 0.5rem;
        align-items: center;
        overflow-x: hidden;
        margin-bottom: 0.2rem;

        &:hover {
            cursor: pointer;
            background-color: var(--bg-color);

            * {
                color: var(--primary-color);
            }
        }

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

        .has-icon {
            grid-template-columns: 1.2rem 1fr;
        }

        .icon-expanded {
            transform: rotate(90deg);
        }
    }

    .items-container {
        margin: 0 0 0 1rem;
        overflow: hidden;

        .option2 {
            padding: 0.8rem 1rem;
            border-radius: 0.5rem;
            margin-bottom: 0.2rem;
            display: flex;
            overflow-x: hidden;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            &:hover {
                cursor: pointer;
                background-color: var(--bg-color);
                color: var(--primary-color) !important;
            }
        }
    }

    .active {
        background-color: var(--bg-color);

        * {
            color: var(--primary-color) !important;
        }
    }

    .active2 {
        background-color: var(--bg-color);
        color: var(--primary-color) !important;
    }
}
</style>