<template>
    <JdModal modal="mLotes">
        <div class="header">
            <p v-if="modal.articulo.nombre">
                {{ modal.articulo.nombre }} ({{ modal.articulo.unidad }})
            </p>

            <div>
                <p>
                    <small>Stock:</small>
                    {{ redondear(modal.stock_general) }}
                </p>

                <p>
                    <small>Valor:</small>
                    {{ redondear(modal.valor_general) }}
                </p>
            </div>
        </div>

        <JdButton
            icon="fa-solid fa-rotate-right"
            text="Recargar"
            tipo="3"
            @click="loadLotes"
            class="mrg-btm1"
        />

        <JdTable :columns="columns" :datos="modal.lotes || []" maxHeight="73vh" />
    </JdModal>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
import { redondear } from '@/utils/mine'

import dayjs from 'dayjs'

export default {
    components: {},
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
                id: 'codigo',
                title: 'Lote',
                width: '8rem',
                show: true,
            },
            {
                id: 'fv',
                title: 'Fv',
                prop: 'fv1',
                width: '8rem',
                show: true,
            },
            {
                id: 'lote_stock',
                title: 'Stock',
                width: '8rem',
                format: 'decimal',
                show: true,
            },
        ],
    }),
    async created() {
        this.modal = this.useModals.mLotes

        await this.loadLotes()
    },
    methods: {
        async loadLotes() {
            const qry = {
                incl: ['articulo1', 'kardexes_for_sqls'],
                cols: ['fv', 'codigo', 'vu'],
                sqls: ['lote_stock'],
                fltr: {
                    articulo: { op: 'Es', val: this.modal.articulo.id },
                },
                grop: ['id'],
                ordr: [
                    ['createdAt', 'DESC'],
                    ['codigo', 'DESC'],
                    ['fv', 'DESC'],
                ],
            }

            this.modal.lotes = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.lotes}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.lotes = res.data
            this.calculateStock()
        },
        calculateStock() {
            this.modal.stock_general = 0
            this.modal.valor_general = 0

            for (const a of this.modal.lotes) {
                this.modal.stock_general += Number(a.lote_stock)
                this.modal.valor_general += Number(a.lote_stock) * a.vu
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
    margin-bottom: 1rem;

    div {
        display: flex;
        gap: 1rem;
    }
}

.anulado {
    color: var(--rojo);
}
</style>
