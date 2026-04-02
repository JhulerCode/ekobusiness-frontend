<template>
    <VistaLayout
        :key="$route.fullPath"
        :config="VIEW_CONFIG"
        :setQuery="setQuery"
        @runMethod="runMethod"
    >
    </VistaLayout>
</template>

<script>
import VIEW_CONFIG from './comprobantes.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

export default {
    components: {},
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
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
                fltr: { es_interno: { op: 'Es', val: false } },
                incl: ['socio1', 'createdBy1'],
                ordr: [['fecha_emision', 'DESC']],
                page: this.vista.table_page,
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },
        nuevo() {
            this.$router.push({
                name: this.vista.detailViewName,
                params: { [this.vista.detailPath]: 'nuevo' },
            })
        },
    },
}
</script>
