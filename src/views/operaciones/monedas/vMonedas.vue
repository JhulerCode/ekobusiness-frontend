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
    <mMoneda v-if="modals.show.mMoneda" />
    <mTipoCambios v-if="modals.show.mTipoCambios" />
</template>

<script>
// Modales específicos
import mMoneda from './mMoneda.vue'
import mTipoCambios from './mTipoCambios.vue'

// Configuración de la vista
import VIEW_CONFIG from './monedas.config.js'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'

export default {
    name: 'vMonedas',
    components: {
        mMoneda,
        mTipoCambios,
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
        setQuery() {
            this.vista.qry = {
                fltr: {},
                ordr: [['nombre', 'ASC']],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
            this.vista.qry.cols.push('estandar')
        },

        // Header actions
        nuevo() {
            const send = { moneda: { estandar: false } }
            this.modals.setModal('mMoneda', 'Nueva moneda', 1, send, true)
        },

        // Table row actions
        async editar(item) {
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            const send = {
                moneda: res.data,
            }
            this.modals.setModal('mMoneda', 'Editar moneda', 2, send, true)
        },
        async openTiposCambio(item) {
            const send = {
                moneda: {
                    id: item.id,
                    nombre: item.nombre,
                },
            }
            this.modals.setModal('mTipoCambios', 'Tipos de cambio', null, send, true)
        },
    },
}
</script>
