<template>
    <VistaLayout :config="VIEW_CONFIG" :setQuery="setQuery" @runMethod="runMethod"> </VistaLayout>

    <mTipoCambio v-if="modals.show.mTipoCambio" />
</template>

<script>
import mTipoCambio from './mTipoCambio.vue'

import VIEW_CONFIG from './tipo_cambios.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { get } from '@/utils/crud'
import dayjs from 'dayjs'

export default {
    name: 'vTipoCambios',
    components: {
        mTipoCambio,
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
                ordr: [['fecha', 'DESC']],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        //--- Header actions ---//
        nuevo() {
            const send = { tipo_cambio: { fecha: dayjs().format('YYYY-MM-DD') } }
            this.modals.setModal('mTipoCambio', 'Nuevo tipo de cambio', 1, send, true)
        },

        //--- Row actions ---//
        async editar(item) {
            const qry = {
                incl: ['moneda1'],
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            const send = {
                tipo_cambio: res.data,
            }
            this.modals.setModal('mTipoCambio', 'Editar tipo de cambio', 2, send, true)
        },
    },
}
</script>
