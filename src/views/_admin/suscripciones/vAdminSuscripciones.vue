<template>
    <VistaLayout :config="VIEW_CONFIG" :setQuery="setQuery" @runMethod="runMethod"> </VistaLayout>

    <!-- Modales -->
    <mAdminSuscripcion v-if="modals.show.mAdminSuscripcion" />
</template>

<script>
import mAdminSuscripcion from './mAdminSuscripcion.vue'

import VIEW_CONFIG from './adminSuscripciones.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { get } from '@/utils/crud'
import dayjs from 'dayjs'

export default {
    name: 'vAdminSuscripciones',
    components: {
        mAdminSuscripcion,
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
                incl: ['moneda1', 'empresa1'],
                ordr: [['createdAt', 'DESC']],
                page: this.vista.table_page,
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        // --- Header actions ---
        async nuevo() {
            const send = {
                suscripcion: {
                    plan_nombre: 'ESTÁNDAR',
                    periodo: 'mensual',
                    fecha_inicio: dayjs().format('YYYY-MM-DD'),
                    fecha_vencimiento: dayjs().add(1, 'month').format('YYYY-MM-DD'),
                },
            }
            this.modals.setModal('mAdminSuscripcion', 'Nueva Suscripción Global', 1, send, true)
        },

        //--- Row actions ---//
        async editar(item) {
            const qry = {
                incl: ['empresa1', 'moneda1'],
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code != 0) return

            const send = {
                suscripcion: { ...res.data },
            }

            this.modals.setModal('mAdminSuscripcion', 'Editar Suscripción Global', 2, send, true)
        },
    },
}
</script>
