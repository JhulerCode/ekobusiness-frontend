<template>
    <VistaLayout :config="VIEW_CONFIG" :setQuery="setQuery" @runMethod="runMethod"> </VistaLayout>
</template>

<script>
import VIEW_CONFIG from './Empresas.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

export default {
    name: 'vAdminEmpresas',
    components: {},
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
                incl: [],
                ordr: [['razon_social', 'ASC']],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        //--- Header actions ---//
        nuevo() {
            this.$router.push({
                name: this.vista.detailViewName,
                params: { [this.vista.detailPath]: 'nuevo' },
            })
        },
    },
}
</script>
