<template>
    <VistaLayout
        :key="$route.fullPath"
        :config="VIEW_CONFIG"
        :setQuery="setQuery"
        :detailViewName="detailViewName"
        @runMethod="runMethod"
    >
    </VistaLayout>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

export default {
    components: {},
    computed: {
        vista() {
            return this.vistas[this.$route.name]
        },
        VIEW_CONFIG() {
            return {
                apiPath: 'comprobantes',
                detailPath: 'comprobante_id',

                headerActions: [
                    {
                        text: 'Nuevo',
                        action: 'nuevo',
                        permiso: ['vCompraComprobantes:crear'],
                        ocultar: this.$route.name == 'vCompraComprobantes',
                    },
                ],

                tableColumns: [
                    {
                        id: 'fecha_emision',
                        title: 'Fecha Emisión',
                        prop: 'fecha_emision',
                        type: 'date',
                        width: '10rem',
                        show: true,
                        orden: 1,
                    },
                    {
                        id: 'serie',
                        title: 'Serie',
                        type: 'text',
                        width: '8rem',
                        show: true,
                        seek: true,
                        orden: 2,
                    },
                    {
                        id: 'correlativo',
                        title: 'Correlativo',
                        type: 'text',
                        width: '8rem',
                        show: true,
                        seek: true,
                        orden: 2,
                    },
                    {
                        id: 'socio',
                        title: 'Proveedor',
                        prop: 'socio1.nombres',
                        type: 'related',
                        relatedUrl: 'socios',
                        mostrar: 'nombres',
                        width: '20rem',
                        show: true,
                        seek: true,
                        orden: 3,
                    },
                    {
                        id: 'moneda',
                        title: 'Moneda',
                        prop: 'moneda1.nombre',
                        type: 'related',
                        relatedUrl: 'monedas',
                        width: '8rem',
                        show: true,
                        seek: true,
                        orden: 4,
                    },
                    {
                        id: 'monto',
                        title: 'Monto',
                        prop: 'monto',
                        type: 'number',
                        format: 'decimal',
                        toRight: true,
                        width: '10rem',
                        show: true,
                        orden: 5,
                    },
                    // {
                    //     id: 'estado',
                    //     title: 'Estado',
                    //     prop: 'estado',
                    //     type: 'text',
                    //     width: '10rem',
                    //     show: true,
                    //     orden: 5,
                    // },
                ],
            }
        },
        detailViewName() {
            if (this.$route.params.traslado_id) {
                if (this.$route.name == 'vCompraTrasladoComprobantes') {
                    return 'vCompraTrasladoComprobante'
                }
            }

            if (this.$route.params.pedido_id) {
                if (this.$route.name == 'vCompraPedidoComprobantes') {
                    return 'vCompraPedidoComprobante'
                }
            }

            return this.$route.path.includes('compras') ? 'vCompraComprobante' : null
        },
    },
    data: () => ({
        auth: useAuth(),
        vistas: useVistas(),
    }),
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        async setQuery() {
            this.vista.qry = {
                fltr: { es_interno: { op: 'Es', val: true } },
                incl: ['socio1', 'createdBy1', 'moneda1'],
                ordr: [['fecha_emision', 'DESC']],
                page: this.vista.table_page,
            }

            const traslado_id = this.$route.params.traslado_id
            if (traslado_id) {
                this.vista.qry.fltr.traslado_id = { op: 'Es', val: traslado_id }
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        //--- Header actions ---//
        nuevo() {
            this.$router.push({
                name: this.detailViewName,
                params: { [this.vista.detailPath]: 'nuevo' },
            })
        },
    },
}
</script>
