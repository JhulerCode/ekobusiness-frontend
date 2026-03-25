<template>
    <VistaLayout :config="VIEW_CONFIG" :setQuery="setQuery" @runMethod="runMethod"> </VistaLayout>

    <mDocumento v-if="modals.show.mDocumento" />
</template>

<script>
import mDocumento from '@/views/operaciones/documentos/mDocumento.vue'

import VIEW_CONFIG from './registros_sanitarios.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { get } from '@/utils/crud'

export default {
    name: 'vRegistrosSanitarios',
    components: {
        mDocumento,
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
                fltr: { tipo: { op: 'Es', val: 2 } },
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        // --- Header actions ---
        nuevo() {
            const send = { documento: { tipo: 2 } }
            this.modals.setModal('mDocumento', 'Nuevo registro sanitario', 1, send, true)
        },

        //--- Row actions ---//
        async editar(item) {
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            const send = {
                documento: res.data,
            }

            this.modals.setModal('mDocumento', 'Editar registro sanitario', 2, send, true)
        },
        verFile(item) {
            console.log('Ver file:', item)
        },
    },
}
</script>
