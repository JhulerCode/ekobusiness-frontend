<template>
    <JdModal modal="mLotes">
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
            :datos="modal.lotes || []"
            :reload="loadLotes"
            maxHeight="73vh"
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

import { urls, get } from '@/utils/crud'
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
                id: 'lote',
                title: 'Lote',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'fv',
                title: 'Fv',
                format: 'date',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'stock',
                title: 'Stock',
                width: '8rem',
                format: 'decimal',
                show: true,
                seek: true,
                sort: true,
            },
        ],
    }),
    async created() {
        this.modal = this.useModals.mLotes

        await this.loadLotes()
    },
    computed: {
        stock() {
            return this.$refs['TableKardex']?.datosFiltrados
        },
    },
    methods: {
        async loadLotes() {
            const qry = {
                incl: ['articulo1'],
                cols: [
                    'fecha',
                    'moneda',
                    'tipo_cambio',
                    'pu',
                    'igv_afectacion',
                    'igv_porcentaje',
                    'fv',
                    'lote',
                    'stock',
                    'lote_fv_stock',
                ],
                fltr: {
                    articulo: { op: 'Es', val: this.modal.articulo.id },
                    is_lote_padre: { op: 'Es', val: true },
                },
                ordr: [
                    ['createdAt', 'DESC'],
                    ['fv', 'DESC'],
                    ['lote', 'DESC'],
                ],
            }

            this.modal.lotes = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.lotes = res.data
            this.calculateStock()
        },
        calculateStock() {
            this.modal.stock = 0
            this.modal.valor = 0

            for (const a of this.modal.lotes) {
                this.modal.stock += Number(a.stock)
                this.modal.valor += Number(a.stock) * a.pu
            }
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
