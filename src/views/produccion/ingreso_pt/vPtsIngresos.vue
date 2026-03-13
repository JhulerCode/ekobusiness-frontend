<template>
    <VistaLayout :vista="vista">
        <JdTable
            :name="vista.name"
            :columns="vista.tableColumns"
            :datos="vista.tableData || []"
            :rowOptions="vista.tableRowActions"
            @rowOptionSelected="vista.runMethod"
        />
    </VistaLayout>

    <!-- Modales -->
    <mProductosCuarentena v-if="modals.show.mProductosCuarentena" @liberado="liberarLote" />
    <mProduccionTrazabilidad v-if="modals.show.mProduccionTrazabilidad" />
</template>

<script>
// Modales específicos
import mProductosCuarentena from '@/views/produccion/ingreso_pt/mProductosCuarentena.vue'
import mProduccionTrazabilidad from '@/views/produccion/historial/mProduccionTrazabilidad.vue'

// Configuración de la vista
import VIEW_CONFIG from './pts_ingresos.config.js'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'
import dayjs from 'dayjs'
import { jmsg } from '@/utils/swal'

export default {
    name: 'vPtsIngresos',
    components: {
        mProductosCuarentena,
        mProduccionTrazabilidad,
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
                fltr: { tipo: { op: 'Es', val: 4 } },
                incl: ['articulo1', 'produccion_orden1', 'maquina1'],
                ordr: [
                    ['fecha', 'DESC'],
                    ['createdAt', 'DESC'],
                ],
                iccl: {
                    produccion_orden1: { incl: ['linea1'] },
                },
                page: this.vista.table_page,
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
            this.vista.qry.cols.push('produccion_orden')
        },

        // --- Header actions ---
        async verCuarentena() {
            const send = {
                transaccion: {},
            }
            this.modals.setModal('mProductosCuarentena', `Cuarentena`, null, send, true)
        },

        // --- Table row actions ---
        async verTrazabilidad(item) {
            console.log('ASD')
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.produccion_ordenes}/uno/${item.produccion_orden}`)
            this.auth.setLoading(false)

            if (res.code != 0) return
            if (res.data == null) return jmsg('warning', 'La órden de producción no existe')

            const send = {
                produccion_orden: res.data,
                articulos: [{ id: res.data.articulo, ...res.data.articulo1 }],
                maquinas: [{ id: res.data.maquina, ...res.data.maquina1 }],
            }
            this.modals.setModal('mProduccionTrazabilidad', 'Trazabilidad', null, send, true)
        },
    },
}
</script>
