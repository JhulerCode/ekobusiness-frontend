<template>
    <VistaLayout :vista="vista">
        <JdTable
            :name="vista.name"
            :columns="vista.tableColumns"
            :datos="vista.tableData || []"
            :colAct="true"
            :rowOptions="vista.tableRowActions"
            @rowOptionSelected="vista.runMethod"
        />
    </VistaLayout>

    <!-- Modales -->
    <mMrpBom v-if="modals.show.mMrpBom" />
</template>

<script>
// Componentes base y utilidades
import VistaLayout from '@/components/VistaLayout/VistaLayout.vue'
import JdTable from '@/components/JdTable/JdTable.vue'

// Modales específicos
import mMrpBom from '@/views/produccion/mrp_bom/mMrpBom.vue'

// Configuración de la vista
import VIEW_CONFIG from './mrp_bom.config.js'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'

export default {
    name: 'vMrpBom',
    components: {
        VistaLayout,
        JdTable,
        mMrpBom,
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
                incl: ['articulo1'],
                ordr: [['articulo1', 'nombre', 'ASC']],
                page: this.vista.table_page,
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
            this.vista.qry.cols.push('tipo1')
        },

        // --- Acciones de Registro ---
        nuevo() {
            const send = { mrp_bom: { mrp_bom_lines: [], mrp_bom_socios: [] } }
            this.modals.setModal('mMrpBom', 'Nueva receta de producción', 1, send, true)
        },
        async ver(item) {
            const qry = {
                incl: ['articulo1'],
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            const send = {
                mrp_bom: res.data,
                articulos_fabricables: [{ ...res.data.articulo1 }],
            }
            this.modals.setModal('mMrpBom', 'Ver receta de producción', 3, send, true)
        },
        async editar(item) {
            const qry = {
                incl: ['articulo1'],
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            const send = {
                mrp_bom: res.data,
                articulos_fabricables: [{ ...res.data.articulo1 }],
            }
            this.modals.setModal('mMrpBom', 'Editar receta de producción', 2, send, true)
        },
    },
}
</script>
