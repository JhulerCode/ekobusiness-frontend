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
                id: 'transaccion1.fecha',
                prop: 'transaccion1.fecha',
                title: 'Fecha',
                width: '8rem',
                show: true,
                sort: true,
            },
            {
                id: 'transaccion1.guia',
                prop: 'transaccion1.guia',
                title: 'Guia',
                width: '8rem',
                show: true,
                sort: true,
            },
            {
                id: 'transaccion1.factura',
                prop: 'transaccion1.factura',
                title: 'Factura',
                width: '8rem',
                show: true,
                sort: true,
            },
            {
                id: 'articulo',
                title: 'Artículo',
                prop: 'articulo1.nombre',
                width: '20rem',
                show: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                type: 'decimal',
                toRight: true,
                width: '6rem',
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
                    'transaccion1.socio_pedido': { op: 'Es', val: this.modal.socio_pedido.id },
                },
                incl: ['transaccion1', 'articulo1'],
                ordr: [['fecha', 'DESC']],
            }

            this.useAuth.updateQuery(this.columns, qry)

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transaccion_items}?qry=${JSON.stringify(qry)}`)
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
