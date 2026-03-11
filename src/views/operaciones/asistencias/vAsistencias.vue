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
    <mAsistencia v-if="modals.show.mAsistencia" />
</template>

<script>
// Componentes base y utilidades
import VistaLayout from '@/components/VistaLayout/VistaLayout.vue'
import JdTable from '@/components/JdTable/JdTable.vue'

// Modales específicos
import mAsistencia from './mAsistencia.vue'

// Configuración de la vista
import VIEW_CONFIG from './asistencias.config.js'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'

export default {
    name: 'vAsistencias',
    components: {
        VistaLayout,
        JdTable,
        mAsistencia,
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

        // 3. Carga inicial
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
                incl: ['colaborador1'],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        // Header actions
        async nuevo() {
            if (!this.vista.colaboradores) await this.loadColaboradores()
            const send = {
                asistencia: {},
                colaboradores: this.vista.colaboradores,
            }
            this.modals.setModal('mAsistencia', 'Nueva asistencia', 1, send, true)
        },

        // Table row actions
        async editar(item) {
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            if (!this.vista.colaboradores) await this.loadColaboradores()
            const send = {
                asistencia: res.data,
                colaboradores: this.vista.colaboradores,
            }
            this.modals.setModal('mAsistencia', 'Editar asistencia', 2, send, true)
        },

        // Auxiliares
        async loadColaboradores() {
            const qry = {
                fltr: {},
                cols: ['nombres'],
                ordr: [['nombres', 'ASC']],
            }
            this.auth.setLoading(true, 'Cargando colaboradores...')
            const res = await get(`${urls.colaboradores}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res.code != 0) return
            this.vista.colaboradores = res.data
        },
    },
}
</script>
