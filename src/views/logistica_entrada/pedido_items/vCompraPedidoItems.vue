<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left">
                <strong>Artículos pedidos</strong>
            </div>

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="tableColumns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadPedidoItems"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadPedidoItems" />

                <JdButton
                    icon="fa-solid fa-file-excel"
                    tipo="2"
                    title="Exportar"
                    @click="$refs['jdtable'].downloadData()"
                />

                <JdButton
                    icon="fa-solid fa-gear"
                    tipo="2"
                    title="Columnas"
                    @click="$refs['jdtable'].openConfigCols()"
                />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="tableColumns"
            :datos="vista.transaccion_items || []"
            ref="jdtable"
            :reload="loadPedidoItems"
        />
    </div>

    <!-- Modales -->
    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
// Componentes base y utilidades
import { JdButton, mConfigFiltros, mConfigCols } from '@jhuler/components'
import JdBuscador from '@/components/JdBuscador.vue'
import JdTable from '@/components/JdTable/JdTable.vue'
import JdPaginacion from '@/components/JdPaginacion.vue'

// Configuración de la vista
import { TABLE_COLUMNS } from './compra_pedido_items.config'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'
import dayjs from 'dayjs'

export default {
    name: 'vCompraPedidoItems',
    components: {
        JdButton,
        JdBuscador,
        JdTable,
        JdPaginacion,
        mConfigCols,
        mConfigFiltros,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},
        tableName: 'vCompraPedidoItems',

        // Configuraciones traídas de compra_pedido_items.config.js
        tableColumns: JSON.parse(JSON.stringify(TABLE_COLUMNS)),
    }),
    async created() {
        this.vista = this.useVistas.vCompraPedidoItems
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.tableColumns)

        if (this.vista.loaded) return
        this.vista.table_page = 1
        if (this.useAuth.verifyPermiso('vCompraPedidoItems:listar')) this.loadPedidoItems()
    },
    methods: {
        // --- Carga de Datos ---
        initFiltros() {
            if (!this.tableColumns[0].val) {
                this.tableColumns[0].op = 'Está dentro de'
                this.tableColumns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
                this.tableColumns[0].val1 = dayjs().format('YYYY-MM-DD')
            }
        },
        setQuery() {
            this.vista.qry = {
                fltr: { 'socio_pedido1.tipo': { op: 'Es', val: 1 } },
                incl: ['socio_pedido1', 'articulo1'],
                iccl: {
                    socio_pedido1: { incl: ['socio1'] },
                },
                page: this.vista.table_page,
            }
            this.useAuth.updateQuery(this.tableColumns, this.vista.qry)
        },
        async loadPedidoItems() {
            this.setQuery()
            this.vista.transaccion_items = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(
                `${urls.socio_pedido_items}?qry=${JSON.stringify(this.vista.qry)}`,
            )
            this.useAuth.setLoading(false)
            this.vista.loaded = true
            if (res.code != 0) return
            this.vista.transaccion_items = res.data
            this.vista.table_meta = res.meta
        },

        // --- Datos de Apoyo ---
        async loadSocios() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: 1 }, activo: { op: 'Es', val: true } },
                cols: ['nombres'],
                ordr: [['nombres', 'ASC']],
            }
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            if (res.code !== 0) return
            return (this.vista.socios = res.data)
        },

        // --- Otros ---
        async openConfigFiltros() {
            const cols = this.tableColumns
            for (const a of cols) {
                if (a.id == 'socio_pedido1.socio') a.reload = this.loadSocios
            }
            const send = { table: this.tableName, cols, reload: this.loadPedidoItems }
            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },
    },
}
</script>
