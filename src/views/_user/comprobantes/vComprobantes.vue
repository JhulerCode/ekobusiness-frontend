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
import { urls, get } from '@/utils/crud'

export default {
    components: {},
    data: () => ({
        auth: useAuth(),
        vistas: useVistas(),
    }),
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
                        ocultar: (() => {
                            if (this.$route.name == 'vCompraComprobantes') return true
                            if (this.$route.params.traslado_id) {
                                if (this.vista?.traslado?.estado == 2) return true
                            }
                            if (this.$route.params.pedido_id) {
                                if (this.vista?.pedido?.estado == 2) return true
                            }
                            return false
                        })(),
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
    created() {
        const sit = setInterval(() => {
            if (this.vista) {
                if (this.$route.params.pedido_id) this.loadPedido()
                if (this.$route.params.traslado_id) this.loadTraslado()
                clearInterval(sit)
            }
        }, 100)
    },
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
            const pedido_id = this.$route.params.pedido_id
            if (traslado_id) {
                this.vista.qry.fltr.traslado_id = { op: 'Es', val: traslado_id }
            }
            if (pedido_id) {
                this.vista.qry.fltr.pedido_id = { op: 'Es', val: pedido_id }
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

        //--- Auxiliar data ---//
        async loadTraslado() {
            const traslado_id = this.$route.params.traslado_id
            const vTraslado = this.$route.path.includes('compras')
                ? 'vCompraTraslado'
                : 'vVentaTraslado'

            this.vista.traslado = {}

            if (this.vistas[vTraslado]?.data?.id == traslado_id) {
                this.vista.traslado = this.vistas[vTraslado].data
            } else {
                const qry = {
                    incl: ['socio1', 'moneda1', 'transaccion_items'],
                    iccl: {
                        transaccion_items: { incl: ['articulo1', 'kardexes1'] },
                    },
                }
                this.auth.setLoading(true, 'Cargando traslado...')
                const res = await get(
                    `${urls.transacciones}/uno/${traslado_id}?qry=${JSON.stringify(qry)}`,
                )
                this.auth.setLoading(false)
                if (res.code !== 0 || !res.data) return
                this.vista.traslado = res.data

                this.vistas.initVista(vTraslado, 'detail')
                this.vistas.updateVista(vTraslado, {
                    titleKey: 'guia',
                    pathKey: 'traslado_id',
                    data: this.vista.traslado,
                    last_path: this.$route.path.split('/comprobantes')[0],
                })
            }
        },
        async loadPedido() {
            const pedido_id = this.$route.params.pedido_id
            const vPedido = this.$route.path.includes('compras') ? 'vCompraPedido' : 'vVentaPedido'

            this.vista.pedido = {}

            if (this.vistas[vPedido]?.data?.id == pedido_id) {
                this.vista.pedido = this.vistas[vPedido].data
            } else {
                const qry = {
                    incl: ['socio1', 'moneda1', 'socio_pedido_items'],
                    iccl: {
                        socio_pedido_items: {
                            incl: ['articulo1'],
                            sqls: ['pedido_item_entregado'],
                        },
                    },
                }

                this.auth.setLoading(true, 'Cargando pedido...')
                const res = await get(
                    `${urls.socio_pedidos}/uno/${pedido_id}?qry=${JSON.stringify(qry)}`,
                )
                this.auth.setLoading(false)

                if (res.code !== 0 || !res.data) return this.auth.goBack(this.$router)

                this.vista.pedido = res.data

                this.vistas.initVista(vPedido, 'detail')
                this.vistas.updateVista(vPedido, {
                    titleKey: 'codigo',
                    pathKey: 'pedido_id',
                    data: this.vista.pedido,
                    last_path: this.$route.path.split('/comprobantes')[0],
                })
            }
        },
    },
}
</script>
