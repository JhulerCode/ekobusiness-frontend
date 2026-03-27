<template>
    <VistaLayout :config="VIEW_CONFIG" :setQuery="setQuery" @runMethod="runMethod"> </VistaLayout>

    <!-- Modales -->
    <mInspeccion v-if="modals.show?.mInspeccion" />
</template>

<script>
import mInspeccion from './mInspeccion.vue'

import VIEW_CONFIG from './inspecciones.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { get } from '@/utils/crud'
import dayjs from 'dayjs'

export default {
    name: 'vInspecciones',
    components: {
        mInspeccion,
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
                incl: ['socio1'],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        //--- Header actions ---//
        nuevo() {
            const send = {
                inspeccion: {
                    fecha: dayjs().format('YYYY-MM-DD'),
                    correcciones: [],
                },
            }
            this.modals.setModal('mInspeccion', 'Nueva inspección', 1, send, true)
        },

        //--- Row actions ---//
        async ver(item) {
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            const send = {
                inspeccion: res.data,
                socios: [{ ...res.data.socio1 }],
            }
            this.modals.setModal('mInspeccion', 'Ver inspección', 3, send, true)
        },
        async editar(item) {
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            const send = {
                inspeccion: res.data,
            }
            this.modals.setModal('mInspeccion', 'Editar inspección', 2, send, true)
        },
    },
}
</script>
