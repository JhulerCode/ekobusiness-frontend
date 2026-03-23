<template>
    <div class="vista-detalle" v-if="vista">
        <header class="header">
            <div class="header-left" style="flex-wrap: nowrap">
                <strong style="white-space: nowrap">{{ resolvedTitle }}</strong>

                <slot name="header-left"></slot>
            </div>
            {{ permisoEditar }}

            <div class="header-right">
                <JdButtonsOverflow
                    v-if="vista.headerActions"
                    :actions="basicActions"
                    @actionSelected="handleHeaderAction"
                    align="right"
                />

                <slot name="header-right"></slot>
            </div>
        </header>

        <main class="content">
            <div class="content-central">
                <div class="principal-datos">
                    <slot name="principal-datos"></slot>
                </div>

                <ul class="pestanas">
                    <template v-for="tab in pestanas" :key="tab.id">
                        <li
                            v-if="tab.show"
                            @click="handleTabClick(tab.id)"
                            :class="{ 'pestana-activo': vista.pestana == tab.id }"
                        >
                            {{ tab.label }}
                        </li>
                    </template>
                </ul>

                <div class="pestanas-body">
                    <slot name="pestanas-body"></slot>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVistas } from '@/pinia/vistas'
import { urls } from '@/utils/crud'

import JdButtonsOverflow from './VistaLayout/JdButtonsOverflow.vue'

const route = useRoute()
const router = useRouter()
const vistas = useVistas()

const props = defineProps({
    config: { type: Object, required: true },
    pestanas: { type: Array, default: () => [] },
})

const emit = defineEmits(['runMethod'])

// --- Inicialización de la vista ---
const vista = computed(() => vistas[props.config.name])
vistas.initVista(props.config.name, {
    ...JSON.parse(JSON.stringify(props.config)),
    apiUrl: urls[props.config.apiPath],
    pestana: 1,
    mode: 'view',
    data: {},
})

// --- Header actions ---
const basicActions = computed(() => {
    const isEdit = vista.value?.mode === 'edit'
    return [
        {
            text: 'Editar',
            action: 'editar',
            icon: 'fa-solid fa-pen-to-square',
            permiso: props.config.permisoEditar,
            show: !isEdit,
        },
        {
            text: 'Cancelar',
            action: 'cancelar',
            icon: 'fa-solid fa-xmark',
            tipo: '2',
            show: isEdit,
        },
        {
            text: 'Guardar',
            action: 'guardar',
            icon: 'fa-solid fa-floppy-disk',
            show: isEdit,
        },
        ...(vista.value.headerActions || []),
    ]
})

function editar() {
    const v = vista.value
    v.original_data = JSON.parse(JSON.stringify(v.data))
    v.mode = 'edit'
}

function cancelar() {
    if (route?.params?.id === 'nuevo') {
        router.back()
        return
    }
    const v = vista.value
    v.data = JSON.parse(JSON.stringify(v.original_data))
    v.mode = 'view'
}

const handleHeaderAction = (action, item) => {
    const localActions = {
        editar,
        cancelar,
    }

    if (localActions[action]) {
        localActions[action]()
        return
    }

    emit('runMethod', action, item)
}

// --- Methods de apoyo ---
const resolvedTitle = computed(() => {
    const id = route?.params?.id
    if (id === 'nuevo') return 'Nuevo'
    if (id) return vista.value?.data?.[vista.value?.titleKey ?? 'nombre']
    return vista.value?.title
})

const handleTabClick = (tabId) => {
    vista.value.pestana = tabId
}
</script>

<style lang="scss" scoped>
.vista-detalle {
    background-color: var(--bg-color2);
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.header {
    display: flex;
    justify-content: space-between;
    padding: 1rem 2rem;
    background-color: var(--bg-color);
    border-bottom: var(--border);

    .header-left {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        strong {
            font-size: 1.4rem;
        }
    }

    .header-right {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: end;
        gap: 1rem;
    }
}

.content {
    flex: 1;
    overflow-y: auto;
    width: 100%;
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: center;
    align-items: flex-start;

    .content-central {
        width: 100%;
        max-width: 1400px;
        background-color: var(--bg-color);
        border-radius: 0.25rem;
        // box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* Ligero popup */
        border: var(--border);
        padding: 2rem;

        .principal-datos {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.75rem 2rem;
            margin-bottom: 2rem;
        }

        .pestanas {
            display: flex;
            border-bottom: var(--border);
            padding: 0 1rem;
            gap: 0.2rem;

            li {
                padding: 0.5rem 1rem;
                border: solid 1px transparent;
                border-bottom: none;
                cursor: pointer;
                color: var(--text-color2);
                margin-bottom: -1px;
                border-radius: 0.3rem 0.3rem 0 0;
            }

            .pestana-activo {
                color: var(--text-color);
                background-color: var(--bg-color);
                border: var(--border);
                border-bottom: 1px solid var(--bg-color);
            }
        }

        .pestanas-body {
            padding: 1rem 0 0;

            :deep(.container-datos) {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 0.75rem 2rem;
            }
        }
    }
}
</style>
