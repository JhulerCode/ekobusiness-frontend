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
    <mFormato v-if="modals.show?.mFormato" @created="setTransaccionDespachoRevisado" />
</template>

<script>
import mFormato from '@/views/calidad/formatos/mFormato.vue'

import VIEW_CONFIG from './compras.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'
import dayjs from 'dayjs'

export default {
    name: 'vCompras',
    components: {
        mFormato,
    },
    data: () => ({
        VIEW_CONFIG,
    }),
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        modals: () => useModals(),
        vista() {
            return this.vistas[this.$route.name]
        },
        detailViewName() {
            return this.$route.path.includes('compras') ? 'vCompraTraslado' : 'vVentaTraslado'
        },
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
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['socio1', 'moneda1', 'socio_pedido1'],
                page: this.vista.table_page,
            }

            if (this.$route.params.pedido_id) {
                this.vista.qry.fltr.socio_pedido = { op: 'Es', val: this.$route.params.pedido_id }
            }

            if (this.$route.path.includes('compras')) {
                this.vista.qry.fltr.tipo = { op: 'Es', val: 1 }
            }
            if (this.$route.path.includes('ventas')) {
                this.vista.qry.fltr.tipo = { op: 'Es', val: 5 }
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
            this.vista.qry.cols.push('tipo')
        },

        //--- Header actions ---//
        nuevo() {
            // const send = {
            //     transaccion: {
            //         tipo: 1,
            //         fecha: dayjs().format('YYYY-MM-DD'),
            //         estado: 1,
            //         transaccion_items: [],
            //     },
            // }
            // this.modals.setModal('mTransaccion', 'Nueva compra', 1, send, true)
            const name = this.$route.path.includes('compras') ? 'vCompraTraslado' : 'vVentaTraslado'
            this.$router.push({
                name,
                params: { traslado_id: 'nuevo' },
            })
        },
        // async recuperarGuardado() {
        //     const send = { transaccion: this.auth.avances.mCompra }
        //     if (this.auth.avances.mCompra.socio_pedido) {
        //         this.auth.setLoading(true, 'Cargando...')
        //         const res = await get(
        //             `${urls.socio_pedidos}/uno/${this.auth.avances.mCompra.socio_pedido}`,
        //         )
        //         this.auth.setLoading(false)
        //         if (res.code != 0) return
        //         send.socio_pedido_items = res.data.socio_pedido_items
        //         send.pedidos = [{ id: res.data.id, codigo: res.data.codigo }]
        //     }
        //     this.modals.setModal('mTransaccion', 'Nueva compra', 1, send, true)
        // },

        //--- Row actions ---//
        async ver(item) {
            const qry = {
                incl: ['socio1', 'moneda1', 'socio_pedido1', 'transaccion_items'],
                iccl: { transaccion_items: { incl: ['articulo1'] } },
            }
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res.code != 0) return
            const send = {
                transaccion: res.data,
                socio: { ...res.data.socio1 },
                socios: [{ ...res.data.socio1 }],
                monedas: [{ ...res.data.moneda1 }],
                pedidos: res.data.socio_pedido ? [{ ...res.data.socio_pedido1 }] : [],
            }
            this.modals.setModal('mTransaccion', 'Ver compra', 3, send, true)
        },
        async editar(item) {
            const qry = {
                incl: ['socio1', 'moneda1', 'socio_pedido1', 'transaccion_items'],
                iccl: { transaccion_items: { incl: ['articulo1'] } },
            }
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res.code != 0) return
            const send = {
                transaccion: res.data,
                socio: { ...res.data.socio1 },
                socios: [{ ...res.data.socio1 }],
                monedas: [{ ...res.data.moneda1 }],
                pedidos: res.data.socio_pedido ? [{ ...res.data.socio_pedido1 }] : [],
            }
            this.modals.setModal('mTransaccion', 'Editar compra', 2, send, true)
        },
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

        // @actions
        setTransaccionDespachoRevisado(item) {
            const transaccion = this.vista.tableData.find((a) => a.id == item.transaccion)
            if (transaccion) transaccion.calidad_revisado_despacho = item.id
        },
    },
}
</script>
