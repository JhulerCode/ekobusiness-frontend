<template>
    <VistaLayout :config="VIEW_CONFIG" :setQuery="setQuery" @runMethod="runMethod"> </VistaLayout>

    <!-- Modales -->
    <mFormato v-if="modals.show.mFormato" @created="setTransaccionItemCalidadRevisado" />
</template>

<script>
import mFormato from '@/views/calidad/formatos/mFormato.vue'

import VIEW_CONFIG from './compra_items.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import dayjs from 'dayjs'

export default {
    name: 'vCompraItems',
    components: {
        mFormato,
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
            const i = this.vista.tableColumns.findIndex((a) => a.id == 'transaccion1.fecha')

            if (!this.vista.tableColumns[i].val) {
                this.vista.tableColumns[i].op = 'Está dentro de'
                this.vista.tableColumns[i].val = dayjs().startOf('month').format('YYYY-MM-DD')
                this.vista.tableColumns[i].val1 = dayjs().format('YYYY-MM-DD')
            }
        },
        setQuery() {
            this.vista.qry = {
                fltr: { 'transaccion1.tipo': { op: 'Es', val: 1 } },
                incl: ['transaccion1', 'articulo1'],
                iccl: {
                    transaccion1: { incl: ['socio1', 'socio_pedido1'] },
                },
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        // --- Table row actions ---
        // async crearFormatoValue(item) {
        //     const formato_id = 'RE-BPM-05.01'
        //     this.auth.setLoading(true, 'Cargando...')
        //     const res = await get(`${urls.formatos}/uno/${formato_id}`)
        //     this.auth.setLoading(false)
        //     if (res.code != 0) return

        //     this.auth.setLoading(true, 'Cargando...')
        //     const res1 = await get(`${urls.formato_values}/uno/${item.calidad_revisado}`)
        //     this.auth.setLoading(false)
        //     if (res1.code != 0) return

        //     if (res1.data == null) {
        //         const send = {
        //             transaccion_item: item.id,
        //             transaccion_item1: { ...item },
        //             formato: {
        //                 codigo: res.data.id,
        //                 columns: res.data.columns,
        //                 instructivo: res.data.instructivo,
        //             },
        //         }
        //         this.modals.setModal('mFormato', formato_id, 1, send, true)
        //     } else {
        //         for (const a of res.data.columns) a.value = res1.data[a.id]
        //         const send = {
        //             transaccion_item: item.id,
        //             transaccion_item1: res1.data.transaccion_item1,
        //             formato: {
        //                 id: res1.data.id,
        //                 codigo: res.data.id,
        //                 columns: res.data.columns,
        //                 instructivo: res.data.instructivo,
        //             },
        //         }
        //         this.modals.setModal('mFormato', formato_id, 2, send, true)
        //     }
        // },

        // @actions
        setTransaccionItemCalidadRevisado(item) {
            const t_item = this.vista.tableData.find((a) => a.id == item.transaccion_item)
            if (t_item) t_item.calidad_revisado = item.id
        },
    },
}
</script>
