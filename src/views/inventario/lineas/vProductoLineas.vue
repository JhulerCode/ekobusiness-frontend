<template>
    <VistaLayout :config="VIEW_CONFIG" :setQuery="setQuery" @runMethod="runMethod"> </VistaLayout>

    <mArticuloLinea v-if="modals.show.mArticuloLinea" />
    <mUploadFiles v-if="modals.show.mUploadFiles" />
</template>

<script>
import mArticuloLinea from './mArticuloLinea.vue'
import mUploadFiles from '@/components/mUploadFiles.vue'

import VIEW_CONFIG from './productoLineas.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { get } from '@/utils/crud'

export default {
    name: 'vProductoLineas',
    components: {
        mArticuloLinea,
        mUploadFiles,
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
                ordr: [['nombre', 'ASC']],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
            this.vista.qry.cols.push('fotos')
        },

        // --- Header actions ---
        nuevo() {
            const send = { articulo_linea: { activo: true } }
            this.modals.setModal('mArticuloLinea', 'Nueva línea', 1, send, true)
        },

        //--- Row actions ---//
        async editar(item) {
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            const send = {
                articulo_linea: res.data,
            }
            this.modals.setModal('mArticuloLinea', 'Editar línea', 2, send, true)
        },
        openUploadFiles(item) {
            const send = {
                item: { id: item.id, nombre: item.nombre, archivos: item.fotos || [] },
                accept: 'image/*',
                cantidad: 2,
                url: `${this.vista.apiUrl}/fotos`,
                vista: this.vista.name,
                tabla: 'tableData',
                prop: 'fotos',
            }
            this.modals.setModal('mUploadFiles', 'Actualizar fotos', 2, send, true)
        },
    },
}
</script>
