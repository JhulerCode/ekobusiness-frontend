<template>
    <VistaLayout :vista="vista">
        <JdTable
            :name="vista.name"
            :columns="vista.tableColumns"
            :datos="vista.tableData || []"
            :colAct="true"
            :rowOptions="vista.tableRowActions"
            @rowOptionSelected="vista.runMethod"
        />
    </VistaLayout>

    <!-- Modales -->
    <mSocioPedido v-if="modals.show.mSocioPedido" />
    <mSocioPedidoPdf v-if="modals.show.mSocioPedidoPdf" />
    <mTransaccion v-if="modals.show.mTransaccion" />
    <mPedidosClientes v-if="modals.show.mPedidosClientes" />
</template>

<script>
// Componentes base y utilidades
import VistaLayout from '@/components/VistaLayout/VistaLayout.vue'
import JdTable from '@/components/JdTable/JdTable.vue'

// Modales específicos
import mSocioPedido from '@/views/compras/pedidos/mSocioPedido.vue'
import mSocioPedidoPdf from '@/views/compras/pedidos/mSocioPedidoPdf.vue'
import mTransaccion from '@/views/compras/compras/mTransaccion.vue'
import mPedidosClientes from './mPedidosClientes.vue'

// Configuración de la vista
import VIEW_CONFIG from './venta_pedidos.config.js'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get, patch } from '@/utils/crud'
import { jqst } from '@/utils/swal'
import { downloadExcel } from '@/utils/mine'
import dayjs from 'dayjs'

export default {
    name: 'vVentaPedidos',
    components: {
        VistaLayout,
        JdTable,
        mSocioPedido,
        mSocioPedidoPdf,
        mTransaccion,
        mPedidosClientes,
    },
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        modals: () => useModals(),
        vista() {
            return this.vistas[VIEW_CONFIG.name]
        },
    },
    created() {
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

        // Header actions
        nuevo() {
            const send = {
                socio_pedido: {
                    tipo: 2,
                    fecha: dayjs().format('YYYY-MM-DD'),
                    estado: 1,
                    socio_pedido_items: [],
                    entrega_tipo: 'envio',
                    entrega_direccion_datos: {},
                },
            }
            this.modals.setModal('mSocioPedido', 'Nuevo pedido de venta', 1, send, true)
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
        descargarPlantilla() {
            const columns = [
                { title: 'EAN' },
                { title: 'Nombre' },
                { title: 'Cantidad' },
                { title: 'Valor unitario' },
            ]
            downloadExcel(columns, [], 'plantilla_pedidos.xlsx')
        },

        // Table row actions
        async ver(item) {
            const qry = {
                incl: ['socio1', 'moneda1', 'socio_pedido_items'],
                iccl: {
                    socio1: {
                        incl: ['precio_lista1'],
                        cols: ['doc_numero', 'contactos', 'direcciones', 'precio_lista'],
                    },
                    socio_pedido_items: {
                        incl: ['articulo1'],
                    },
                },
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code != 0) return

            const send = {
                socio_pedido: res.data,
                socio_elegido: { ...res.data.socio1 },
                socios: [{ ...res.data.socio1 }],
                monedas: [{ ...res.data.moneda1 }],
            }

            this.modals.setModal('mSocioPedido', 'Ver pedido de venta', 3, send, true)
        },
        async editar(item) {
            const qry = {
                incl: ['socio1', 'moneda1', 'socio_pedido_items'],
                iccl: {
                    socio1: {
                        incl: ['precio_lista1'],
                        cols: ['doc_numero', 'contactos', 'direcciones', 'precio_lista'],
                    },
                    socio_pedido_items: {
                        incl: ['articulo1'],
                    },
                },
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code != 0) return

            const send = {
                socio_pedido: res.data,
                socio_elegido: { ...res.data.socio1 },
                socios: [{ ...res.data.socio1 }],
                monedas: [{ ...res.data.moneda1 }],
            }

            this.modals.setModal('mSocioPedido', 'Editar pedido de venta', 2, send, true)
        },
        async generarPdf(item) {
            const qry = {
                incl: ['socio1', 'moneda1', 'socio_pedido_items', 'createdBy1'],
                iccl: {
                    socio1: {
                        incl: ['precio_lista1'],
                        cols: ['doc_numero', 'contactos', 'direcciones', 'precio_lista'],
                    },
                    socio_pedido_items: {
                        incl: ['articulo1'],
                    },
                },
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code != 0) return

            this.modals.setModal('mSocioPedidoPdf', 'Orden de compra', null, res.data)
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
