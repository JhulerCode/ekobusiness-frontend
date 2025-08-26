<template>
    <JdModal modal="mKardex">
        <div class="header">
            <p>{{ modal.articulo.nombre }} ({{ modal.articulo.unidad }})</p>

            <div>
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
            maxHeight="80vh"
            @rowOptionSelected="runMethod"
        >
            <template v-slot:cMoreInfo="{ item }">
                {{ item.transaccion1?.socio1?.nombres }}
                {{ item.produccion_orden1?.maquina1?.nombre }}
                {{ item.maquina1?.nombre }}
                {{ item.observacion }}
            </template>
        </JdTable>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdTable from '@/components/JdTable.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'
import { redondear, getItemFromArray } from '@/utils/mine'

import dayjs from 'dayjs'

export default {
    components: {
        JdModal,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        redondear,
        getItemFromArray,
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
                seek: true,
                sort: true,
            },
            {
                id: 'pu',
                title: 'Precio unitario',
                toRight: true,
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                format: 'decimal',
                toRight: true,
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'more_info',
                title: '...',
                slot: 'cMoreInfo',
                width: '20rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
        tableRowOptions: [
            {
                label: 'Eliminar',
                icon: 'fa-regular fa-trash-can',
                action: 'eliminar',
                permiso: 'vArticulos:kardexDelete',
            },
        ],
    }),
    async created() {
        this.modal = this.useModals.mKardex

        await this.loadKardex()
    },
    methods: {
        async loadKardex() {
            const qry = {
                fltr: {
                    articulo: { op: 'Es', val: this.modal.articulo.id },
                },
                cols: [
                    'fecha',
                    'tipo',
                    'cantidad',
                    'moneda',
                    'tipo_cambio',
                    'pu',
                    'igv_afectacion',
                    'igv_porcentaje',
                    'lote',
                    'fv',
                    'stock',
                    'lote_padre',
                    'is_lote_padre',
                ],
                incl: ['lote_padre1', 'transaccion1', 'produccion_orden1', 'maquina1'],
            }

            qry.cols.push('observacion')

            this.modal.kardex = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.kardex = res.data
            this.calculateStock()
        },
        calculateStock() {
            this.modal.stock = 0
            this.modal.valor = 0

            for (const a of this.modal.kardex) {
                // if (a.is_lote_padre && a.transaccion1.estado != 0) {
                if (a.is_lote_padre) {
                    this.modal.stock += a.stock
                    this.modal.valor += a.stock * a.vu_real
                }
            }
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
