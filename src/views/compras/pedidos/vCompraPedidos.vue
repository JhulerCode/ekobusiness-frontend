<template>
    <VistaLayout :vista="vista">
        <JdTable
            :name="vista.name"
            :columns="vista.tableColumns"
            :datos="vista.tableData"
            :colAct="true"
            :rowOptions="vista.tableRowActions"
            @rowOptionSelected="runMethod"
        />
    </VistaLayout>

    <!-- Modales -->
    <mSocioPedido v-if="modals.show.mSocioPedido" />
    <mSocioPedidoPdf v-if="modals.show.mSocioPedidoPdf" />
    <mTransaccion v-if="modals.show.mTransaccion" />
    <mStockPicking v-if="modals.show.mStockPicking" />
</template>

<script>
// Componentes base y utilidades
import VistaLayout from '@/components/VistaLayout/VistaLayout.vue'
import JdTable from '@/components/JdTable/JdTable.vue'

// Modales específicos
import mSocioPedido from '@/views/compras/pedidos/mSocioPedido.vue'
import mSocioPedidoPdf from '@/views/compras/pedidos/mSocioPedidoPdf.vue'
import mTransaccion from '@/views/compras/compras/mTransaccion.vue'
import mStockPicking from '@/views/compras/pedidos/mStockPicking.vue'

// Configuración de la vista
import VIEW_CONFIG from './compra_pedidos.config.js'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get, patch, post } from '@/utils/crud'
import { jqst } from '@/utils/swal'
import dayjs from 'dayjs'

