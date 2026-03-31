<template>
    <VistaLayout :config="VIEW_CONFIG" :setQuery="setQuery" @runMethod="runMethod"> </VistaLayout>

    <mProductosCuarentena v-if="modals?.show?.mProductosCuarentena" />
</template>

<script>
import mProductosCuarentena from '@/views/produccion/ingreso_pt/mProductosCuarentena.vue'

import VIEW_CONFIG from './pts_ingresos.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import dayjs from 'dayjs'

export default {
    name: 'vPtsIngresos',
    components: {
        mProductosCuarentena,
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
        initFiltros() {
            if (!this.vista.tableColumns[0].val) {
                this.vista.tableColumns[0].op = 'Está dentro de'
                this.vista.tableColumns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
                this.vista.tableColumns[0].val1 = dayjs().format('YYYY-MM-DD')
            }
        },
        setQuery() {
            this.vista.qry = {
                fltr: {
                    tipo: { op: 'Es', val: 4 },
                    pt_cuarentena: { op: 'Es', val: false },
                },
                incl: ['articulo1', 'lote1', 'produccion_orden1', 'maquina1'],
                iccl: {
                    produccion_orden1: {
                        incl: ['linea1', 'responsable1'],
                    },
                },
                ordr: [
                    ['fecha', 'DESC'],
                    ['createdAt', 'DESC'],
                ],
                page: this.vista.table_page,
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
            this.vista.qry.cols.push('tipo', 'produccion_orden')
        },

        //--- Header actions ---//
        async verCuarentena() {
            const send = {
                transaccion: {},
            }
            this.modals.setModal('mProductosCuarentena', `Cuarentena`, null, send, true)
        },
    },
}
</script>
