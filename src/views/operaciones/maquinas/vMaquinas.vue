<template>
    <VistaLayout :config="VIEW_CONFIG" :setQuery="setQuery" @runMethod="runMethod"> </VistaLayout>

    <mMaquina v-if="modals.show.mMaquina" />
</template>

<script>
import mMaquina from '@/views/operaciones/maquinas/mMaquina.vue'

import VIEW_CONFIG from './maquinas.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'

export default {
    name: 'vMaquinas',
    components: {
        mMaquina,
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
                fltr: { tipo: { op: 'Es', val: 1 } }, // Tipo 1 para Maquinas
                ordr: [['nombre', 'ASC']],
                incl: ['linea1'],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        // --- Header actions ---
        nuevo() {
            const send = { maquina: { tipo: 1 } }
            this.modals.setModal('mMaquina', 'Nueva máquina', 1, send, true)
        },

        //--- Row actions ---//
        async editar(item) {
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            const send = {
                maquina: res.data,
            }
            this.modals.setModal('mMaquina', 'Editar máquina', 2, send, true)
        },

        // Otros
        async loadLineas() {
            const qry = {
                fltr: {},
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
            }
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_lineas}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res.code != 0) return
            return res.data
        },
    },
}
</script>
