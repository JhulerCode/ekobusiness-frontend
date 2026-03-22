<template>
    <VistaLayout :config="VIEW_CONFIG" :setQuery="setQuery" @runMethod="runMethod"> </VistaLayout>

    <mProductosCuarentena v-if="modals.show.mProductosCuarentena" @liberado="liberarLote" />
    <mProduccionTrazabilidad v-if="modals.show.mProduccionTrazabilidad" />
</template>

<script>
import mProductosCuarentena from '@/views/produccion/ingreso_pt/mProductosCuarentena.vue'
import mProduccionTrazabilidad from '@/views/produccion/historial/mProduccionTrazabilidad.vue'

import VIEW_CONFIG from './pts_ingresos.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'
import dayjs from 'dayjs'
import { jmsg } from '@/utils/swal'

export default {
    name: 'vPtsIngresos',
    components: {
        mProductosCuarentena,
        mProduccionTrazabilidad,
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
                fltr: { tipo: { op: 'Es', val: 4 } },
                incl: ['articulo1', 'produccion_orden1', 'maquina1'],
                ordr: [
                    ['fecha', 'DESC'],
                    ['createdAt', 'DESC'],
                ],
                iccl: {
                    produccion_orden1: { incl: ['linea1'] },
                },
                page: this.vista.table_page,
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
            this.vista.qry.cols.push('produccion_orden')
        },

        // --- Header actions ---
        async verCuarentena() {
            const send = {
                transaccion: {},
            }
            this.modals.setModal('mProductosCuarentena', `Cuarentena`, null, send, true)
        },

        // --- Table row actions ---
        async verTrazabilidad(item) {
            console.log('ASD')
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.produccion_ordenes}/uno/${item.produccion_orden}`)
            this.auth.setLoading(false)

            if (res.code != 0) return
            if (res.data == null) return jmsg('warning', 'La órden de producción no existe')

            const send = {
                produccion_orden: res.data,
                articulos: [{ id: res.data.articulo, ...res.data.articulo1 }],
                maquinas: [{ id: res.data.maquina, ...res.data.maquina1 }],
            }
            this.modals.setModal('mProduccionTrazabilidad', 'Trazabilidad', null, send, true)
        },
    },
}
</script>
