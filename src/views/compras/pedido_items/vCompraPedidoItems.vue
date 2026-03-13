<template>
    <VistaLayout :vista="vista">
        <JdTable :name="vista.name" :columns="vista.tableColumns" :datos="vista.tableData || []" />
    </VistaLayout>
</template>

<script>
// Configuración de la vista
import VIEW_CONFIG from './compra_pedido_items.config.js'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { urls } from '@/utils/crud'
import dayjs from 'dayjs'

export default {
    name: 'vCompraPedidoItems',
    components: {},
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
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
        this.auth.setColumns(this.vista.name, this.vista.tableColumns)

        // 2. Carga inicial
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
            const i = this.vista.tableColumns.findIndex((a) => a.id == 'socio_pedido1.fecha')

            if (!this.vista.tableColumns[i].val) {
                this.vista.tableColumns[i].op = 'Está dentro de'
                this.vista.tableColumns[i].val = dayjs().startOf('month').format('YYYY-MM-DD')
                this.vista.tableColumns[i].val1 = dayjs().format('YYYY-MM-DD')
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
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },
    },
}
</script>
