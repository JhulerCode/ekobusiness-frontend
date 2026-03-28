<template>
    <VistaLayout :config="VIEW_CONFIG" :setQuery="setQuery" @runMethod="runMethod"> </VistaLayout>

    <!-- Modales -->
    <mPrecioCompra v-if="modals?.show?.mPrecioCompra" />
</template>

<script>
import mPrecioCompra from './mPrecioCompra.vue'

import VIEW_CONFIG from './compra_precios.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { get } from '@/utils/crud'

export default {
    components: {
        mPrecioCompra,
    },
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        modals: () => useModals(),
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
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['articulo1', 'socio1', 'currency_id1'],
                ordr: [['articulo1', 'nombre', 'ASC']],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        //--- Header actions ---//
        nuevo() {
            const send = { precio: { activo: true } }
            this.modals.setModal('mPrecioCompra', 'Nuevo precio', 1, send, true)
        },

        //--- Row actions ---//
        async editar(item) {
            const qry = {
                incl: ['articulo1', 'socio1'],
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res.code != 0) return

            const send = {
                precio: res.data,
                articulos: [{ ...res.data.articulo1 }],
                socios: [{ ...res.data.socio1 }],
            }

            this.modals.setModal('mPrecioCompra', 'Editar precio', 2, send, true)
        },
        async verArticulos(item) {
            const send = {
                precio_lista: item.id,
            }
            this.modals.setModal('mPrecioListaItems', item.nombre, null, send, true)
        },
    },
}
</script>
