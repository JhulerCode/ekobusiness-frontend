<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left">
                <strong>Compras</strong>

                <JdButton
                    text="Recuperar"
                    tipo="2"
                    title="Recuperar guardado"
                    @click="recuperarGuardado"
                    v-if="useAuth.avances.mCompra && useAuth.verifyPermiso('vCompras:crear')"
                />

                <JdButton
                    text="Nuevo"
                    title="Crear nuevo"
                    @click="nuevo"
                    v-if="useAuth.verifyPermiso('vCompras:crear')"
                />
            </div>

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="tableColumns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadTransacciones"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadTransacciones" />

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
            :columns="tableColumns"
            :datos="vista.transacciones || []"
            :colAct="true"
            :rowOptions="tableRowActions"
            @rowOptionSelected="runMethod"
            ref="jdtable"
            :reload="loadTransacciones"
        />
    </div>

    <!-- Modales -->
    <mTransaccion v-if="useModals.show.mTransaccion" />
    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
    <mAnular v-if="useModals.show.mAnular" />
</template>

<script>
// Componentes base y utilidades
import { JdButton, mConfigFiltros, mConfigCols, mAnular } from '@jhuler/components'
import JdBuscador from '@/components/JdBuscador.vue'
import JdTable from '@/components/JdTable/JdTable.vue'
import JdPaginacion from '@/components/JdPaginacion.vue'

// Configuración de la vista
import { TABLE_COLUMNS, TABLE_ROW_ACTIONS } from './compras.config'

// Modales específicos
import mTransaccion from '@/views/logistica_entrada/compras/mTransaccion.vue'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'
import dayjs from 'dayjs'

export default {
    name: 'vCompras',
    components: {
        JdButton,
        JdBuscador,
        JdTable,
        JdPaginacion,
        mConfigCols,
        mConfigFiltros,
        mAnular,
        mTransaccion,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},
        tableName: 'vCompras',

        tableColumns: JSON.parse(JSON.stringify(TABLE_COLUMNS)),
        tableRowActions: TABLE_ROW_ACTIONS,
    }),
    async created() {
        this.vista = this.useVistas.vCompras
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.tableColumns)

        if (this.vista.loaded) return
        this.vista.table_page = 1
        if (this.useAuth.verifyPermiso('vCompras:listar')) this.loadTransacciones()
    },
    methods: {
        // --- Gestión de Tabla ---
        runMethod(method, item) {
            this[method](item)
        },

        // --- Carga de Datos ---
        initFiltros() {
            if (!this.tableColumns[0].val) {
                this.tableColumns[0].op = 'Está dentro de'
                this.tableColumns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
                this.tableColumns[0].val1 = dayjs().format('YYYY-MM-DD')
            }
        },
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 1 } },
                incl: ['socio1', 'moneda1', 'socio_pedido1'],
                page: this.vista.table_page,
            }
            this.useAuth.updateQuery(this.tableColumns, this.vista.qry)
        },
        async loadTransacciones() {
            this.setQuery()
            this.vista.transacciones = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true
            if (res.code != 0) return
            this.vista.transacciones = res.data
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
            const qry = ['monedas', 'transaccion_estados', 'pago_condiciones']
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            if (res.code == 0) Object.assign(this.vista, res.data)
        },

        // --- Acciones de Registro ---
        nuevo() {
            const send = {
                transaccion: {
                    tipo: 1,
                    fecha: dayjs().format('YYYY-MM-DD'),
                    estado: 1,
                    transaccion_items: [],
                },
            }
            this.useModals.setModal('mTransaccion', 'Nueva compra', 1, send, true)
        },
        async recuperarGuardado() {
            const send = { transaccion: this.useAuth.avances.mCompra }
            if (this.useAuth.avances.mCompra.socio_pedido) {
                this.useAuth.setLoading(true, 'Cargando...')
                const res = await get(
                    `${urls.socio_pedidos}/uno/${this.useAuth.avances.mCompra.socio_pedido}`,
                )
                this.useAuth.setLoading(false)
                if (res.code != 0) return
                send.socio_pedido_items = res.data.socio_pedido_items
                send.pedidos = [{ id: res.data.id, codigo: res.data.codigo }]
            }
            this.useModals.setModal('mTransaccion', 'Nueva compra', 1, send, true)
        },
        async ver(item) {
            const qry = {
                incl: ['socio1', 'moneda1', 'socio_pedido1', 'transaccion_items'],
                iccl: { transaccion_items: { incl: ['articulo1'] } },
            }
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            if (res.code != 0) return
            const send = {
                transaccion: res.data,
                socio: { ...res.data.socio1 },
                socios: [{ ...res.data.socio1 }],
                monedas: [{ ...res.data.moneda1 }],
                pedidos: res.data.socio_pedido ? [{ ...res.data.socio_pedido1 }] : [],
            }
            this.useModals.setModal('mTransaccion', 'Ver compra', 3, send, true)
        },
        async editar(item) {
            const qry = {
                incl: ['socio1', 'moneda1', 'socio_pedido1', 'transaccion_items'],
                iccl: { transaccion_items: { incl: ['articulo1'] } },
            }
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            if (res.code != 0) return
            const send = {
                transaccion: res.data,
                socio: { ...res.data.socio1 },
                socios: [{ ...res.data.socio1 }],
                monedas: [{ ...res.data.moneda1 }],
                pedidos: res.data.socio_pedido ? [{ ...res.data.socio_pedido1 }] : [],
            }
            this.useModals.setModal('mTransaccion', 'Editar compra', 2, send, true)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return
            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.transacciones, item)
            this.useAuth.setLoading(false)
            if (res.code == 0) this.useVistas.removeItem('vCompras', 'transacciones', item)
        },

        // --- Otros ---
        async openConfigFiltros() {
            await this.loadDatosSistema()
            const cols = this.tableColumns
            for (const a of cols) {
                if (a.id == 'socio') a.reload = this.loadSocios
                if (a.id == 'pago_condicion') a.lista = this.vista.pago_condiciones
                if (a.id == 'moneda') a.reload = this.loadMonedas
                if (a.id == 'estado') a.lista = this.vista.transaccion_estados
            }
            const send = { table: this.tableName, cols, reload: this.loadTransacciones }
            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },
    },
}
</script>
