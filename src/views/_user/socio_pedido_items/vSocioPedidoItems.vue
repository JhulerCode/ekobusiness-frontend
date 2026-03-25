<template>
    <VistaLayout
        :key="$route.fullPath"
        :config="VIEW_CONFIG"
        :initFiltros="initFiltros"
        :setQuery="setQuery"
        @runMethod="runMethod"
    >
    </VistaLayout>
</template>

<script>
import VIEW_CONFIG from './socio_pedido_items.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import dayjs from 'dayjs'

export default {
    components: {},
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        vista() {
            return this.vistas[this.$route.name]
        },
    },
    data: () => ({
        VIEW_CONFIG,
    }),
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        initFiltros() {
            const i = this.vista.tableColumns.findIndex((a) => a.id == 'socio_pedido1.fecha')
            const existeUnFiltro = this.vista.tableColumns.some((a) => a.val)

            if (!existeUnFiltro) {
                this.vista.tableColumns[i].op = 'Está dentro de'
                this.vista.tableColumns[i].val = dayjs().startOf('month').format('YYYY-MM-DD')
                this.vista.tableColumns[i].val1 = dayjs().format('YYYY-MM-DD')
            }
        },
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['socio_pedido1', 'articulo1'],
                iccl: {
                    socio_pedido1: { incl: ['socio1'] },
                },
                page: this.vista.table_page,
            }

            if (this.$route.path.includes('compras')) {
                this.vista.qry.fltr['socio_pedido1.tipo'] = { op: 'Es', val: 1 }
            }
            if (this.$route.path.includes('ventas')) {
                this.vista.qry.fltr['socio_pedido1.tipo'] = { op: 'Es', val: 2 }
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },
    },
}
</script>
