<template>
    <div class="vista">
        <header class="header">
            <div class="header-left" style="flex-wrap: nowrap">
                <strong style="white-space: nowrap">{{ title }}</strong>

                <JdButtonsOverflow
                    v-if="headerActions"
                    :actions="headerActions"
                    @actionSelected="handleHeaderAction"
                />

                <slot name="header-left"></slot>
            </div>

            <!-- Acciones Masivas o Buscador -->
            <div class="header-center">
                <JdBulkActions
                    v-if="selectedCount > 0"
                    :view="vista"
                    dataKey="tableData"
                    :bulkActions="bulkActions"
                    @bulkActionSelected="handleBulkAction"
                />

                <JdBuscador
                    v-else
                    :tableName="route.name"
                    :columns="vista.tableColumns"
                    @reload="loadTableData"
                    @open-filters="openConfigFiltros"
                />

                <slot name="header-center"></slot>
            </div>

            <!-- Paginación y Configuración -->
            <div class="header-right">
                <JdPaginacion :view="vista" @reload="loadTableData" />

                <JdButton
                    v-if="showConfigCols"
                    icon="fa-solid fa-sliders"
                    tipo="2"
                    title="Columnas"
                    @click="openConfigCols"
                />

                <slot name="header-right"></slot>
            </div>
        </header>

        <main class="content">
            <slot name="content-top"></slot>

            <JdTable
                :name="route.name"
                :columns="vista.tableColumns"
                :datos="vista.tableData || []"
                :rowSelectable="props.rowSelectable"
                :rowOptions="rowActions"
                @rowOptionSelected="handleRowAction"
                @rowDblclick="verRow"
            />
        </main>
    </div>

    <!-- Modales vista -->
    <mConfigCols v-if="modals.show?.mConfigCols" />
    <mConfigFiltros v-if="modals.show?.mConfigFiltros" />
    <mEditar v-if="modals.show?.mEditar" @updated="updatedBulk" />
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get, delet } from '@/utils/crud'
import { jmsg, jqst } from '@/utils/swal'
import { downloadExcel } from '@/utils/mine'

import JdButtonsOverflow from './JdButtonsOverflow.vue'
import JdBuscador from './JdBuscador.vue'
import JdBulkActions from './JdBulkActions.vue'
import JdPaginacion from './JdPaginacion.vue'
import mConfigCols from '@/components/VistaLayout/mConfigCols.vue'
import mConfigFiltros from '@/components/VistaLayout/mConfigFiltros.vue'
import mEditar from '@/components/VistaLayout/mEditar.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuth()
const modals = useModals()
const vistas = useVistas()

const props = defineProps({
    config: { type: Object, required: true },
    initFiltros: { type: Function },
    checkFiltros: { type: Function },
    setQuery: { type: Function, required: true },
    loadDataPers: { type: Function },
    askToInicialLoad: { type: Boolean, default: true },
    showConfigCols: { type: Boolean, default: true },
    rowSelectable: { type: Boolean, default: false },
})

const emit = defineEmits(['runMethod'])

// --- Inicialización de la vista ---
const vista = computed(() => vistas[route.name])
vistas.initVista(route.name, {
    ...JSON.parse(JSON.stringify(props.config)),
    apiUrl: urls[props.config.apiPath],
})

auth.setColumns(route.name, vista.value.tableColumns)

if (props.initFiltros) {
    props.initFiltros()
}

if (props.askToInicialLoad) {
    if (!vista.value.loaded && auth.verifyPermiso(`${route.name}:listar`)) {
        loadTableData()
    }
} else {
    loadTableData()
}

// --- Principal data ---
async function loadTableData(init_page) {
    if (props.loadDataPers) {
        props.loadDataPers()
        return
    }

    if (props.checkFiltros && props.checkFiltros()) return
    if (init_page) vista.value.table_page = 1
    props.setQuery()

    vista.value.tableData = []
    auth.setLoading(true, 'Cargando...')
    const res = await get(`${urls[vista.value.apiPath]}?qry=${JSON.stringify(vista.value.qry)}`)
    auth.setLoading(false)

    vista.value.loaded = true
    if (res.code === 0) {
        vista.value.tableData = res.data
        vista.value.table_meta = res.meta
    }
    return res
}

function openConfigCols() {
    const modals = useModals()
    const send = {
        table: route.name,
        cols: vista.value.tableColumns,
        reload: loadTableData,
    }
    modals.setModal('mConfigCols', 'Configurar columnas', null, send, true)
}

function openConfigFiltros() {
    const modals = useModals()
    const send = {
        table: route.name,
        cols: vista.value.tableColumns,
        reload: loadTableData,
    }
    modals.setModal('mConfigFiltros', 'Filtros', null, send, true)
}

// --- Header actions ---
const headerActions = computed(() => {
    let configHeaderActions = []
    if (props.config.headerActions) {
        configHeaderActions = props.config.headerActions.map((a) => ({
            ...a,
            show: a.permiso ? auth.verifyPermiso(a.permiso) : true,
        }))
    }

    return [
        ...configHeaderActions,
        {
            icon: 'fa-solid fa-download',
            text: 'Exportar página actual',
            action: 'downloadActualTablePage',
            tipo: '2',
        },
    ]
})

