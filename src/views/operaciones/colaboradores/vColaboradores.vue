<template>
    <VistaLayout :config="VIEW_CONFIG" :setQuery="setQuery" @runMethod="runMethod"> </VistaLayout>

    <mColaborador v-if="modals.show.mColaborador" />
</template>

<script>
import mColaborador from './mColaborador.vue'

import VIEW_CONFIG from './colaboradores.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { get } from '@/utils/crud'

export default {
    name: 'vColaboradores',
    components: {
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
                ordr: [['nombres', 'ASC']],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        // --- Header actions ---
        nuevo() {
            const send = {
                colaborador: { activo: true, has_signin: false },
            }
            this.modals.setModal('mColaborador', 'Nuevo colaborador', 1, send, true)
        },

        // --- Table row actions ---
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
