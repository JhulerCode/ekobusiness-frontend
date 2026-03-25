<template>
    <VistaLayout
        :config="VIEW_CONFIG"
        :setQuery="setQuery"
        :rowSelectable="true"
        @runMethod="runMethod"
    >
    </VistaLayout>

    <mSocio v-if="modals.show.mSocio" />
</template>

<script>
import mSocio from '@/views/compras/proveedores/mSocio.vue'

import VIEW_CONFIG from './proveedores.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { get } from '@/utils/crud'

export default {
    name: 'vProveedores',
    components: {
        mSocio,
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
                ordr: [['nombres', 'ASC']],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        // --- Header actions ---
        nuevo() {
            const item = {
                tipo: 1,
                doc_tipo: 6,
                direcciones: [],
                contactos: [],
                bancos: [],
                documentos: [],
                activo: true,
            }

            this.modals.setModal('mSocio', 'Nuevo proveedor', 1, item)
        },

        //--- Row actions ---//
        async ver(item) {
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}`)
            this.auth.setLoading(false)

            if (res.code != 0) return

            this.modals.setModal('mSocio', 'Ver proveedor', 3, res.data)
        },
        async editar(item) {
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}`)
            this.auth.setLoading(false)

            if (res.code != 0) return

            this.modals.setModal('mSocio', 'Editar proveedor', 2, res.data)
        },
    },
}
</script>
