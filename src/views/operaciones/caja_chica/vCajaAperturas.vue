<template>
    <VistaLayout :config="VIEW_CONFIG" :setQuery="setQuery" @runMethod="runMethod"> </VistaLayout>

    <!-- Modales -->
    <mCajaApertura v-if="modals?.show?.mCajaApertura" />
</template>

<script>
import mCajaApertura from './mCajaApertura.vue'

import VIEW_CONFIG from './caja_aperturas.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { get, patch } from '@/utils/crud'
import { jqst } from '@/utils/swal'
import dayjs from 'dayjs'

export default {
    name: 'vCajaAperturas',
    components: {
        mCajaApertura,
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
                fltr: {
                    createdBy: { op: 'Es', val: this.auth.usuario.id },
                },
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        //--- Header actions ---//
        nuevo() {
            const send = {
                caja_apertura: {
                    fecha_apertura: dayjs().format('YYYY-MM-DD'),
                    estado: 1,
                },
            }
            this.modals.setModal('mCajaApertura', 'Apertura de caja', 1, send, true)
        },

        //--- Row actions ---//
        async ver(item) {
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            const send = {
                caja_apertura: res.data,
            }
            this.modals.setModal('mCajaApertura', 'Ver caja', 3, send, true)
        },
        async agregarMovimientos(item) {
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            const send = {
                caja_apertura: res.data,
            }
            this.modals.setModal('mCajaApertura', 'Agregar movimientos', 4, send, true)
        },
        async cerrarCaja(item) {
            const resQst = await jqst('¿Está seguro de cerrar la caja?')
            if (resQst.isConfirmed == false) return

            this.auth.setLoading(true, 'Cerrando...')
            const res = await patch(`${this.vista.apiUrl}/cerrar`, { id: item.id })
            this.auth.setLoading(false)
            if (res.code != 0) return

            this.vistas.updateItem(VIEW_CONFIG.name, 'tableData', res.data)
        },
    },
}
</script>
