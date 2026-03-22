<template>
    <VistaLayout :config="VIEW_CONFIG" :setQuery="setQuery" @runMethod="runMethod"> </VistaLayout>

    <mAsistencia v-if="modals.show.mAsistencia" />
</template>

<script>
import mAsistencia from './mAsistencia.vue'

import VIEW_CONFIG from './asistencias.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'

export default {
    name: 'vAsistencias',
    components: {
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
                incl: ['colaborador1'],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        // --- Header actions ---
        async nuevo() {
            if (!this.vista.colaboradores) await this.loadColaboradores()
            const send = {
                asistencia: {},
                colaboradores: this.vista.colaboradores,
            }
            this.modals.setModal('mAsistencia', 'Nueva asistencia', 1, send, true)
        },

        // --- Table row actions ---
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
