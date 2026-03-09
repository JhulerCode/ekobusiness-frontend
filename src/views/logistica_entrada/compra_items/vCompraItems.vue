<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left">
                <strong>Artículos comprados</strong>
            </div>

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="tableColumns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadTransaccionItems"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadTransaccionItems" />

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
            :reload="loadTransaccionItems"
        />
    </div>

    <!-- Modales -->
    <mFormato v-if="useModals.show.mFormato" @created="setTransaccionItemCalidadRevisado" />
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
import { TABLE_COLUMNS } from './compra_items.config'

// Modales específicos
import mFormato from '@/views/calidad/formatos/mFormato.vue'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'
import dayjs from 'dayjs'

export default {
    name: 'vCompraItems',
    components: {
        JdButton,
        JdBuscador,
        JdTable,
        JdPaginacion,
        mConfigCols,
        mConfigFiltros,
        mFormato,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},
        tableName: 'vCompraItems',

        tableColumns: JSON.parse(JSON.stringify(TABLE_COLUMNS)),
    }),
    async created() {
        this.vista = this.useVistas.vCompraItems
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.tableColumns)

        if (this.vista.loaded) return
        this.vista.table_page = 1
        if (this.useAuth.verifyPermiso('vCompraItems:listar')) this.loadTransaccionItems()
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
                fltr: { 'transaccion1.tipo': { op: 'Es', val: 1 } },
                incl: ['transaccion1', 'articulo1'],
                iccl: {
                    transaccion1: { incl: ['socio1', 'socio_pedido1'] },
                },
                page: this.vista.table_page,
            }
            this.useAuth.updateQuery(this.tableColumns, this.vista.qry)
        },
        async loadTransaccionItems() {
            this.setQuery()
            this.vista.transaccion_items = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transaccion_items}?qry=${JSON.stringify(this.vista.qry)}`)
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

        // --- Registro ---
        async crearFormatoValue(item) {
            const formato_id = 'RE-BPM-05.01'
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.formatos}/uno/${formato_id}`)
            this.useAuth.setLoading(false)
            if (res.code != 0) return

            this.useAuth.setLoading(true, 'Cargando...')
            const res1 = await get(`${urls.formato_values}/uno/${item.calidad_revisado}`)
            this.useAuth.setLoading(false)
            if (res1.code != 0) return

            if (res1.data == null) {
                const send = {
                    transaccion_item: item.id,
                    transaccion_item1: { ...item },
                    formato: {
                        codigo: res.data.id,
                        columns: res.data.columns,
                        instructivo: res.data.instructivo,
                    },
                }
                this.useModals.setModal('mFormato', formato_id, 1, send, true)
            } else {
                for (const a of res.data.columns) a.value = res1.data[a.id]
                const send = {
                    transaccion_item: item.id,
                    transaccion_item1: res1.data.transaccion_item1,
                    formato: {
                        id: res1.data.id,
                        codigo: res.data.id,
                        columns: res.data.columns,
                        instructivo: res.data.instructivo,
                    },
                }
                this.useModals.setModal('mFormato', formato_id, 2, send, true)
            }
        },
        setTransaccionItemCalidadRevisado(item) {
            const t_item = this.vista.transaccion_items.find((a) => a.id == item.transaccion_item)
            if (t_item) t_item.calidad_revisado = item.id
        },

        // --- Otros ---
        async openConfigFiltros() {
            const cols = this.tableColumns
            for (const a of cols) {
                if (a.id == 'transaccion1.socio') a.reload = this.loadSocios
            }
            const send = { table: this.tableName, cols, reload: this.loadTransaccionItems }
            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },
    },
}
</script>