function downloadActualTablePage() {
    downloadExcel(
        vista.value.tableColumns.filter((a) => a.show),
        vista.value.tableData || [],
    )
}

const handleHeaderAction = (action, item) => {
    const localActions = {
        downloadActualTablePage,
    }

    if (localActions[action]) {
        localActions[action]()
        return
    }

    emit('runMethod', action, item)
}

//--- Bulk actions ---//
const bulkActions = computed(() => {
    return [
        {
            icon: 'fa-solid fa-pen-to-square',
            text: 'Editar',
            action: 'editarBulk',
            permiso: `${route.name}:editarBulk`,
        },
        {
            icon: 'fa-solid fa-trash-can',
            text: 'Eliminar',
            action: 'eliminarBulk',
            permiso: `${route.name}:eliminarBulk`,
        },
        ...(vista.value.tableBulkActions || []),
    ]
})

async function editarBulk() {
    const selected = vista.value.tableData.filter((a) => a.selected)
    if (selected.length == 0) return jmsg('warning', 'Seleccione al menos un artículo')

    const ids = selected.map((b) => b.id)
    const send = {
        uri: vista.value.apiPath,
        nuevo: { prop: null, val: null },
        cols: vista.value.tableColumns,
        ids: ids,
    }
    modals.setModal('mEditar', `Editar ${ids.length} registros`, null, send, true)
}

async function eliminarBulk() {
    const selected = vista.value.tableData.filter((a) => a.selected)
    const ids = selected.map((b) => b.id)

    const resQst = await jqst(`¿Está seguro de eliminar ${ids.length} registros?`)
    if (resQst.isConfirmed == false) return

    auth.setLoading(true, 'Eliminando...')
    const res = await delet(`${urls[vista.value.apiPath]}/bulk`, { id: 'bulk', ids })
    auth.setLoading(false)

    if (res.code == 0) {
        vista.value.tableData = vista.value.tableData.filter((a) => !a.selected)
    }
}

function handleBulkAction(action, item) {
    const localActions = {
        editarBulk,
        eliminarBulk,
    }

    if (localActions[action]) {
        localActions[action]()
        return
    }

    emit('runMethod', action, item)
}

//--- Row actions ---//
const rowActions = computed(() => {
    return [
        {
            label: 'Eliminar',
            icon: 'fa-solid fa-trash-can',
            action: 'eliminarRow',
            permiso: `${route.name}:eliminar`,
        },
        ...(vista.value.tableRowActions || []),
    ]
})

async function eliminarRow(item) {
    const resQst = await jqst('¿Está seguro de eliminar?')
    if (resQst.isConfirmed == false) return

    auth.setLoading(true, 'Eliminando...')
    const res = await delet(vista.value.apiUrl, item)
    auth.setLoading(false)

    if (res.code == 0) vista.value.removeItem(item)
}

function handleRowAction(action, item) {
    const localActions = {
        eliminarRow,
    }

    if (localActions[action]) {
        localActions[action](item)
        return
    }

    emit('runMethod', action, item)
}

// --- Methods de apoyo ---
const title = computed(() => {
    return route.meta.title
})

const selectedCount = computed(() => {
    return (vista.value.tableData || []).filter((a) => a.selected).length
})

function updatedBulk(item) {
    for (const a of vista.value.tableData) {
        if (!item.ids.includes(a.id)) continue
        a.selected = false
        a[item.prop] = item.val
        if (item.val1) a[`${item.prop}1`] = item.val1
    }
}

function verRow(item) {
    if (!vista.value.detailViewName) return
    if (!auth.verifyPermiso(`${route.name}:ver`)) return
    router.push({ name: vista.value.detailViewName, params: { id: item.id } })
}
</script>

<style lang="scss" scoped>
.vista {
    background-color: var(--bg-color);
    padding: 1.5rem 2rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    > .header {
        display: grid;
        grid-template-columns: 1fr 1.25fr 1fr;
        gap: 1rem 2rem;
        margin-bottom: 1rem;

        .header-left {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
            min-width: 0;

            strong {
                font-size: 1.4rem;
            }
        }

        .header-center {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            flex-wrap: wrap;
            min-width: 0;
        }

        .header-right {
            display: flex;
            align-items: center;
            justify-content: end;
            gap: 0.25rem;
            flex-wrap: wrap;
            min-width: 0;
        }

        @media (max-width: 1024px) {
            grid-template-columns: 1fr 1fr;

            .header-center {
                grid-column: 1 / -1;
                grid-row: 2;
            }
        }

        @media (max-width: 768px) {
            grid-template-columns: 1fr;

            .header-center {
                grid-column: 1 / -1;
                grid-row: 3;
                justify-content: flex-start;
            }

            .header-right {
                grid-row: 2;
                justify-content: start;
            }
        }
    }
}

.content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
</style>
