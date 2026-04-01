<template>
    <VistaLayout
        :key="$route.fullPath"
        :config="VIEW_CONFIG"
        :initFiltros="initFiltros"
        :setQuery="setQuery"
        :rowSelectable="true"
        :detailViewName="detailViewName"
        @runMethod="runMethod"
    >
    </VistaLayout>
</template>

<script>
import VIEW_CONFIG from './socio_pedidos.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { patch } from '@/utils/crud'
import { jqst, jmsg } from '@/utils/swal'
// import dayjs from 'dayjs'

export default {
    components: {},
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        modals: () => useModals(),
        vista() {
            return this.vistas[this.$route.name]
        },
        detailViewName() {
            return this.$route.path.includes('compras') ? 'vCompraPedido' : 'vVentaPedido'
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
            const i = this.vista.tableColumns.findIndex((a) => a.id == 'estado')
            const existeUnFiltro = this.vista.tableColumns.some((a) => a.val)

            if (!existeUnFiltro) {
                // this.vista.tableColumns[i].op = 'Está dentro de'
                // this.vista.tableColumns[i].val = dayjs().startOf('month').format('YYYY-MM-DD')
                // this.vista.tableColumns[i].val1 = dayjs().format('YYYY-MM-DD')
                this.vista.tableColumns[i].op = 'Es'
                this.vista.tableColumns[i].val = '1'
                this.vista.tableColumns[i].valLabel = 'ABIERTO'
            }
        },
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['socio1', 'moneda1', 'createdBy1'],
                ordr: [['fecha', 'DESC']],
                page: this.vista.table_page,
            }

            if (this.$route.path.includes('compras')) {
                this.vista.qry.fltr.tipo = { op: 'Es', val: 1 }
            }
            if (this.$route.path.includes('ventas')) {
                this.vista.qry.fltr.tipo = { op: 'Es', val: 2 }
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
            this.vista.qry.cols.push('tipo', 'is_maquila')
        },

        //--- Header actions ---//
        nuevo() {
            this.$router.push({
                name: this.detailViewName,
                params: { [this.vista.detailPath]: 'nuevo' },
            })
        },
        recuperarGuardado() {
            this.$router.push({
                name: this.detailViewName,
                params: { [this.vista.detailPath]: 'avance' },
            })
            // const send = { socio_pedido: this.auth.avances.mCompraPedido }
            // this.modals.setModal('mSocioPedido', 'Nuevo pedido de compra', 1, send, true)
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
        abrir(item) {
            this.abrirCerrar(item, '1')
        },
        cerrar(item) {
            this.abrirCerrar(item, '2')
        },
        async abrirCerrar(item, estado) {
            const resQst = await jqst(
                `¿Está seguro de ${estado == 1 ? 'abrir' : 'cerrar'} el pedido?`,
            )
            if (resQst.isConfirmed == false) return

            const send = { id: item.id, ids: item.id, estado }

            this.auth.setLoading(true, 'Cargando...')
            const res = await patch(
                `${this.vista.apiUrl}/abrir-cerrar`,
                send,
                `Pedido ${estado == 1 ? 'abierto' : 'cerrado'}`,
            )
            this.auth.setLoading(false)

            if (res.code != 0) return

            this.vistas.updateItem(this.vista.name, 'tableData', res.data, true)
        },
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

            this.vistas.updateItem(this.vista.name, 'tableData', res.data, true)
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

            this.vistas.updateItem(this.vista.name, 'tableData', res.data, true)
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

            this.vistas.updateItem(this.vista.name, 'tableData', res.data, true)
        },
    },
}
</script>
