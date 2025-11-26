<template>
    <JdModal modal="mKardex">
        <div class="header">
            <p>{{ modal.articulo.nombre }} ({{ modal.articulo.unidad }})</p>

            <div>
                <p>
                    <small>Stock filtrado:</small>
                    {{ calculateStockFiltered() }}
                </p>
                <p>
                    <small>Stock:</small>
                    {{ redondear(modal.stock) }}
                </p>

                <p>
                    <small>Valor:</small>
                    {{ redondear(modal.valor) }}
                </p>
            </div>
        </div>

        <JdTable
            :columns="columns"
            :datos="modal.kardex || []"
            :reload="loadKardex"
            :colAct="true"
            :rowOptions="tableRowOptions"
            maxHeight="70vh"
            @rowOptionSelected="runMethod"
            ref="TableKardex"
        />
    </JdModal>

    <mTransaccion v-if="useModals.show.mTransaccion" />
</template>

<script>
import { JdModal, JdTable } from '@jhuler/components'
import mTransaccion from '@/views/logistica_entrada/compras/mTransaccion.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'
import { redondear } from '@/utils/mine'

import dayjs from 'dayjs'

export default {
    components: {
        JdModal,
        JdTable,
        mTransaccion,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        redondear,
        dayjs,

        modal: {},
        // articulo: {},

        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                prop: 'fecha',
                format: 'date',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'tipo',
                title: 'Operación',
                prop: 'tipo1.nombre',
                // slot: 'cTipo',
                width: '15rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'lote',
                title: 'Lote',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'fv',
                title: 'Fecha vencimiento',
                format: 'date',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'vu_real',
                title: 'Valor unitario',
                toRight: true,
                width: '8rem',
                show: true,
            },
            {
                id: 'pu',
                title: 'Precio unitario',
                toRight: true,
                width: '8rem',
                show: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                format: 'decimal',
                toRight: true,
                width: '8rem',
                show: true,
            },
            {
                id: 'maquina',
                title: 'Máquina',
                prop: 'maquina1.nombre',
                width: '8rem',
                show: true,
            },
            {
                id: 'transaccion1.socio',
                title: 'Socio comercial',
                prop: 'transaccion1.socio1.nombres',
                width: '8rem',
                show: true,
            },
            {
                id: 'transaccion1.guia',
                title: 'Guía',
                prop: 'transaccion1.guia',
                width: '8rem',
                show: true,
            },
            {
                id: 'observacion',
                title: 'Observación',
                width: '8rem',
                show: true,
            },
            // {
            //     id: 'more_info',
            //     title: '...',
            //     slot: 'cMoreInfo',
            //     width: '20rem',
            //     show: true,
            //     seek: false,
            //     sort: false,
            // },
        ],
        tableRowOptions: [
            {
                label: 'Eliminar',
                icon: 'fa-regular fa-trash-can',
                action: 'eliminar',
                permiso: 'vArticulos:kardexDelete',
            },
            {
                label: 'Ver compra',
                icon: 'fa-regular fa-folder-open',
                action: 'verCompra',
                ocultar: { tipo: { op: '!=', val: 1 } },
            },
            {
                label: 'Ver venta',
                icon: 'fa-regular fa-folder-open',
                action: 'verCompra',
                ocultar: { tipo: { op: '!=', val: 5 } },
            },
        ],
    }),
    async created() {
        this.modal = this.useModals.mKardex

        await this.loadKardex()
    },
    methods: {
        setQuery() {
            this.modal.qry = {
                fltr: {
                    articulo: { op: 'Es', val: this.modal.articulo.id },
                },
                incl: ['lote_padre1', 'transaccion1', 'maquina1'],
            }

            this.useAuth.updateQuery(this.columns, this.modal.qry)
            this.modal.qry.cols.push(
                'tipo_cambio',
                'igv_afectacion',
                'igv_porcentaje',
                'lote_padre',
                'is_lote_padre',
                'stock',
            )
        },
        async loadKardex() {
            this.setQuery()

            this.modal.kardex = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}?qry=${JSON.stringify(this.modal.qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.kardex = res.data
            this.calculateStock()
        },
        calculateStock() {
            this.modal.stock = 0
            this.modal.valor = 0

            for (const a of this.modal.kardex) {
                if (a.is_lote_padre) {
                    this.modal.stock += Number(a.stock)
                    this.modal.valor += Number(a.stock) * a.vu_real
                }
            }
        },
        calculateStockFiltered() {
            let stockf = 0
            // let valorf = 0

            for (const a of this.$refs['TableKardex']?.datosFiltrados || []) {
                stockf += Number(a.cantidad)
                // valorf += a.cantidad * a.vu_real
            }

            return redondear(stockf)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            const send = {
                id: item.id,
                tipo: item.tipo,
                lote_padre: item.lote_padre,
                cantidad: Math.abs(item.cantidad),
            }

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.kardex, send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const i = this.modal.kardex.findIndex((a) => a.id == item.id)
            this.modal.kardex.splice(i, 1)
            this.calculateStock()
        },
        async verCompra(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}/uno/${item.transaccion1.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                transaccion: res.data,
                socio: { ...res.data.socio1 },
                socios: [{ ...res.data.socio1 }],
                monedas: [{ ...res.data.moneda1 }],
                pedidos: res.data.socio_pedido ? [{ ...res.data.socio_pedido1 }] : [],
            }

            this.useModals.setModal('mTransaccion', 'Ver compra', 3, send, true)
        },
    },
}
</script>

<style lang="scss" scoped>
.header {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    margin-bottom: 2rem;

    div {
        display: flex;
        gap: 1rem;
    }
}

.anulado {
    color: var(--rojo);
}
</style>
