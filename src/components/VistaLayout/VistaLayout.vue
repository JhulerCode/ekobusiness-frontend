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
                    :tableName="viewName"
                    :columns="vista?.tableColumns || []"
                    @reload="loadTableData"
                    @open-filters="openConfigFiltros"
                />

                <slot name="header-center"></slot>
            </div>

            <!-- Paginación y Configuración -->
            <div class="header-right">
                <slot name="header-right"></slot>

                <JdPaginacion :view="vista" @reload="loadTableData" />

                <JdButton
                    v-if="showConfigCols"
                    icon="fa-solid fa-sliders"
                    tipo="2"
                    title="Columnas"
                    @click="openConfigCols"
                />
            </div>
        </header>

        <main class="content">
            <slot name="content-top"></slot>

            <JdTable
                :name="viewName"
                :columns="vista?.tableColumns || []"
                :datos="vista?.tableData || []"
                :rowSelectable="props.rowSelectable"
                :rowOptions="rowActions"
                @rowOptionSelected="handleRowAction"
                @rowDblclick="verRow"
            />
        </main>
    </div>

    <!-- Modales vista -->
    <mConfigCols v-if="modals?.show?.mConfigCols" />
    <mConfigFiltros v-if="modals?.show?.mConfigFiltros" />
    <mEditar v-if="modals?.show?.mEditar" @updated="updatedBulk" />
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
    // askToInicialLoad: { type: Boolean, default: true },
    showConfigCols: { type: Boolean, default: true },
    rowSelectable: { type: Boolean, default: false },
    detailViewName: { type: String },
})

const emit = defineEmits(['runMethod'])

//--- Inicialización de la vista ---//
const viewName = route.name

vistas.updateVista(viewName, {
    ...JSON.parse(JSON.stringify(props.config)),
    apiUrl: urls[props.config.apiPath],
})

const vista = vistas[viewName]

auth.setColumns(viewName, vista.tableColumns)

if (props.initFiltros) {
    props.initFiltros()
}

// if (props.askToInicialLoad) {
// if ( auth.verifyPermiso(`${viewName}:listar`)) {
if (vista.last_path != route.fullPath) {
    loadTableData()
}
// } else {
//     loadTableData()
// }

//--- Principal data ---//
async function loadTableData(init_page) {
    if (props.loadDataPers) {
        props.loadDataPers()
        return
    }

    if (props.checkFiltros && props.checkFiltros()) return
    if (init_page) vista.table_page = 1
    props.setQuery()

    vista.tableData = []
    auth.setLoading(true, 'Cargando...')
    const res = await get(`${urls[vista.apiPath]}?qry=${JSON.stringify(vista.qry)}`)
    auth.setLoading(false)

    vista.last_path = route.fullPath
    if (res.code === 0) {
        vista.tableData = res.data
        vista.table_meta = res.meta
    }
    return res
}

function openConfigCols() {
    const modals = useModals()
    const send = {
        table: viewName,
        cols: vista?.tableColumns,
        reload: loadTableData,
    }
    modals.setModal('mConfigCols', 'Configurar columnas', null, send, true)
}

function openConfigFiltros() {
    const modals = useModals()
    const send = {
        table: viewName,
        cols: vista?.tableColumns,
        reload: loadTableData,
    }
    modals.setModal('mConfigFiltros', 'Filtros', null, send, true)
}

//--- Header actions ---//
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
        vista.tableColumns.filter((a) => a.show),
        vista.tableData || [],
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
            permiso: `${viewName}:editarBulk`,
        },
        {
            icon: 'fa-solid fa-trash-can',
            text: 'Eliminar',
            action: 'eliminarBulk',
            permiso: `${viewName}:eliminarBulk`,
        },
        ...(vista?.tableBulkActions || []),
    ]
})

async function editarBulk() {
    const selected = vista.tableData.filter((a) => a.selected)
    if (selected.length == 0) return jmsg('warning', 'Seleccione al menos un artículo')

    const ids = selected.map((b) => b.id)
    const send = {
        uri: vista.apiPath,
        nuevo: { prop: null, val: null },
        cols: vista.tableColumns,
        ids: ids,
    }
    modals.setModal('mEditar', `Editar ${ids.length} registros`, null, send, true)
}

async function eliminarBulk() {
    const selected = vista.tableData.filter((a) => a.selected)
    const ids = selected.map((b) => b.id)

    const resQst = await jqst(`¿Está seguro de eliminar ${ids.length} registros?`)
    if (resQst.isConfirmed == false) return

    auth.setLoading(true, 'Eliminando...')
    const res = await delet(`${urls[vista.apiPath]}/bulk`, { id: 'bulk', ids })
    auth.setLoading(false)

    if (res.code == 0) {
        vista.tableData = vista.tableData.filter((a) => !a.selected)
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
            permiso: `${viewName}:eliminar`,
        },
        ...(vista?.tableRowActions || []),
    ]
})

async function eliminarRow(item) {
    const resQst = await jqst('¿Está seguro de eliminar?')
    if (resQst.isConfirmed == false) return

    auth.setLoading(true, 'Eliminando...')
    const res = await delet(vista?.apiUrl, item)
    auth.setLoading(false)

    if (res.code == 0) vistas.removeItem(viewName, 'tableData', item)
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
    return (vista?.tableData || []).filter((a) => a.selected).length
})

function updatedBulk(item) {
    for (const a of vista.tableData) {
        if (!item.ids.includes(a.id)) continue
        a.selected = false
        a[item.prop] = item.val
        if (item.val1) a[`${item.prop}1`] = item.val1
    }
}

function verRow(item) {
    const detailViewName = props.detailViewName || vista.detailViewName
    if (!detailViewName) return
    // if (!auth.verifyPermiso(`${viewName}:ver`)) return
    router.push({ name: detailViewName, params: { [vista.detailPath]: item.id } })
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
