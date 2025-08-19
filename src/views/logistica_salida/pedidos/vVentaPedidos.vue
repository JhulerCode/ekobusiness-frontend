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
        mAnular,

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
                seek: true,
                sort: true,
            },
            {
                id: 'moneda',
                title: 'Moneda',
                prop: 'moneda1.nombre',
                type: 'select',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'monto',
                title: 'Importe',
                type: 'number',
                format: 'decimal',
                toRight: true,
                width: '10rem',
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
                ocultar: { estado: ['0', '2'] },
            },
            {
                label: 'Terminar',
                icon: 'fa-solid fa-check-double',
                action: 'terminar',
                permiso: 'vVentaPedidos:terminar',
                ocultar: { estado: ['0', '2'] },
            },
            // { label: 'Anular', icon: 'fa-solid fa-ban', action: 'anular', permiso: 'vVentaPedidos:anular', ocultar: { estado: ['0', '2'] } },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: 'vVentaPedidos:eliminar',
            },
            {
                label: 'Exportar en PDF',
                icon: 'fa-regular fa-file-pdf',
                action: 'generarPdf',
                permiso: 'vVentaPedidos:generarPdf',
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
            this.useModals.setModal(
                'mSocioPedido',
                'Nuevo pedido de venta',
                1,
                this.useAuth.avances.mVentaPedido,
            )
        },
        verPedidos() {
            this.useModals.setModal('mPedidosClientes', 'Productos pedidos')
        },
        descargarPlantilla() {
            const columns = [
                { title: 'EAN' },
                { title: 'Nombre' },
                { title: 'Cantidad' },
                { title: 'Precio unitario' },
            ]
            downloadExcel(columns, [], 'plantilla_pedidos.xlsx')
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()
            await this.loadSocios()
            await this.loadMonedas()

            const cols = this.columns
            cols.find((a) => a.id == 'socio').lista = this.vista.socios
            cols.find((a) => a.id == 'pago_condicion').lista = this.vista.pago_condiciones
            cols.find((a) => a.id == 'moneda').lista = this.vista.monedas
            cols.find((a) => a.id == 'estado').lista = this.vista.pedido_estados

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
        async terminar(item) {
            const resQst = await jqst('¿Está seguro de terminar el pedido?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await patch(`${urls.socio_pedidos}/terminar`, item, 'Pedido terminado')
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vVentaPedidos', 'pedidos', { ...item, estado: 2 })
        },
        anular(item) {
            const send = {
                url: 'socio_pedidos',
                item,
                vista: this.tableName,
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
        async generarPdf(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socio_pedidos}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                id: 'b46dcbd5-1aae-4c57-ac24-fe59aa828e59',
                tipo: 2,
                fecha: '2025-08-19',
                fecha_entrega: '2025-08-23',
                codigo: '1755617337892147',
                socio: '27be0bfd-7395-4970-a528-ca3dddb945de',
                socio_datos: {
                    nombres: 'SOLANA COMERCIAL S.A.C',
                    doc_numero: '20606109343',
                },
                contacto: '1752679990196507',
                contacto_datos: {
                    id: '1752679990196507',
                    cargo: 'COMERCIAL',
                    correo: 'brenda.duran@dollarcity.com',
                    nombre: 'BRENDA DURAN',
                    selected: false,
                    telefono: '503 7853 5704',
                    principal: true,
                },
                pago_condicion: '2',
                moneda: '1',
                tipo_cambio: null,
                monto: 21513.6,
                direccion_entrega:
                    'AV. CORONEL NESTOR GAMBETTA\nNRO. 3235 INT. 3271, 3492, 3499, 3497\nConstitucional del Callao Perú',
                observacion: null,
                estado: '1',
                anulado_motivo: null,
                empresa_datos: null,
                createdBy: 'b8e6028c-578e-4da7-8106-bc7636a4fbbc',
                updatedBy: 'b8e6028c-578e-4da7-8106-bc7636a4fbbc',
                createdAt: '2025-08-19T15:28:59.000Z',
                updatedAt: '2025-08-19T15:47:21.000Z',
                socio_pedido_items: [
                    {
                        id: '04d15b53-bbd7-43aa-8f13-d5bf5f68abbc',
                        articulo: '079abd48-0241-4fac-9a90-8c6be2fa5a23',
                        nombre: 'CURCUMA Y JENGIBRE 20 SOBRES SUNKA',
                        unidad: 'NIU',
                        has_fv: true,
                        cantidad: 720,
                        entregado: 0,
                        pu: 3,
                        igv_afectacion: '10',
                        igv_porcentaje: 18,
                        nota: null,
                        socio_pedido: 'b46dcbd5-1aae-4c57-ac24-fe59aa828e59',
                        createdAt: '2025-08-19T15:28:59.000Z',
                        updatedAt: '2025-08-19T15:47:22.000Z',
                        articulo1: {
                            nombre: 'CURCUMA Y JENGIBRE 20 SOBRES SUNKA',
                            unidad: 'NIU',
                            has_fv: true,
                        },
                    },
                    {
                        id: '0966698b-7a62-4dc0-be1b-bca5f212369f',
                        articulo: '8d04068a-b9a8-4605-a6ec-b84279a056fc',
                        nombre: 'CURCUMA, ZANAHORIA Y NARANJA 20 SOBRES SUNKA',
                        unidad: 'NIU',
                        has_fv: true,
                        cantidad: 504,
                        entregado: 0,
                        pu: 3,
                        igv_afectacion: '10',
                        igv_porcentaje: 18,
                        nota: null,
                        socio_pedido: 'b46dcbd5-1aae-4c57-ac24-fe59aa828e59',
                        createdAt: '2025-08-19T15:28:59.000Z',
                        updatedAt: '2025-08-19T15:47:23.000Z',
                        articulo1: {
                            nombre: 'CURCUMA, ZANAHORIA Y NARANJA 20 SOBRES SUNKA',
                            unidad: 'NIU',
                            has_fv: true,
                        },
                    },
                    {
                        id: '14e65626-e0c2-47dc-a87a-07d24c6572a3',
                        articulo: '3baf320d-3389-4778-bb72-9dcd44bfb8ae',
                        nombre: 'TE VERDE 20 SOBRES SUNKA',
                        unidad: 'NIU',
                        has_fv: true,
                        cantidad: 1368,
                        entregado: 0,
                        pu: 3.8,
                        igv_afectacion: '10',
                        igv_porcentaje: 18,
                        nota: null,
                        socio_pedido: 'b46dcbd5-1aae-4c57-ac24-fe59aa828e59',
                        createdAt: '2025-08-19T15:28:59.000Z',
                        updatedAt: '2025-08-19T15:47:23.000Z',
                        articulo1: {
                            nombre: 'TE VERDE 20 SOBRES SUNKA',
                            unidad: 'NIU',
                            has_fv: true,
                        },
                    },
                    {
                        id: '2a810287-3729-4419-8bfd-8f3bc512a667',
                        articulo: 'fa6bc463-da80-4bab-ba34-7a024e25d2af',
                        nombre: 'SUEÑO PROFUNDO 20 SOBRES SUNKA',
                        unidad: 'NIU',
                        has_fv: true,
                        cantidad: 756,
                        entregado: 0,
                        pu: 2.2,
                        igv_afectacion: '10',
                        igv_porcentaje: 18,
                        nota: null,
                        socio_pedido: 'b46dcbd5-1aae-4c57-ac24-fe59aa828e59',
                        createdAt: '2025-08-19T15:28:59.000Z',
                        updatedAt: '2025-08-19T15:47:23.000Z',
                        articulo1: {
                            nombre: 'SUEÑO PROFUNDO 20 SOBRES SUNKA',
                            unidad: 'NIU',
                            has_fv: true,
                        },
                    },
                    {
                        id: '438c2a7b-1433-439b-9b4c-51e6b6236d4d',
                        articulo: '521639ea-ff0e-431d-b084-b61c1dd435f8',
                        nombre: 'JENGIBRE Y NARANJA 20 SOBRES SUNKA',
                        unidad: 'NIU',
                        has_fv: true,
                        cantidad: 288,
                        entregado: 0,
                        pu: 2.5,
                        igv_afectacion: '10',
                        igv_porcentaje: 18,
                        nota: null,
                        socio_pedido: 'b46dcbd5-1aae-4c57-ac24-fe59aa828e59',
                        createdAt: '2025-08-19T15:28:59.000Z',
                        updatedAt: '2025-08-19T15:47:23.000Z',
                        articulo1: {
                            nombre: 'JENGIBRE Y NARANJA 20 SOBRES SUNKA',
                            unidad: 'NIU',
                            has_fv: true,
                        },
                    },
                    {
                        id: '4b09ae55-c66e-4aed-abcb-456ff5bbca1f',
                        articulo: '866333af-b1c3-4ef1-9d32-8248e99146b6',
                        nombre: 'JENGIBRE Y MENTA 20 SOBRES SUNKA',
                        unidad: 'NIU',
                        has_fv: true,
                        cantidad: 504,
                        entregado: 0,
                        pu: 2.5,
                        igv_afectacion: '10',
                        igv_porcentaje: 18,
                        nota: null,
                        socio_pedido: 'b46dcbd5-1aae-4c57-ac24-fe59aa828e59',
                        createdAt: '2025-08-19T15:28:59.000Z',
                        updatedAt: '2025-08-19T15:47:23.000Z',
                        articulo1: {
                            nombre: 'JENGIBRE Y MENTA 20 SOBRES SUNKA',
                            unidad: 'NIU',
                            has_fv: true,
                        },
                    },
                    {
                        id: '636162fe-5cec-48fb-a105-3a61ab9b8dc0',
                        articulo: 'd51c8eef-d443-47de-bb0c-15473f78d6b5',
                        nombre: 'MORINGA 20 SOBRES SUNKA',
                        unidad: 'NIU',
                        has_fv: true,
                        cantidad: 720,
                        entregado: 0,
                        pu: 2.5,
                        igv_afectacion: '10',
                        igv_porcentaje: 18,
                        nota: null,
                        socio_pedido: 'b46dcbd5-1aae-4c57-ac24-fe59aa828e59',
                        createdAt: '2025-08-19T15:28:59.000Z',
                        updatedAt: '2025-08-19T15:47:24.000Z',
                        articulo1: {
                            nombre: 'MORINGA 20 SOBRES SUNKA',
                            unidad: 'NIU',
                            has_fv: true,
                        },
                    },
                    {
                        id: '754c0672-e8d3-43c5-ac20-7711e505288a',
                        articulo: '182ed6a1-38e7-48e3-ac41-78a82d97bf47',
                        nombre: 'CURCUMA, CANELA Y CLAVO 20 SOBRES SUNKA',
                        unidad: 'NIU',
                        has_fv: true,
                        cantidad: 720,
                        entregado: 0,
                        pu: 3,
                        igv_afectacion: '10',
                        igv_porcentaje: 18,
                        nota: null,
                        socio_pedido: 'b46dcbd5-1aae-4c57-ac24-fe59aa828e59',
                        createdAt: '2025-08-19T15:28:59.000Z',
                        updatedAt: '2025-08-19T15:47:24.000Z',
                        articulo1: {
                            nombre: 'CURCUMA, CANELA Y CLAVO 20 SOBRES SUNKA',
                            unidad: 'NIU',
                            has_fv: true,
                        },
                    },
                    {
                        id: 'd6903828-0e11-47f6-b03e-89913e01d1de',
                        articulo: 'c883017e-d97f-4fad-9571-500ee4034f68',
                        nombre: 'MUÑA 20 SOBRES SUNKA',
                        unidad: 'NIU',
                        has_fv: true,
                        cantidad: 1152,
                        entregado: 0,
                        pu: 2.5,
                        igv_afectacion: '10',
                        igv_porcentaje: 18,
                        nota: null,
                        socio_pedido: 'b46dcbd5-1aae-4c57-ac24-fe59aa828e59',
                        createdAt: '2025-08-19T15:28:59.000Z',
                        updatedAt: '2025-08-19T15:47:24.000Z',
                        articulo1: {
                            nombre: 'MUÑA 20 SOBRES SUNKA',
                            unidad: 'NIU',
                            has_fv: true,
                        },
                    },
                    {
                        id: 'd9d8a8ff-db19-49d8-ac43-6a5f290cf4ab',
                        articulo: '6c760f4f-755a-4233-b233-62e8025f2eac',
                        nombre: 'JAMAICA 20 SOBRES SUNKA',
                        unidad: 'NIU',
                        has_fv: true,
                        cantidad: 864,
                        entregado: 0,
                        pu: 2.5,
                        igv_afectacion: '10',
                        igv_porcentaje: 18,
                        nota: null,
                        socio_pedido: 'b46dcbd5-1aae-4c57-ac24-fe59aa828e59',
                        createdAt: '2025-08-19T15:28:59.000Z',
                        updatedAt: '2025-08-19T15:47:25.000Z',
                        articulo1: {
                            nombre: 'JAMAICA 20 SOBRES SUNKA',
                            unidad: 'NIU',
                            has_fv: true,
                        },
                    },
                ],
                socio1: {
                    nombres_apellidos: 'SOLANA COMERCIAL S.A.C',
                    id: '27be0bfd-7395-4970-a528-ca3dddb945de',
                    nombres: 'SOLANA COMERCIAL S.A.C',
                    apellidos: null,
                    doc_numero: '20606109343',
                    contactos: [
                        {
                            id: '1752679990196507',
                            cargo: 'COMERCIAL',
                            correo: 'brenda.duran@dollarcity.com',
                            nombre: 'BRENDA DURAN',
                            selected: false,
                            telefono: '503 7853 5704',
                            principal: true,
                        },
                    ],
                    direcciones: [
                        {
                            id: '1752679984581287',
                            nombre: 'RANSA',
                            selected: false,
                            direccion:
                                'AV. CORONEL NESTOR GAMBETTA\nNRO. 3235 INT. 3271, 3492, 3499, 3497\nConstitucional del Callao Perú',
                            principal: true,
                        },
                    ],
                    precio_lista: null,
                    precio_lista1: null,
                },
                moneda1: {
                    id: '1',
                    nombre: 'SOL',
                    simbolo: 'S/',
                },
                createdBy1: {
                    nombres: 'JHULER',
                    apellidos: 'AGUIRRE',
                    telefono: null,
                    cargo: 'DEVELOPER',
                },
            }

            this.useModals.setModal('mSocioPedidoPdf', 'Orden de compra', null, send)
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
