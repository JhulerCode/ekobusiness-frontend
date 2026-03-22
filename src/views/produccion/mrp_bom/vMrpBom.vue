<template>
    <VistaLayout :config="VIEW_CONFIG" :setQuery="setQuery" @runMethod="runMethod"> </VistaLayout>

    <mMrpBom v-if="modals.show.mMrpBom" />
</template>

<script>
import mMrpBom from '@/views/produccion/mrp_bom/mMrpBom.vue'

import VIEW_CONFIG from './mrp_bom.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { get } from '@/utils/crud'

export default {
    name: 'vMrpBom',
    components: {
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
