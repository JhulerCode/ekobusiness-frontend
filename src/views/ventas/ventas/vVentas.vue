<template>
    <VistaLayout :vista="vista">
        <JdTable
            :name="vista.name"
            :columns="vista.tableColumns"
            :datos="vista.tableData"
            :colAct="true"
            :rowOptions="vista.tableRowActions"
            @rowOptionSelected="vista.runMethod"
        />
    </VistaLayout>

    <!-- Modales -->
    <mTransaccion v-if="modals.show.mTransaccion" />
    <mFormato v-if="modals.show.mFormato" @created="setTransaccionDespachoRevisado" />
</template>

<script>
// Componentes base y utilidades
import VistaLayout from '@/components/VistaLayout/VistaLayout.vue'
import JdTable from '@/components/JdTable/JdTable.vue'

// Modales específicos
import mTransaccion from '@/views/compras/compras/mTransaccion.vue'
import mFormato from '@/views/calidad/formatos/mFormato.vue'

// Configuración de la vista
import VIEW_CONFIG from './ventas.config.js'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'
import dayjs from 'dayjs'

export default {
    name: 'vVentas',
    components: {
        VistaLayout,
        JdTable,
        mTransaccion,
        mFormato,
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
            if (!this.vista.tableColumns[0].val) {
                this.vista.tableColumns[0].op = 'Está dentro de'
                this.vista.tableColumns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
                this.vista.tableColumns[0].val1 = dayjs().format('YYYY-MM-DD')
            }
        },
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 5 } },
                incl: ['socio1', 'moneda1', 'socio_pedido1'],
                page: this.vista.table_page,
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
            this.vista.qry.cols.push('tipo', 'calidad_revisado_despacho')
        },

        // --- Acciones de Registro ---
        nuevo() {
            const send = {
                transaccion: {
                    tipo: 5,
                    fecha: dayjs().format('YYYY-MM-DD'),
                    estado: 1,
                    transaccion_items: [],
                },
            }
            this.modals.setModal('mTransaccion', 'Nueva venta', 1, send, true)
        },
        async recuperarGuardado() {
            const send = { transaccion: this.auth.avances.mVenta }
            if (this.auth.avances.mVenta.socio_pedido) {
                this.auth.setLoading(true, 'Cargando...')
                const res = await get(`${urls.socio_pedidos}/uno/${this.auth.avances.mVenta.socio_pedido}`)
                this.auth.setLoading(false)
                if (res.code != 0) return
                send.socio_pedido_items = res.data.socio_pedido_items
                send.pedidos = [{ id: res.data.id, codigo: res.data.codigo }]
            }
            this.modals.setModal('mTransaccion', 'Nueva venta', 1, send, true)
        },
        async ver(item) {
            const qry = { incl: ['socio1', 'moneda1', 'socio_pedido1'] }
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            const qry2 = {
                incl: ['articulo1', 'kardexes'],
                iccl: {
                    kardexes: {
                        cols: ['cantidad', 'fv', 'lote', 'stock', 'lote_fv_stock'],
                        incl: ['lote_padre1'],
                    },
                },
                cols: { exclude: [] },
                fltr: { transaccion: { op: 'Es', val: item.id } },
                ordr: [['orden', 'ASC']],
            }
            this.auth.setLoading(true, 'Cargando...')
            const res2 = await get(`${urls.transaccion_items}?qry=${JSON.stringify(qry2)}`)
            this.auth.setLoading(false)
            if (res2.code != 0) return

            res.data.transaccion_items = res2.data
            const send = {
                transaccion: res.data,
                socio: { ...res.data.socio1 },
                socios: [{ ...res.data.socio1 }],
                monedas: [{ ...res.data.moneda1 }],
                pedidos: res.data.socio_pedido ? [{ ...res.data.socio_pedido1 }] : [],
            }
            this.modals.setModal('mTransaccion', 'Ver venta', 3, send, true)
        },
        async editar(item) {
            const qry = { incl: ['socio1', 'moneda1', 'socio_pedido1'] }
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            const qry2 = {
                incl: ['articulo1', 'kardexes'],
                iccl: {
                    kardexes: {
                        cols: ['cantidad', 'fv', 'lote', 'stock', 'lote_fv_stock'],
                        incl: ['lote_padre1'],
                    },
                },
                cols: { exclude: [] },
                fltr: { transaccion: { op: 'Es', val: item.id } },
                ordr: [['orden', 'ASC']],
            }
            this.auth.setLoading(true, 'Cargando...')
            const res2 = await get(`${urls.transaccion_items}?qry=${JSON.stringify(qry2)}`)
            this.auth.setLoading(false)
            if (res2.code != 0) return

            res.data.transaccion_items = res2.data
            const send = {
                transaccion: res.data,
                socio: { ...res.data.socio1 },
                socios: [{ ...res.data.socio1 }],
                monedas: [{ ...res.data.moneda1 }],
                pedidos: res.data.socio_pedido ? [{ ...res.data.socio_pedido1 }] : [],
            }
            this.modals.setModal('mTransaccion', 'Editar venta', 2, send, true)
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