export default {
    name: 'vCompraPedidos',
    components: {
        VistaLayout,
        JdTable,
        mSocioPedido,
        mSocioPedidoPdf,
        mTransaccion,
        mStockPicking,
    },
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        modals: () => useModals(),
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
                fltr: { tipo: { op: 'Es', val: 1 } },
                incl: ['socio1', 'moneda1', 'createdBy1'],
                ordr: [['fecha', 'DESC']],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
            this.vista.qry.cols.push('is_maquila')
        },

        // --- Acciones de Registro ---
        nuevo() {
            const send = {
                socio_pedido: {
                    tipo: 1,
                    fecha: dayjs().format('YYYY-MM-DD'),
                    estado: 1,
                    socio_pedido_items: [],
                    entrega_tipo: 'envio',
                    entrega_direccion_datos: {},
                },
            }
            this.modals.setModal('mSocioPedido', 'Nuevo pedido de compra', 1, send, true)
        },
        recuperarGuardado() {
            const send = { socio_pedido: this.auth.avances.mCompraPedido }
            this.modals.setModal('mSocioPedido', 'Nuevo pedido de compra', 1, send, true)
        },
        async ver(item) {
            const qry = {
                incl: ['socio1', 'moneda1', 'socio_pedido_items'],
                iccl: {
                    socio1: {
                        incl: ['precio_lista1'],
                        cols: ['doc_numero', 'contactos', 'direcciones', 'precio_lista'],
                    },
                    socio_pedido_items: { incl: ['articulo1'] },
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
            this.modals.setModal('mSocioPedido', 'Ver pedido de compra', 3, send, true)
        },
        async editar(item) {
            const qry = {
                incl: ['socio1', 'moneda1', 'socio_pedido_items'],
                iccl: {
                    socio1: {
                        incl: ['precio_lista1'],
                        cols: ['doc_numero', 'contactos', 'direcciones', 'precio_lista'],
                    },
                    socio_pedido_items: { incl: ['articulo1'] },
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
            this.modals.setModal('mSocioPedido', 'Editar pedido de compra', 2, send, true)
        },
        async generarPdf(item) {
            const qry = {
                incl: ['socio1', 'moneda1', 'socio_pedido_items', 'createdBy1'],
                iccl: {
                    socio1: {
                        incl: ['precio_lista1'],
                        cols: ['doc_numero', 'contactos', 'direcciones', 'precio_lista'],
                    },
                    socio_pedido_items: { incl: ['articulo1'] },
                    createdBy1: { cols: ['cargo', 'telefono'] },
                },
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code != 0) return

            const send = {
                socio_pedido: res.data,
            }

            this.modals.setModal('mSocioPedidoPdf', 'Orden de compra', null, send, true)
        },
        async terminar(item) {
            const resQst = await jqst('¿Está seguro de terminar el pedido?')
            if (resQst.isConfirmed == false) return
            this.auth.setLoading(true, 'Cargando...')
            const res = await patch(`${this.vista.apiUrl}/terminar`, item, 'Pedido terminado')
            this.auth.setLoading(false)
            if (res.code == 0) this.vistas.updateItem(this.vista.name, 'tableData', res.data)
        },
        async recalcularEntregados(item) {
            const resQst = await jqst('¿Está seguro de recalcular los entregados del pedido?')
            if (resQst.isConfirmed == false) return
            this.auth.setLoading(true, 'Cargando...')
            const res = await post(
                `${urls.socio_pedido_items}/recalcular-entregados`,
                { socio_pedido: item.id },
                'Entregados recalculados',
            )
            this.auth.setLoading(false)
            if (res.code != 0) return
        },
        async entregarMercaderia(item) {
            const qry0 = {
                cols: ['tipo', 'socio', 'fecha', 'guia', 'socio_pedido'],
                fltr: {
                    tipo: { op: 'Es', val: 'abastacer_maquila' },
                    socio_pedido: { op: 'Es', val: item.id },
                },
                iccl: { transaccion_items: { incl: ['articulo1'] } },
            }
            this.auth.setLoading(true, 'Cargando...')
            const res0 = await get(`${urls.transacciones}?qry=${JSON.stringify(qry0)}`)
            this.auth.setLoading(false)
            if (res0.code != 0) return

            let transaccion = {}
            let mrp_bom_lines = []

            if (res0.data.length > 0) {
                const qry01 = {
                    incl: ['articulo1', 'kardexes'],
                    iccl: {
                        kardexes: {
                            cols: ['cantidad', 'fv', 'lote', 'stock', 'lote_fv_stock'],
                            incl: ['lote_padre1'],
                        },
                    },
                    cols: { exclude: [] },
                    fltr: { transaccion: { op: 'Es', val: res0.data[0].id } },
                    ordr: [['orden', 'ASC']],
                }
                this.auth.setLoading(true, 'Cargando...')
                const res01 = await get(`${urls.transaccion_items}?qry=${JSON.stringify(qry01)}`)
                this.auth.setLoading(false)
                if (res01.code != 0) return
                res0.data[0].transaccion_items = res01.data
                transaccion = res0.data[0]
            }

            const qry = {
                incl: ['socio1', 'moneda1', 'socio_pedido_items'],
                iccl: {
                    socio1: { cols: ['doc_numero', 'contactos', 'direcciones', 'precio_lista'] },
                },
            }
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            if (!transaccion.id) {
                transaccion = {
                    tipo: 'abastacer_maquila',
                    fecha: dayjs().format('YYYY-MM-DD'),
                    socio: res.data.socio,
                    socio_pedido: res.data.id,
                    moneda: res.data.moneda,
                    pago_condicion: res.data.pago_condicion,
                    estado: 1,
                    transaccion_items: [],
                }
                const qry1 = {
                    cols: ['articulo'],
                    fltr: {
                        articulo: {
                            op: 'Es',
                            val: res.data.socio_pedido_items.map((a) => a.articulo),
                        },
                        'mrp_bom_socios.socio': { op: 'Es', val: res.data.socio },
                    },
                    incl: ['mrp_bom_lines', 'mrp_bom_socios'],
                    iccl: { mrp_bom_lines: { incl: ['articulo1'] } },
                }
                this.auth.setLoading(true, 'Cargando...')
                const res1 = await get(`${urls.mrp_boms}?qry=${JSON.stringify(qry1)}`)
                this.auth.setLoading(false)
                if (res1.code != 0) return
                if (res1.data.length > 0) {
                    for (const a of res1.data) {
                        for (const b of a.mrp_bom_lines) {
                            const i = res.data.socio_pedido_items.find(
                                (c) => c.articulo == a.articulo,
                            )
                            b.cantidad = i.cantidad * b.cantidad
                        }
                    }
                    mrp_bom_lines = res1.data.reduce((acc, a) => [...acc, ...a.mrp_bom_lines], [])
                }
            }

            const send = {
                transaccion,
                socio_pedido_items: res.data.socio_pedido_items,
                socios: [{ ...res.data.socio1 }],
                pedido: { id: res.data.id, codigo: res.data.codigo },
                pedidos: [{ id: res.data.id, codigo: res.data.codigo }],
                mrp_bom_lines,
            }

            if (!transaccion.id) {
                send.transaccion.transaccion_items = JSON.parse(JSON.stringify(send.mrp_bom_lines))
                this.modals.setModal('mStockPicking', 'Abastecer para maquila', 1, send, true)
            } else {
                this.modals.setModal('mStockPicking', 'Abastecer para maquila', 3, send, true)
            }
        },
        async ingresarMercaderia(item) {
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
                cols: { exclude: [] },
                fltr: { socio_pedido: { op: 'Es', val: item.id } },
                ordr: [['orden', 'ASC']],
            }
            this.auth.setLoading(true, 'Cargando...')
            const res2 = await get(`${urls.socio_pedido_items}?qry=${JSON.stringify(qry2)}`)
            this.auth.setLoading(false)
            if (res2.code != 0) return

            const send = {
                transaccion: {
                    tipo: 1,
                    fecha: dayjs().format('YYYY-MM-DD'),
                    socio: res.data.socio,
                    socio_pedido: res.data.id,
                    moneda: res.data.moneda,
                    pago_condicion: res.data.pago_condicion,
                    estado: 1,
                    transaccion_items: [],
                },
                socio_pedido_items: res2.data,
                pedido: { id: res.data.id, codigo: res.data.codigo },
                pedidos: [{ id: res.data.id, codigo: res.data.codigo }],
            }
            this.modals.setModal('mTransaccion', 'Nueva compra', 1, send, true)
        },
    },
}
</script>
