<template>
    <VistaLayout :vista="vista">
        <JdTable :name="vista.name" :columns="vista.tableColumns" :datos="vista.tableData || []" />
    </VistaLayout>
</template>

<script>
// Configuración de la vista
import VIEW_CONFIG from './venta_pedido_items.config.js'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { urls } from '@/utils/crud'
import dayjs from 'dayjs'

export default {
    name: 'vVentaPedidoItems',
    components: {
    },
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
                fltr: { 'socio_pedido1.tipo': { op: 'Es', val: 2 } },
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
