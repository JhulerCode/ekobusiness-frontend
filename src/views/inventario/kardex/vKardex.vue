<template>
    <VistaLayout
        :key="$route.fullPath"
        :config="VIEW_CONFIG"
        :checkFiltros="checkFiltros"
        :setQuery="setQuery"
        :askToInicialLoad="false"
    >
    </VistaLayout>

    <mTransaccion v-if="modals.show.mTransaccion" />
</template>

<script>
import mTransaccion from '@/views/compras/compras/mTransaccion.vue'

import VIEW_CONFIG from './kardex.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get, delet } from '@/utils/crud'
import { jmsg, jqst } from '@/utils/swal'

export default {
    name: 'vKardex',
    components: {
        mTransaccion,
    },
    data: () => ({
        VIEW_CONFIG,
    }),
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        modals: () => useModals(),
        vista() {
            return this.vistas[VIEW_CONFIG.name]
        },
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        checkFiltros() {
            if (this.$route.params.id) return false

            if (!this.vista.tableColumns.some((a) => a.val || a.val1)) {
                jmsg('error', 'Ingrese al menos un filtro')
                return true
            }
            return false
        },
        async setQuery() {
            // Forzar visibilidad de columna artículo según la ruta para que prevalezca sobre settings
            const colArt = this.vista.tableColumns.find((a) => a.id == 'articulo')
            if (colArt) {
                const isDetail = !!this.$route.params.id
                colArt.show = !isDetail
                colArt.seek = !isDetail
            }

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

            if (this.$route.params.id) {
                this.vista.qry.fltr.articulo = { op: 'Es', val: this.$route.params.id }
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
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            const send = {
                id: item.id,
                tipo: item.tipo,
                lote_padre: item.lote_padre,
                cantidad: Math.abs(item.cantidad),
            }

            this.auth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.kardex, send)
            this.auth.setLoading(false)

            if (res.code != 0) return

            const i = this.vista.tableData.findIndex((a) => a.id == item.id)
            this.vista.tableData.splice(i, 1)
            this.calculateStock()
        },
        async verCompra(item) {
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}/uno/${item.transaccion1.id}`)
            this.auth.setLoading(false)

            if (res.code != 0) return

            const send = {
                transaccion: res.data,
                socio: { ...res.data.socio1 },
                socios: [{ ...res.data.socio1 }],
                monedas: [{ ...res.data.moneda1 }],
                pedidos: res.data.socio_pedido ? [{ ...res.data.socio_pedido1 }] : [],
            }

            this.modals.setModal('mTransaccion', 'Ver compra', 3, send, true)
        },
    },
}
</script>
