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
    <mColaborador v-if="modals.show.mColaborador" />
</template>

<script>
// Componentes base y utilidades
import VistaLayout from '@/components/VistaLayout/VistaLayout.vue'
import JdTable from '@/components/JdTable/JdTable.vue'

// Modales específicos
import mColaborador from './mColaborador.vue'

// Configuración de la vista
import VIEW_CONFIG from './colaboradores.config.js'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'

export default {
    name: 'vColaboradores',
    components: {
        VistaLayout,
        JdTable,
        mColaborador,
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
                ordr: [['nombres', 'ASC']],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        // Header actions
        nuevo() {
            const send = {
                colaborador: { activo: true, has_signin: false },
            }
            this.modals.setModal('mColaborador', 'Nuevo colaborador', 1, send, true)
        },

        // Table row actions
        async ver(item) {
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            const send = {
                colaborador: res.data,
            }
            this.modals.setModal('mColaborador', 'Ver colaborador', 3, send, true)
        },
        async editar(item) {
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            const send = {
                colaborador: res.data,
            }
            this.modals.setModal('mColaborador', 'Editar colaborador', 2, send, true)
        },
    },
}
</script>
