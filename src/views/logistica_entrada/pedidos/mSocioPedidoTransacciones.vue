<template>
    <div class="pedido-items">
        <JdTable
            :columns="columns"
            :datos="modal.socio_pedido.transacciones || []"
            :download="false"
            :seeker="false"
            :reload="loadTransacciones"
            :maxHeight="modal.mode == 3 ? '18rem' : '14.5rem'"
        />
    </div>

    <mPreciosLista v-if="useModals.show.mPreciosLista" @sendItems="agregarArticulos" />
</template>

<script>
import { JdTable } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'

export default {
    components: {
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),

        modal: {},

        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                width: '8rem',
                show: true,
                sort: true,
            },
            {
                id: 'guia',
                title: 'Guia',
                width: '8rem',
                show: true,
                sort: true,
            },
            {
                id: 'factura',
                title: 'Factura',
                width: '8rem',
                show: true,
                sort: true,
            },
            {
                id: 'monto',
                title: 'Importe',
                type: 'decimal',
                width: '8rem',
                show: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mSocioPedido

        if (!this.modal.socio_pedido.transacciones) {
            this.loadTransacciones()
        }
    },
    methods: {
        async loadTransacciones() {
            const qry = {
                fltr: {
                    socio_pedido: { op: 'Es', val: this.modal.socio_pedido.id },
                },
                ordr: [['fecha', 'DESC']],
            }

            this.useAuth.updateQuery(this.columns, qry)

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.modal.socio_pedido.transacciones = res.data
        },
    },
}
</script>

<style scoped>
.agregar {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 0.5rem;
    margin-bottom: 1rem;
}
</style>
