<template>
    <VistaLayout
        :config="VIEW_CONFIG"
        :setQuery="setQuery"
        :rowSelectable="true"
        @runMethod="runMethod"
    >
    </VistaLayout>

    <mSocioPedido v-if="modals.show?.mSocioPedido" />
    <mSocioPedidoPdf v-if="modals.show?.mSocioPedidoPdf" />
    <mTransaccion v-if="modals.show?.mTransaccion" />
    <mPedidosClientes v-if="modals.show?.mPedidosClientes" />
</template>

<script>
import mSocioPedido from '@/views/compras/pedidos/mSocioPedido.vue'
import mSocioPedidoPdf from '@/views/compras/pedidos/mSocioPedidoPdf.vue'
import mTransaccion from '@/views/compras/compras/mTransaccion.vue'
import mPedidosClientes from './mPedidosClientes.vue'

import VIEW_CONFIG from './venta_pedidos.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get, patch } from '@/utils/crud'
import { jqst, jmsg } from '@/utils/swal'
import dayjs from 'dayjs'

export default {
    name: 'vVentaPedidos',
    components: {
        mSocioPedido,
        mSocioPedidoPdf,
        mTransaccion,
        mPedidosClientes,
    },
    data: () => ({
        VIEW_CONFIG,
    }),
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        modals: () => useModals(),
        vista() {
            return this.vistas[VIEW_CONFIG.name]
        },
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        initFiltros() {
            if (!this.vista.tableColumns[1].val) {
                const colFecha = this.vista.tableColumns.find((a) => a.id == 'fecha')
                if (colFecha) {
                    colFecha.op = 'Está dentro de'
                    colFecha.val = dayjs().startOf('month').format('YYYY-MM-DD')
                    colFecha.val1 = dayjs().format('YYYY-MM-DD')
                }
            }
        },
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 2 } },
                incl: ['socio1', 'moneda1', 'createdBy1'],
                ordr: [['fecha', 'DESC']],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        //--- Header actions ---//
        nuevo() {
            this.$router.push({ name: this.VIEW_CONFIG.detailViewName, params: { id: 'nuevo' } })
        },
        recuperarGuardado() {
            const send = {
                socio_pedido: this.auth.avances.mVentaPedido,
            }
            this.modals.setModal('mSocioPedido', 'Nuevo pedido de venta', 1, send, true)
        },
        verPedidos() {
            this.modals.setModal('mPedidosClientes', 'Productos pedidos')
        },

        //--- Bulk actions ---//
        async abrirCerrarMasivo(estado) {
            const selected = this.vista.tableData.filter((a) => a.selected)
            if (selected.length == 0) return jmsg('warning', 'Seleccione al menos una orden')

            const resQst = await jqst(
                `¿Está seguro de ${estado == 1 ? 'abrir' : 'cerrar'} ${selected.length} pedidos?`,
            )
            if (resQst.isConfirmed == false) return

            const send = { id: 'bulk', ids: selected.map((b) => b.id), estado }

            this.auth.setLoading(true, 'Cargando...')
            const res = await patch(
                `${this.vista.apiUrl}/abrir-cerrar`,
                send,
                `Pedidos ${estado == 1 ? 'abiertos' : 'cerrados'}`,
            )
            this.auth.setLoading(false)

            if (res.code == 0) {
                for (const a of selected) {
                    this.vistas.updateItem(
                        this.vista.name,
                        'tableData',
                        { id: a.id, estado, estado1: res.data.estado1, selected: false },
                        true,
                    )
                }
            }
        },
        async abrirMasivo() {
            this.abrirCerrarMasivo('1')
        },
        async cerrarMasivo() {
            this.abrirCerrarMasivo('2')
        },

        //--- Row actions ---//
        async confirmarPago(item) {
            const resQst = await jqst('¿Está seguro de confirmar el pago?')
            if (resQst.isConfirmed == false) return

            this.auth.setLoading(true, 'Cargando...')
            const res = await patch(
                `${this.vista.apiUrl}/confirmar-pago`,
                item,
                'Pago confirmado del pedido',
            )
            this.auth.setLoading(false)

            if (res.code != 0) return

            this.vistas.updateItem(VIEW_CONFIG.name, 'tableData', { ...item, pagado: true })
        },
        async confirmarListo(item) {
            const resQst = await jqst('¿Está seguro de marcar como listo para entrega?')
            if (resQst.isConfirmed == false) return

            this.auth.setLoading(true, 'Cargando...')
            const res = await patch(
                `${this.vista.apiUrl}/confirmar-listo`,
                item,
                'Pedido listo para entrega',
            )
            this.auth.setLoading(false)

            if (res.code != 0) return

            this.vistas.updateItem(VIEW_CONFIG.name, 'tableData', { ...item, listo: true })
        },
        async confirmarEntrega(item) {
            const resQst = await jqst('¿Está seguro de confirmar la entrega?')
            if (resQst.isConfirmed == false) return

            this.auth.setLoading(true, 'Cargando...')
            const res = await patch(
                `${this.vista.apiUrl}/confirmar-entrega`,
                item,
                'Pedido entregado',
            )
            this.auth.setLoading(false)

            if (res.code != 0) return

            this.vistas.updateItem(VIEW_CONFIG.name, 'tableData', {
                ...item,
                entregado: true,
                estado: 2,
            })
        },
        async entregarMercaderia(item) {
            const qry = {
                incl: ['socio1', 'moneda1'],
                iccl: {
                    socio1: {
                        incl: ['precio_lista1'],
                        cols: ['doc_numero', 'contactos', 'direcciones', 'precio_lista'],
                    },
                },
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code != 0) return

            const qry2 = {
                incl: ['articulo1'],
                iccl: {
                    articulo1: {
                        cols: ['combo_articulos'],
                    },
                },
                cols: { exclude: [] },
                fltr: {
                    socio_pedido: { op: 'Es', val: item.id },
                },
                ordr: [['orden', 'ASC']],
            }

            this.auth.setLoading(true, 'Cargando...')
            const res2 = await get(`${urls.socio_pedido_items}?qry=${JSON.stringify(qry2)}`)
            this.auth.setLoading(false)

            if (res2.code != 0) return

            const send = {
                transaccion: {
                    tipo: 5,
                    fecha: dayjs().format('YYYY-MM-DD'),

                    socio: res.data.socio,
                    socio_pedido: res.data.id,

                    moneda: res.data.moneda,
                    pago_condicion: res.data.pago_condicion,

                    estado: 1,
                    transaccion_items: [],
                },
                socio_pedido_items: res2.data,
                pedido: {
                    id: res.data.id,
                    codigo: res.data.codigo,
                },
                pedidos: [
                    {
                        id: res.data.id,
                        codigo: res.data.codigo,
                    },
                ],
            }

            this.modals.setModal('mTransaccion', 'Nueva venta', 1, send, true)
        },
    },
}
</script>
