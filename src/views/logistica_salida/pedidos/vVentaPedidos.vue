<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Pedidos de venta</strong>

            <div class="buttons">
                <JdButton
                    text="Descargar plantilla"
                    title="Para pedidos de venta"
                    tipo="2"
                    @click="descargarPlantilla"
                />

                <JdButton
                    text="Ver productos pedidos"
                    tipo="2"
                    @click="verPedidos()"
                    v-if="useAuth.verifyPermiso('vVentaPedidos:verProductosPedidos')"
                />

                <JdButton
                    text="Recuperar guardado"
                    tipo="2"
                    @click="recuperarGuardado()"
                    v-if="
                        useAuth.avances.mVentaPedido && useAuth.verifyPermiso('vVentaPedidos:crear')
                    "
                />

                <JdButton
                    text="Nuevo"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vVentaPedidos:crear')"
                />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.pedidos || []"
            :colAct="true"
            :configFiltros="openConfigFiltros"
            :reload="loadPedidos"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        >
        </JdTable>
    </div>

    <mSocioPedido v-if="useModals.show.mSocioPedido" />
    <mSocioPedidoPdf v-if="useModals.show.mSocioPedidoPdf" />
    <mTransaccion v-if="useModals.show.mTransaccion" />
    <mPedidosClientes v-if="useModals.show.mPedidosClientes" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdButton, JdTable, mConfigFiltros, mConfigCols } from '@jhuler/components'

import mPedidosClientes from './mPedidosClientes.vue'
import mSocioPedido from '@/views/logistica_entrada/pedidos/mSocioPedido.vue'
import mSocioPedidoPdf from '@/views/logistica_entrada/pedidos/mSocioPedidoPdf.vue'
import mTransaccion from '@/views/logistica_entrada/compras/mTransaccion.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet, patch } from '@/utils/crud'
import { jqst } from '@/utils/swal'
import { downloadExcel } from '@/utils/mine'
// import { generarOcPDF } from '@/utils/jpdf'

import dayjs from 'dayjs'

