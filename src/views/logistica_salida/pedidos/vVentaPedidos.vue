<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Pedidos de venta</strong>

            <div class="buttons">
                <JdButton text="Descargar plantilla" title="Para pedidos de venta" tipo="2"
                    @click="descargarPlantilla" />
                    
                <JdButton text="Ver productos pedidos" tipo="2" @click="verPedidos()"
                    v-if="useAuth.verifyPermiso('vVentaPedidos_verProductosPedidos')" />

                <JdButton text="Recuperar guardado" tipo="2" @click="recuperarGuardado()"
                    v-if="useAuth.avances.mVentaPedido && useAuth.verifyPermiso('vVentaPedidos_crear')" />

                <JdButton text="Nuevo" @click="nuevo()" v-if="useAuth.verifyPermiso('vVentaPedidos_crear')" />
            </div>
        </div>

        <JdTable :name="tableName" :columns="columns" :datos="vista.pedidos || []" :colAct="true"
            :configFiltros="openConfigFiltros" :reload="loadPedidos" :rowOptions="tableRowOptionsFiltered"
            @rowOptionSelected="runMethod">
        </JdTable>
    </div>

    <mSocioPedido v-if="useModals.show.mSocioPedido" />
    <mTransaccion v-if="useModals.show.mTransaccion" />
    <mPedidosClientes v-if="useModals.show.mPedidosClientes" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />

    <mAnular v-if="useModals.show.mAnular" />
</template>

<script>
import JdButton from '@/components/inputs/JdButton.vue'
import JdTable from '@/components/JdTable.vue'
import mAnular from '@/components/mAnular.vue'

import mConfigCols from '@/components/mConfigCols.vue'
import mConfigFiltros from '@/components/mConfigFiltros.vue'
import mPedidosClientes from './mPedidosClientes.vue'

import mSocioPedido from '@/views/logistica_entrada/pedidos/mSocioPedido.vue'
import mTransaccion from '@/views/logistica_entrada/compras/mTransaccion.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'
import { downloadExcel } from '@/utils/mine'

import dayjs from 'dayjs'

export default {
    components: {
        JdButton,
        JdTable,
        mAnular,

        mConfigCols,
        mConfigFiltros,
        mPedidosClientes,

        mSocioPedido,
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
                sort: false,
            },
            {
                id: 'codigo',
                title: 'Nro pedido',
                type: 'text',
                width: '12rem',
                show: true,
                seek: true,
                sort: false,

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
                sort: false,

            },
            {
                id: 'pago_condicion',
                title: 'Condición de pago',
                prop: 'pago_condicion1.nombre',
                type: 'select',
                width: '12rem',
                show: true,
                seek: false,
                sort: false,

            },
            {
                id: 'moneda',
                title: 'Moneda',
                prop: 'moneda1.nombre',
                type: 'select',
                width: '10rem',
                show: true,
                seek: false,
                sort: false,

            },
            {
                id: 'monto',
                title: 'Importe',
                type: 'number',
                format: 'decimal',
                toRight: true,
                width: '10rem',
                show: true,
                seek: false,
                sort: false,

            },
            {
                id: 'estado',
                title: 'Estado',
                prop: 'estado1.nombre',
                type: 'select',
                format: 'estado',
                width: '10rem',
                show: true,
                seek: false,
                sort: false,
            },
        ],
        tableRowOptions: [
            { id: 1, label: 'Ver', icon: 'fa-regular fa-folder-open', action: 'ver', permiso: 'vVentaPedidos_ver' },
            { id: 2, label: 'Editar', icon: 'fa-solid fa-pen-to-square', action: 'editar', permiso: 'vVentaPedidos_editar', ocultar: { estado: 0 } },
            { id: 3, label: 'Anular', icon: 'fa-solid fa-ban', action: 'anular', permiso: 'vVentaPedidos_anular', ocultar: { estado: 0 } },
            // { id: 4, label: 'Eliminar', icon: 'fa-solid fa-trash-can', action: 'eliminar' },
            { id: 5, label: 'Entregar mercadería', icon: 'fa-regular fa-circle-down', action: 'entregarMercaderia', permiso: 'vVentaPedidos_entregarMercaderia', ocultar: { estado: 0 } },
        ]
    }),
    computed: {
        tableRowOptionsFiltered() {
            let lista = this.tableRowOptions

            // if (item.estado == 0) {
            //     lista = lista.filter(a => a.id != 2 && a.id != 3 && a.id != 5)
            // }

            return lista
        }
    },
    async created() {
        this.vista = this.useVistas.vVentaPedidos
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        this.loadPedidos()
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
                tipo: 2,
                fecha: dayjs().format('YYYY-MM-DD'),
                estado: 1,
                socio_pedido_items: [],
            }

            this.useModals.setModal('mSocioPedido', 'Nuevo pedido de venta', 1, send)
        },
        recuperarGuardado() {
            this.useModals.setModal('mSocioPedido', 'Nuevo pedido de venta', 1, this.useAuth.avances.mVentaPedido)
        },
        verPedidos() {
            this.useModals.setModal('mPedidosClientes', 'Productos pedidos')
        },
        descargarPlantilla() {
            const columns = [{ title: 'EAN' }, { title: 'Nombre' }, { title: 'Cantidad' }, { title: 'Precio unitario' }]
            downloadExcel(columns, [], 'plantilla_pedidos.xlsx')
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()
            await this.loadSocios()
            await this.loadMonedas()

            const cols = this.columns
            cols.find(a => a.id == 'socio').lista = this.vista.socios
            cols.find(a => a.id == 'pago_condicion').lista = this.vista.pago_condiciones
            cols.find(a => a.id == 'moneda').lista = this.vista.monedas
            cols.find(a => a.id == 'estado').lista = this.vista.pedido_estados

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadPedidos
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async ver(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socio_pedidos}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mSocioPedido', 'Ver pedido de venta', 3, res.data)
            this.useModals.mSocioPedido.socio = { ...res.data.socio1 }
            this.useModals.mSocioPedido.socios = [{ ...res.data.socio1 }]
            this.useModals.mSocioPedido.monedas = [{ ...res.data.moneda1 }]
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socio_pedidos}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mSocioPedido', 'Editar pedido de venta', 2, res.data)
            this.useModals.mSocioPedido.socio = { ...res.data.socio1 }
            this.useModals.mSocioPedido.socios = [{ ...res.data.socio1 }]
            this.useModals.mSocioPedido.monedas = [{ ...res.data.moneda1 }]
        },
        anular(item) {
            const send = {
                url: 'socio_pedidos',
                item,
                vista: 'vVentaPedidos',
                array: 'pedidos',
            }

            this.useModals.setModal('mAnular', `Anular pedido Nro ${item.codigo}`, null, send, true)
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
        async entregarMercaderia(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socio_pedidos}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

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
                socio_pedido_items: res.data.socio_pedido_items,
                pedido: {
                    id: res.data.id,
                    codigo: res.data.codigo,
                },
                pedidos: [{
                    id: res.data.id,
                    codigo: res.data.codigo,
                }]
            }

            this.useModals.setModal('mTransaccion', 'Nueva venta', 1, send, true)
        },

        async loadSocios() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: 2 }, activo: { op: 'Es', val: true } },
                cols: ['nombres', 'apellidos', 'nombres_apellidos']
            }

            this.vista.socios = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.vista.socios = res.data
        },
        async loadMonedas() {
            const qry = {
                fltr: {},
                cols: ['id', 'nombre', 'simbolo'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.monedas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.monedas = res.data
        },
        async loadDatosSistema() {
            const qry = ['monedas', 'pedido_estados', 'pago_condiciones']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>