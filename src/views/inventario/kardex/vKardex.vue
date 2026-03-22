<template>
    <VistaLayout :vista="vista">
        <template #header-left>
            <!-- <div class="header-info">
                <div class="resumen">
                    <p>
                        <small>Stock:</small>
                        {{ redondear(stock) }}
                    </p>
                    <p>
                        <small>Valor:</small>
                        {{ redondear(valor) }}
                    </p>
                </div>
            </div> -->
        </template>

        <JdTable
            :name="vista.name"
            :columns="vista.tableColumns"
            :datos="vista.tableData || []"
            :rowOptions="vista.tableRowActions"
            @rowOptionSelected="runMethod"
            ref="TableKardex"
        />
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
import { jqst } from '@/utils/swal'
import { redondear } from '@/utils/mine'

export default {
    name: 'vKardex',
    components: {
        mTransaccion,
    },
    data: () => ({
        redondear,
        // stock: 0,
        // valor: 0,
    }),
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        modals: () => useModals(),
        vista() {
            return this.vistas[VIEW_CONFIG.name]
        },
    },
    async created() {
        this.vistas.initVista(VIEW_CONFIG.name, {
            ...JSON.parse(JSON.stringify(VIEW_CONFIG)),
            apiUrl: urls[VIEW_CONFIG.apiPath],
            runMethod: this.runMethod,
        })

        this.vista.loadTableData()
    },
    methods: {
        runMethod(method, item) {
            this.vistas.runMethod(this, method, item)
        },
        async setQuery() {
            this.vista.qry = {
                fltr: {
                    articulo: { op: 'Es', val: this.$route.params.id },
                },
                incl: ['lote_padre1', 'transaccion1', 'maquina1'],
                iccl: {
                    transaccion1: {
                        incl: ['socio1'],
                    },
                },
                ordr: [['fecha', 'DESC']],
                page: this.vista.table_page,
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
        // calculateStock() {
        //     this.stock = 0
        //     this.valor = 0

        //     for (const a of this.vista.tableData) {
        //         if (a.is_lote_padre) {
        //             this.stock += Number(a.stock)
        //             this.valor += Number(a.stock) * a.vu_real
        //         }
        //     }
        // },
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

<style lang="scss" scoped>
.header-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    .resumen {
        display: flex;
        gap: 1rem;
    }
}
</style>
