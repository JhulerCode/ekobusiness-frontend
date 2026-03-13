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
    <mHelpdeskTicket v-if="modals.show.mHelpdeskTicket" />
</template>

<script>
// Modales específicos
import mHelpdeskTicket from './mHelpdeskTicket.vue'

// Configuración de la vista
import VIEW_CONFIG from './helpdesk_tickets.config.js'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'

export default {
    name: 'vHelpdeskTickets',
    components: {
        mHelpdeskTicket,
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
                incl: ['socio1', 'articulo1', 'createdBy1'],
                page: this.vista.table_page,
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        // --- Acciones de Registro ---
        nuevo() {
            const send = { helpdesk_ticket: { estado: 1 } }
            this.modals.setModal('mHelpdeskTicket', 'Nuevo ticket', 1, send, true)
        },
        async editar(item) {
            const qry = { incl: ['socio1', 'articulo1'] }
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            const send = {
                helpdesk_ticket: res.data,
                clientes: [{ ...res.data.socio1 }],
                productos: [{ ...res.data.articulo1 }],
            }
            this.modals.setModal('mHelpdeskTicket', 'Editar ticket', 2, send, true)
        },
    },
}
</script>
