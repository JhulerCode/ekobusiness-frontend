<template>
    <VistaLayout
        :key="$route.fullPath"
        :config="VIEW_CONFIG"
        :checkFiltros="checkFiltros"
        :setQuery="setQuery"
    >
    </VistaLayout>
</template>

<script>
import VIEW_CONFIG from './kardex.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { jmsg } from '@/utils/swal'

export default {
    name: 'vKardex',
    data: () => ({
        VIEW_CONFIG,
        articulo_id: null,
    }),
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        modals: () => useModals(),
        vista() {
            return this.vistas[this.$route.name]
        },
    },
    created() {
        if (this.$route.params.articulo_id) {
            const colArticulo = this.VIEW_CONFIG.tableColumns.find((a) => a.id == 'articulo')
            if (colArticulo) {
                colArticulo.show = false
                colArticulo.seek = false
            }
        }
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        checkFiltros() {
            if (this.$route.params.articulo_id) return false

            if (!this.vista.tableColumns.some((a) => a.val || a.val1)) {
                jmsg('error', 'Ingrese al menos un filtro')
                return true
            }
            return false
        },
        async setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['lote_padre1', 'transaccion1', 'maquina1', 'articulo1'],
                iccl: {
                    transaccion1: {
                        incl: ['socio1'],
                    },
                },
                ordr: [['fecha', 'DESC']],
                page: this.vista.table_page,
            }

            if (this.$route.params.articulo_id) {
                this.vista.qry.fltr.articulo = { op: 'Es', val: this.$route.params.articulo_id }
            } else {
                this.vista.qry.incl.push('articulo1')
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
            this.vista.qry.cols.push(
                'tipo_cambio',
                'igv_afectacion',
                'igv_porcentaje',
                'lote_padre',
                'is_lote_padre',
                'stock',
            )
        },

        //--- Row actions ---//
        async verCompra(item) {
            console.log('por implementtar', item)
        },
    },
}
</script>
