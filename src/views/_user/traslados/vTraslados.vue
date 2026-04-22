<template>
    <VistaLayout
        :key="$route.fullPath"
        :config="VIEW_CONFIG"
        :initFiltros="initFiltros"
        :setQuery="setQuery"
        :detailViewName="detailViewName"
        @runMethod="runMethod"
    >
    </VistaLayout>

    <!-- Modales -->
    <mFormato v-if="modals?.show?.mFormato" @created="setTransaccionDespachoRevisado" />
</template>

<script>
import mFormato from '@/views/calidad/formatos/mFormato.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'
import dayjs from 'dayjs'

export default {
    components: {
        mFormato,
    },
    data: () => ({
        auth: useAuth(),
        vistas: useVistas(),
        modals: useModals(),
    }),
    computed: {
        vista() {
            return this.vistas[this.$route.name]
        },
        VIEW_CONFIG() {
            return {
                apiPath: 'transacciones',
                detailPath: 'traslado_id',

                headerActions: [
                    {
                        text: 'Nuevo',
                        action: 'nuevo',
                        permiso: [
                            'vCompras:crear',
                            'vVentas:crear',
                            'vCompraPedidos:ingresarMercaderia',
                            'vVentaPedidos:entregarMercaderia',
                        ],
                        ocultar: (() => {
                            if (this.$route.params.pedido_id) {
                                if (this.vista?.pedido?.estado == 2) return true
                            }
                            return false
                        })(),
                    },
                ],

                tableColumns: [
                    {
                        id: 'fecha',
                        title: 'Fecha',
                        prop: 'fecha1',
                        type: 'date',
                        width: '8rem',
                        show: true,
                        orden: 1,
                    },
                    {
                        id: 'guia',
                        title: 'Guía',
                        type: 'text',
                        width: '12rem',
                        show: true,
                        seek: true,
                        orden: 2,
                    },
                    // {
                    //     id: 'factura',
                    //     title: 'Factura',
                    //     type: 'text',
                    //     width: '8rem',
                    //     show: true,
                    //     seek: true,
                    //     orden: 3,
                    // },
                    {
                        id: 'socio',
                        title: 'Socio comercial',
                        prop: 'socio1.nombres',
                        type: 'related',
                        relatedUrl: 'socios',
                        mostrar: 'nombres',
                        width: '25rem',
                        show: true,
                        seek: true,
                        orden: 4,
                    },
                    {
                        id: 'estado',
                        title: 'Estado',
                        prop: 'estado1.nombre',
                        type: 'select',
                        systemKey: 'transaccion_estados',
                        format: 'estado',
                        color: 'estado1.color',
                        width: '8rem',
                        show: true,
                        orden: 8,
                    },
                    {
                        id: 'socio_pedido',
                        title: 'Nro pedido',
                        prop: 'socio_pedido1.codigo',
                        type: 'related',
                        relatedUrl: 'socio_pedidos',
                        mostrar: 'codigo',
                        width: '15rem',
                        show: true,
                        seek: true,
                        orden: 9,
                    },
                ],

                tableRowActions: [
                    {
                        label: 'Control de despacho',
                        icon: 'fa-solid fa-star',
                        action: 'controlDespacho',
                        permiso: 'vVentas:controlDespacho',
                        ocultar: { tipo: 1 },
                    },
                ],
            }
        },
        detailViewName() {
            if (this.$route.params.pedido_id) {
                if (this.$route.name == 'vCompraPedidoEntregas') {
                    return 'vCompraPedidoEntrega'
                }
                if (this.$route.name == 'vCompraPedidoRecepciones') {
                    return 'vCompraPedidoRecepcion'
                }
                if (this.$route.name == 'vVentaPedidoEntregas') {
                    return 'vVentaPedidoEntrega'
                }
            }

            return this.$route.path.includes('compras') ? 'vCompraTraslado' : 'vVentaTraslado'
        },
    },
    async created() {
        const sit = setInterval(() => {
            if (this.vista) {
                if (this.$route.params.pedido_id) this.loadPedido()
                clearInterval(sit)
            }
        }, 100)
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        initFiltros() {
            if (this.$route.params.pedido_id) return

            const i = this.vista.tableColumns.findIndex((a) => a.id == 'fecha')
            const existeUnFiltro = this.vista.tableColumns.some((a) => a.val)

            if (!existeUnFiltro) {
                this.vista.tableColumns[i].op = 'Está dentro de'
                this.vista.tableColumns[i].val = dayjs().startOf('month').format('YYYY-MM-DD')
                this.vista.tableColumns[i].val1 = dayjs().format('YYYY-MM-DD')
            }
        },
        async setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['socio1', 'moneda1', 'socio_pedido1'],
                page: this.vista.table_page,
            }

            if (this.$route.params.pedido_id) {
                this.vista.qry.fltr.socio_pedido = { op: 'Es', val: this.$route.params.pedido_id }

                if (this.$route.name == 'vCompraPedidoEntregas') {
                    this.vista.qry.fltr.tipo = { op: 'Es', val: 'abastacer_maquila' }
                }
                if (this.$route.name == 'vCompraPedidoRecepciones') {
                    this.vista.qry.fltr.tipo = { op: 'Es', val: 1 }
                }
                if (this.$route.name == 'vVentaPedidoEntregas') {
                    this.vista.qry.fltr.tipo = { op: 'Es', val: 5 }
                }
            } else {
                if (this.$route.path.includes('compras')) {
                    this.vista.qry.fltr.tipo = { op: 'Es', val: 1 }
                }
                if (this.$route.path.includes('ventas')) {
                    this.vista.qry.fltr.tipo = { op: 'Es', val: 5 }
                }
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
            this.vista.qry.cols.push('tipo', 'calidad_revisado_despacho')
        },

        //--- Header actions ---//
        nuevo() {
            this.$router.push({
                name: this.detailViewName,
                params: { [this.vista.detailPath]: 'nuevo' },
            })
        },

        //--- Row actions ---//
        // async ver(item) {
        //     const qry = {
        //         incl: ['socio1', 'moneda1', 'socio_pedido1', 'transaccion_items'],
        //         iccl: { transaccion_items: { incl: ['articulo1'] } },
        //     }
        //     this.auth.setLoading(true, 'Cargando...')
        //     const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
        //     this.auth.setLoading(false)
        //     if (res.code != 0) return
        //     const send = {
        //         transaccion: res.data,
        //         socio: { ...res.data.socio1 },
        //         socios: [{ ...res.data.socio1 }],
        //         monedas: [{ ...res.data.moneda1 }],
        //         pedidos: res.data.socio_pedido ? [{ ...res.data.socio_pedido1 }] : [],
        //     }
        //     this.modals.setModal('mTransaccion', 'Ver compra', 3, send, true)
        // },
        // async editar(item) {
        //     const qry = {
        //         incl: ['socio1', 'moneda1', 'socio_pedido1', 'transaccion_items'],
        //         iccl: { transaccion_items: { incl: ['articulo1'] } },
        //     }
        //     this.auth.setLoading(true, 'Cargando...')
        //     const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
        //     this.auth.setLoading(false)
        //     if (res.code != 0) return
        //     const send = {
        //         transaccion: res.data,
        //         socio: { ...res.data.socio1 },
        //         socios: [{ ...res.data.socio1 }],
        //         monedas: [{ ...res.data.moneda1 }],
        //         pedidos: res.data.socio_pedido ? [{ ...res.data.socio_pedido1 }] : [],
        //     }
        //     this.modals.setModal('mTransaccion', 'Editar compra', 2, send, true)
        // },
        async controlDespacho(item) {
            const formato_id = 'RE-BPM-24'
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.formatos}/uno/${formato_id}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            this.auth.setLoading(true, 'Cargando...')
            const res1 = await get(`${urls.formato_values}/uno/${item.calidad_revisado_despacho}`)
            this.auth.setLoading(false)
            if (res1.code != 0) return

            if (res1.data == null) {
                const send = {
                    transaccion: item.id,
                    transaccion1: { ...item },
                    formato: {
                        codigo: res.data.id,
                        columns: res.data.columns,
                        instructivo: res.data.instructivo,
                    },
                }
                this.modals.setModal('mFormato', formato_id, 1, send, true)
            } else {
                for (const a of res.data.columns) a.value = res1.data[a.id]
                const send = {
                    transaccion: item.id,
                    transaccion1: res1.data.transaccion1,
                    formato: {
                        id: res1.data.id,
                        codigo: res.data.id,
                        columns: res.data.columns,
                        instructivo: res.data.instructivo,
                    },
                }
                this.modals.setModal('mFormato', formato_id, 2, send, true)
            }
        },

        //--- auxiliar data ---//
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
                    last_path: this.$router.resolve({
                        name: vPedido,
                        params: { pedido_id: this.vista.pedido.id },
                    }).path,
                })
            }
        },

        // @actions
        setTransaccionDespachoRevisado(item) {
            const transaccion = this.vista.tableData.find((a) => a.id == item.transaccion)
            if (transaccion) transaccion.calidad_revisado_despacho = item.id
        },
    },
}
</script>
