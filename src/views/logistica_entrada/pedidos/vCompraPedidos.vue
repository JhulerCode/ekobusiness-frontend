<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left">
                <strong>Pedidos de compra</strong>

                <JdButton
                    text="Recuperar"
                    tipo="2"
                    title="Recuperar guardado"
                    @click="recuperarGuardado"
                    v-if="
                        useAuth.avances.mCompraPedido &&
                        useAuth.verifyPermiso('vCompraPedidos:crear')
                    "
                />

                <JdButton
                    text="Nuevo"
                    title="Crear nuevo"
                    @click="nuevo"
                    v-if="useAuth.verifyPermiso('vCompraPedidos:crear')"
                />
            </div>

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="columns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadPedidos"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadPedidos" />

                <JdButton
                    icon="fa-solid fa-file-excel"
                    tipo="2"
                    title="Exportar"
                    @click="$refs['jdtable'].downloadData()"
                />

                <JdButton
                    icon="fa-solid fa-gear"
                    tipo="2"
                    title="Columnas"
                    @click="$refs['jdtable'].openConfigCols()"
                />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.pedidos || []"
            :colAct="true"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
            ref="jdtable"
            :reload="loadPedidos"
        />
    </div>

    <!-- Modales -->
    <mSocioPedido v-if="useModals.show.mSocioPedido" />
    <mSocioPedidoPdf v-if="useModals.show.mSocioPedidoPdf" />
    <mTransaccion v-if="useModals.show.mTransaccion" />
    <mStockPicking v-if="useModals.show.mStockPicking" />
    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
// Componentes base y utilidades
import { JdButton, mConfigFiltros, mConfigCols } from '@jhuler/components'
import JdBuscador from '@/components/JdBuscador.vue'
import JdTable from '@/components/JdTable/JdTable.vue'
import JdPaginacion from '@/components/JdPaginacion.vue'

// Configuración de la vista
import { COLUMNS, TABLE_ROW_OPTIONS } from './compra_pedidos.config'

// Modales específicos
import mSocioPedido from '@/views/logistica_entrada/pedidos/mSocioPedido.vue'
import mSocioPedidoPdf from '@/views/logistica_entrada/pedidos/mSocioPedidoPdf.vue'
import mTransaccion from '@/views/logistica_entrada/compras/mTransaccion.vue'
import mStockPicking from '@/views/logistica_entrada/pedidos/mStockPicking.vue'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get, delet, patch, post } from '@/utils/crud'
import { jqst } from '@/utils/swal'
import dayjs from 'dayjs'

