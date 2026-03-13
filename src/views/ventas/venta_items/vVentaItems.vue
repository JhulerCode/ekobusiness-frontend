<template>
    <VistaLayout :vista="vista">
        <JdTable :name="vista.name" :columns="vista.tableColumns" :datos="vista.tableData || []" />
    </VistaLayout>

    <!-- Modales -->
    <mFormato v-if="modals.show.mFormato" @created="setTransaccionItemCalidadRevisado" />
</template>

<script>
// Configuración de la vista
import VIEW_CONFIG from './venta_items.config.js'

// Modales específicos
import mFormato from '@/views/calidad/formatos/mFormato.vue'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls } from '@/utils/crud'
import dayjs from 'dayjs'

export default {
    name: 'vVentaItems',
    components: {
        mFormato,
    },
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        modals: () => useModals(),
        vista() {
            return this.vistas[VIEW_CONFIG.name]
        },
    },
    async created() {
        // 1. Inicialización de la vista
        this.vistas.initVista(VIEW_CONFIG.name, {
            ...JSON.parse(JSON.stringify(VIEW_CONFIG)),
            apiUrl: urls[VIEW_CONFIG.apiPath],
            runMethod: this.runMethod,
        })
        this.initFiltros()

        // 2. Carga inicial
        this.auth.setColumns(this.vista.name, this.vista.tableColumns)
        if (!this.vista.loaded && this.auth.verifyPermiso(`${VIEW_CONFIG.name}:listar`)) {
            this.vista.loadTableData()
        }
    },
    unmounted() {
        if (this.vista) this.vista.runMethod = null
    },
    methods: {
        runMethod(method, item) {
            this.vistas.runMethod(this, method, item)
        },
        initFiltros() {
            if (!this.vista.tableColumns[0].val) {
                this.vista.tableColumns[0].op = 'Está dentro de'
                this.vista.tableColumns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
                this.vista.tableColumns[0].val1 = dayjs().format('YYYY-MM-DD')
            }
        },
        setQuery() {
            this.vista.qry = {
                fltr: { 'transaccion1.tipo': { op: 'Es', val: 5 } },
                incl: ['transaccion1', 'articulo1'],
                iccl: {
                    transaccion1: { incl: ['socio1', 'socio_pedido1'] },
                },
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        // @actions
        setTransaccionItemCalidadRevisado(item) {
            const t_item = this.vista.tableData.find((a) => a.id == item.transaccion_item)
            if (t_item) t_item.calidad_revisado = item.id
        },
    },
}
</script>
