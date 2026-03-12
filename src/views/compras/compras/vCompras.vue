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
</template>

<script>
// Componentes base y utilidades
import VistaLayout from '@/components/VistaLayout/VistaLayout.vue'
import JdTable from '@/components/JdTable/JdTable.vue'

// Modales específicos
import mTransaccion from '@/views/compras/compras/mTransaccion.vue'

// Configuración de la vista
import VIEW_CONFIG from './compras.config.js'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'
import dayjs from 'dayjs'

export default {
    name: 'vCompras',
    components: {
        VistaLayout,
        JdTable,
        mTransaccion,
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
        this.auth.setColumns(this.vista.name, this.vista.tableColumns)

        // 2. Carga inicial
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
            const i = this.vista.tableColumns.findIndex((a) => a.id == 'fecha')

            if (!this.vista.tableColumns[i].val) {
                this.vista.tableColumns[i].op = 'Está dentro de'
                this.vista.tableColumns[i].val = dayjs().startOf('month').format('YYYY-MM-DD')
                this.vista.tableColumns[i].val1 = dayjs().format('YYYY-MM-DD')
            }
        },
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 1 } },
                incl: ['socio1', 'moneda1', 'socio_pedido1'],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
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
            this.modals.setModal('mTransaccion', 'Nueva compra', 1, send, true)
        },
        async recuperarGuardado() {
            const send = { transaccion: this.auth.avances.mCompra }
            if (this.auth.avances.mCompra.socio_pedido) {
                this.auth.setLoading(true, 'Cargando...')
                const res = await get(
                    `${urls.socio_pedidos}/uno/${this.auth.avances.mCompra.socio_pedido}`,
                )
                this.auth.setLoading(false)
                if (res.code != 0) return
                send.socio_pedido_items = res.data.socio_pedido_items
                send.pedidos = [{ id: res.data.id, codigo: res.data.codigo }]
            }
            this.modals.setModal('mTransaccion', 'Nueva compra', 1, send, true)
        },
        async ver(item) {
            const qry = {
                incl: ['socio1', 'moneda1', 'socio_pedido1', 'transaccion_items'],
                iccl: { transaccion_items: { incl: ['articulo1'] } },
            }
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res.code != 0) return
            const send = {
                transaccion: res.data,
                socio: { ...res.data.socio1 },
                socios: [{ ...res.data.socio1 }],
                monedas: [{ ...res.data.moneda1 }],
                pedidos: res.data.socio_pedido ? [{ ...res.data.socio_pedido1 }] : [],
            }
            this.modals.setModal('mTransaccion', 'Ver compra', 3, send, true)
        },
        async editar(item) {
            const qry = {
                incl: ['socio1', 'moneda1', 'socio_pedido1', 'transaccion_items'],
                iccl: { transaccion_items: { incl: ['articulo1'] } },
            }
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res.code != 0) return
            const send = {
                transaccion: res.data,
                socio: { ...res.data.socio1 },
                socios: [{ ...res.data.socio1 }],
                monedas: [{ ...res.data.moneda1 }],
                pedidos: res.data.socio_pedido ? [{ ...res.data.socio_pedido1 }] : [],
            }
            this.modals.setModal('mTransaccion', 'Editar compra', 2, send, true)
        },
    },
}
</script>