export default {
    name: 'vCompraPedidos',
    components: {
        JdButton,
        JdBuscador,
        JdTable,
        JdPaginacion,
        mConfigCols,
        mConfigFiltros,
        mSocioPedido,
        mSocioPedidoPdf,
        mTransaccion,
        mStockPicking,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},
        tableName: 'vCompraPedidos',

        // Configuraciones traídas de compra_pedidos.config.js
        columns: JSON.parse(JSON.stringify(COLUMNS)),
        tableRowOptions: TABLE_ROW_OPTIONS,
    }),
    async created() {
        this.vista = this.useVistas.vCompraPedidos
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
        this.vista.table_page = 1
        if (this.useAuth.verifyPermiso('vCompraPedidos:listar')) this.loadPedidos()
    },
    methods: {
        // --- Gestión de Tabla ---
        runMethod(method, item) {
            this[method](item)
        },

        // --- Carga de Datos ---
        initFiltros() {
            if (!this.columns[0].val) {
                this.columns[0].op = 'Está dentro de'
                this.columns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
                this.columns[0].val1 = dayjs().format('YYYY-MM-DD')
            }
        },
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 1 } },
                incl: ['socio1', 'moneda1', 'createdBy1'],
                ordr: [['fecha', 'DESC']],
                page: this.vista.table_page,
            }
            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('is_maquila')
        },
        async loadPedidos() {
            this.setQuery()
            this.vista.pedidos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socio_pedidos}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true
            if (res.code != 0) return
            this.vista.pedidos = res.data
            this.vista.table_meta = res.meta
        },

        // --- Datos de Apoyo ---
        async loadSocios() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: 1 }, activo: { op: 'Es', val: true } },
                cols: ['nombres'],
                ordr: [['nombres', 'ASC']],
            }
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            if (res.code !== 0) return
            return (this.vista.socios = res.data)
        },
        async loadMonedas() {
            const qry = {
                fltr: {},
                cols: ['id', 'nombre', 'simbolo'],
                ordr: [
                    ['estandar', 'DESC'],
                    ['nombre', 'ASC'],
                ],
            }
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.monedas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            if (res.code != 0) return
            return (this.vista.monedas = res.data)
        },
        async loadDatosSistema() {
            const qry = ['pedido_estados', 'pago_condiciones']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)
            if (res.code == 0) Object.assign(this.vista, res.data)
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
            this.useModals.setModal('mSocioPedido', 'Nuevo pedido de compra', 1, send, true)
        },
        recuperarGuardado() {
            const send = { socio_pedido: this.useAuth.avances.mCompraPedido }
            this.useModals.setModal('mSocioPedido', 'Nuevo pedido de compra', 1, send, true)
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
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socio_pedidos}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            if (res.code != 0) return
            const send = {
                socio_pedido: res.data,
                socio_elegido: { ...res.data.socio1 },
                socios: [{ ...res.data.socio1 }],
                monedas: [{ ...res.data.moneda1 }],
            }
            this.useModals.setModal('mSocioPedido', 'Ver pedido de compra', 3, send, true)
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
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socio_pedidos}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            if (res.code != 0) return
            const send = {
                socio_pedido: res.data,
                socio_elegido: { ...res.data.socio1 },
                socios: [{ ...res.data.socio1 }],
                monedas: [{ ...res.data.moneda1 }],
            }
            this.useModals.setModal('mSocioPedido', 'Editar pedido de compra', 2, send, true)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return
            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.socio_pedidos, item)
            this.useAuth.setLoading(false)
            if (res.code == 0) this.useVistas.removeItem('vCompraPedidos', 'pedidos', item)
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

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socio_pedidos}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                socio_pedido: res.data,
            }

            this.useModals.setModal('mSocioPedidoPdf', 'Orden de compra', null, send, true)
        },
        async terminar(item) {
            const resQst = await jqst('¿Está seguro de terminar el pedido?')
            if (resQst.isConfirmed == false) return
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await patch(`${urls.socio_pedidos}/terminar`, item, 'Pedido terminado')
            this.useAuth.setLoading(false)
            if (res.code == 0) this.useVistas.updateItem('vCompraPedidos', 'pedidos', res.data)
        },
        async recalcularEntregados(item) {
            const resQst = await jqst('¿Está seguro de recalcular los entregados del pedido?')
            if (resQst.isConfirmed == false) return
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await post(
                `${urls.socio_pedido_items}/recalcular-entregados`,
                { socio_pedido: item.id },
                'Entregados recalculados',
            )
            this.useAuth.setLoading(false)
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
            this.useAuth.setLoading(true, 'Cargando...')
            const res0 = await get(`${urls.transacciones}?qry=${JSON.stringify(qry0)}`)
            this.useAuth.setLoading(false)
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
                this.useAuth.setLoading(true, 'Cargando...')
                const res01 = await get(`${urls.transaccion_items}?qry=${JSON.stringify(qry01)}`)
                this.useAuth.setLoading(false)
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
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socio_pedidos}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
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
                this.useAuth.setLoading(true, 'Cargando...')
                const res1 = await get(`${urls.mrp_boms}?qry=${JSON.stringify(qry1)}`)
                this.useAuth.setLoading(false)
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
                this.useModals.setModal('mStockPicking', 'Abastecer para maquila', 1, send, true)
            } else {
                this.useModals.setModal('mStockPicking', 'Abastecer para maquila', 3, send, true)
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
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socio_pedidos}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            if (res.code != 0) return

            const qry2 = {
                incl: ['articulo1'],
                cols: { exclude: [] },
                fltr: { socio_pedido: { op: 'Es', val: item.id } },
                ordr: [['orden', 'ASC']],
            }
            this.useAuth.setLoading(true, 'Cargando...')
            const res2 = await get(`${urls.socio_pedido_items}?qry=${JSON.stringify(qry2)}`)
            this.useAuth.setLoading(false)
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
            this.useModals.setModal('mTransaccion', 'Nueva compra', 1, send, true)
        },

        // --- Otros ---
        async openConfigFiltros() {
            await this.loadDatosSistema()
            const cols = this.columns
            for (const a of cols) {
                if (a.id == 'socio') a.reload = this.loadSocios
                if (a.id == 'pago_condicion') a.lista = this.vista.pago_condiciones
                if (a.id == 'moneda') a.reload = this.loadMonedas
                if (a.id == 'estado') a.lista = this.vista.pedido_estados
            }
            const send = { table: this.tableName, cols, reload: this.loadPedidos }
            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },
    },
}
</script>
