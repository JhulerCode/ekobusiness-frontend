<template>
    <VistaLayout :config="VIEW_CONFIG" :setQuery="setQuery" @runMethod="runMethod"> </VistaLayout>

    <mDocumento v-if="modals.show.mDocumento" />
    <mPdfViewer v-if="modals.show.mPdfViewer" />
</template>

<script>
import mDocumento from './mDocumento.vue'

import VIEW_CONFIG from './documentos.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { get } from '@/utils/crud'

export default {
    name: 'vDocumentos',
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
                fltr: { tipo: { op: 'Es', val: 1 } },
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
            this.vista.qry.cols.push('file')
        },

        // --- Header actions ---
        nuevo() {
            const send = { documento: { tipo: 1 } }
            this.modals.setModal('mDocumento', 'Nuevo documento', 1, send, true)
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
            this.modals.setModal('mDocumento', 'Editar documento', 2, send, true)
        },
        verFile(item) {
            this.modals.setModal('mPdfViewer', 'Pdf', null, item.file?.url)
        },
    },
}
</script>
