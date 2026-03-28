<template>
    <VistaLayout :config="VIEW_CONFIG" :setQuery="setQuery" @runMethod="runMethod"> </VistaLayout>

    <mHelpdeskTicket v-if="modals?.show?.mHelpdeskTicket" />
</template>

<script>
import mHelpdeskTicket from './mHelpdeskTicket.vue'

import VIEW_CONFIG from './helpdesk_tickets.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { get } from '@/utils/crud'

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
            return this.vistas[this.$route.name]
        },
    },
    data: () => ({
        VIEW_CONFIG,
    }),
    methods: {
        runMethod(method, item) {
            this[method](item)
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
