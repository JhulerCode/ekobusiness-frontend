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
        async setQuery() {
            this.vista.qry = {
                fltr: { es_interno: { op: 'Es', val: true } },
                incl: ['socio1', 'createdBy1'],
                ordr: [['fecha_emision', 'DESC']],
                page: this.vista.table_page,
            }

            const traslado_id = this.$route.params.traslado_id
            if (traslado_id) {
                this.vista.qry.fltr.traslado_id = { op: 'Es', val: traslado_id }
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },
        // nuevo() {
        //     this.$router.push({
        //         name: this.vista.detailViewName,
        //         params: { [this.vista.detailPath]: 'nuevo' },
        //     })
        // },

        //--- auxiliar data ---//
    },
}
</script>
