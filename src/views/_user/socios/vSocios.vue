<template>
    <VistaLayout
        :key="$route.fullPath"
        :config="VIEW_CONFIG"
        :setQuery="setQuery"
        :rowSelectable="true"
        @runMethod="runMethod"
    >
    </VistaLayout>

    <mSocio v-if="modals.show.mSocio" />
</template>

<script>
import mSocio from './mSocio.vue'

import VIEW_CONFIG from './socios.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { get } from '@/utils/crud'

export default {
    name: 'vSocios',
    components: {
        mSocio,
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
                ordr: [['nombres', 'ASC']],
                page: this.vista.table_page,
            }

            if (this.$route.path.includes('compras')) {
                this.vista.qry.fltr.tipo = { op: 'Es', val: 1 }
            }
            if (this.$route.path.includes('ventas')) {
                this.vista.qry.fltr.tipo = { op: 'Es', val: 2 }
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        //--- Header actions ---//
        nuevo() {
            const tipo = this.$route.path.includes('compras') ? 1 : 2

            const item = {
                tipo,
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