export default {
    components: {
        JdButton,
        JdTable,

        mConfigCols,
        mConfigFiltros,
        mPedidosClientes,

        mSocioPedido,
        mSocioPedidoPdf,
        mTransaccion,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),
        dayjs,

        vista: {},

        tableName: 'vVentaPedidos',
        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                format: 'date',
                type: 'date',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'codigo',
                title: 'Nro pedido',
                type: 'text',
                width: '12rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'socio',
                title: 'Cliente',
                prop: 'socio1.nombres',
                type: 'select',
                mostrar: 'nombres_apellidos',
                width: '20rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'pago_condicion',
                title: 'Condición de pago',
                prop: 'pago_condicion1.nombre',
                type: 'select',
                width: '12rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'moneda',
                title: 'Moneda',
                prop: 'moneda1.nombre',
                type: 'select',
                width: '8rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'monto',
                title: 'Importe',
                type: 'number',
                format: 'decimal',
                toRight: true,
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'estado',
                title: 'Estado',
                prop: 'estado1.nombre',
                type: 'select',
                format: 'estado',
                width: '8rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'pagado',
                title: 'Pagado?',
                prop: 'pagado1.nombre',
                type: 'select',
                format: 'yesno',
                width: '8rem',
                show: true,
            },
            {
                id: 'listo',
                title: 'Listo para entrega?',
                prop: 'listo1.nombre',
                type: 'select',
                format: 'yesno',
                width: '8rem',
                show: true,
            },
            {
                id: 'entregado',
                title: 'Entregado?',
                prop: 'entregado1.nombre',
                type: 'select',
                format: 'yesno',
                width: '8rem',
                show: true,
            },
            {
                id: 'origin',
                title: 'Origen',
                width: '10rem',
                type: 'text',
                show: true,
            },
            {
                id: 'createdBy',
                title: 'Creado por',
                prop: 'createdBy1.nombres_apellidos',
                filtrable: false,
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
        tableRowOptions: [
            {
                label: 'Ver',
                icon: 'fa-regular fa-folder-open',
                action: 'ver',
                permiso: 'vVentaPedidos:ver',
            },
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vVentaPedidos:editar',
                ocultar: { estado: ['0', '2'], origin: 'ecommerce' },
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: 'vVentaPedidos:eliminar',
                ocultar: { pagado: true, origin: 'ecommerce' },
            },
            {
                label: 'Exportar en PDF',
                icon: 'fa-regular fa-file-pdf',
                action: 'generarPdf',
                permiso: 'vVentaPedidos:generarPdf',
            },
            {
                label: 'Confirmar pago',
                icon: 'fa-solid fa-hand-holding-dollar',
                action: 'confirmarPago',
                permiso: 'vVentaPedidos:confirmarPago',
                ocultar: { pagado: true, pago_condicion: ['2', '3'] },
            },
            {
                label: 'Marcar como listo',
                icon: 'fa-solid fa-check-double',
                action: 'confirmarListo',
                permiso: 'vVentaPedidos:confirmarListo',
                ocultar: { listo: true, pagado: false, pago_condicion: ['2', '3'] },
            },
            {
                label: 'Marcar como listo',
                icon: 'fa-solid fa-check-double',
                action: 'confirmarListo',
                permiso: 'vVentaPedidos:confirmarListo',
                ocultar: { listo: true, pago_condicion: 1 },
            },
            {
                label: 'Confirmar entrega',
                icon: 'fa-regular fa-truck',
                action: 'confirmarEntrega',
                permiso: 'vVentaPedidos:confirmarEntrega',
                ocultar: { entregado: true, listo: false },
            },
            {
                label: 'Entregar mercadería',
                icon: 'fa-regular fa-circle-down',
                action: 'entregarMercaderia',
                permiso: 'vVentaPedidos:entregarMercaderia',
                ocultar: { estado: ['0', '2'] },
            },
        ],
    }),
    async created() {
        this.vista = this.useVistas.vVentaPedidos
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vVentaPedidos:listar') == true) this.loadPedidos()
    },
    methods: {
        initFiltros() {
            this.columns[0].op = 'Está dentro de'
            this.columns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
            this.columns[0].val1 = dayjs().format('YYYY-MM-DD')
        },
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 2 } },
                incl: ['socio1', 'moneda1', 'createdBy1'],
                ordr: [['fecha', 'DESC']],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
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
        },

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

            this.useModals.setModal('mSocioPedido', 'Nuevo pedido de venta', 1, send, true)
        },
        recuperarGuardado() {
            const send = {
                socio_pedido: this.useAuth.avances.mVentaPedido,
            }

            this.useModals.setModal('mSocioPedido', 'Nuevo pedido de compra', 1, send, true)
        },
        verPedidos() {
            this.useModals.setModal('mPedidosClientes', 'Productos pedidos')
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

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.columns
            for (const a of cols) {
                if (a.id == 'socio') a.reload = this.loadSocios
                if (a.id == 'pago_condicion') a.lista = this.vista.pago_condiciones
                if (a.id == 'moneda') a.reload = this.loadMonedas
                if (a.id == 'estado') a.lista = this.vista.pedido_estados
                if (a.id == 'pagado') a.lista = this.vista.estados
                if (a.id == 'listo') a.lista = this.vista.estados
                if (a.id == 'entregado') a.lista = this.vista.estados
            }

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadPedidos,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
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

            this.useModals.setModal('mSocioPedido', 'Ver pedido de venta Q', 3, send, true)
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

            this.useModals.setModal('mSocioPedido', 'Editar pedido de venta', 2, send, true)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.socio_pedidos, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vVentaPedidos', 'pedidos', item)
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

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socio_pedidos}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mSocioPedidoPdf', 'Orden de compra', null, res.data)
        },
        async confirmarPago(item) {
            const resQst = await jqst('¿Está seguro de confirmar el pago?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await patch(
                `${urls.socio_pedidos}/confirmar-pago`,
                item,
                'Pago confirmado del pedido',
            )
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vVentaPedidos', 'pedidos', { ...item, pagado: true })
        },
        async confirmarListo(item) {
            const resQst = await jqst('¿Está seguro de marcar como listo para entrega?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await patch(
                `${urls.socio_pedidos}/confirmar-listo`,
                item,
                'Pedido listo para entrega',
            )
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vVentaPedidos', 'pedidos', { ...item, listo: true })
        },
        async confirmarEntrega(item) {
            const resQst = await jqst('¿Está seguro de confirmar la entrega?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await patch(
                `${urls.socio_pedidos}/confirmar-entrega`,
                item,
                'Pedido entregado',
            )
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vVentaPedidos', 'pedidos', {
                ...item,
                entregado: true,
                estado: 2,
            })
        },
        async entregarMercaderia(item) {
            const qry = {
                // incl: ['socio1', 'moneda1', 'socio_pedido_items'],
                incl: ['socio1', 'moneda1'],
                iccl: {
                    socio1: {
                        incl: ['precio_lista1'],
                        cols: ['doc_numero', 'contactos', 'direcciones', 'precio_lista'],
                    },
                    // socio_pedido_items: {
                    //     incl: ['articulo1'],
                    // },
                },
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socio_pedidos}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

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

            this.useAuth.setLoading(true, 'Cargando...')
            const res2 = await get(`${urls.socio_pedido_items}?qry=${JSON.stringify(qry2)}`)
            this.useAuth.setLoading(false)

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

            this.useModals.setModal('mTransaccion', 'Nueva venta', 1, send, true)
        },

        async loadSocios() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: 2 }, activo: { op: 'Es', val: true } },
                cols: ['nombres', 'apellidos', 'nombres_apellidos'],
                ordr: [
                    ['nombres', 'ASC'],
                    ['apellidos', 'ASC'],
                ],
            }

            this.vista.socios = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.vista.socios = res.data
            return res.data
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

            this.vista.monedas = res.data
            return res.data
        },
        async loadDatosSistema() {
            const qry = ['pedido_estados', 'pago_condiciones', 'estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>
