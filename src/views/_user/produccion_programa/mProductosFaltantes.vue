<template>
    <JdModal modal="mProductosFaltantes">
        <JdButton icon="fa-solid fa-rotate" tipo="2" @click="loadPedidos" class="mrg-btm1" />

        <JdTable :columns="columns" :datos="modal.articulos || []" :reload="loadPedidos">
            <template v-slot:cCantidad="{ item }">
                {{ redondear(item.cantidad - item.pedido_item_entregado, 0) }}
            </template>

            <template v-slot:cFaltante="{ item }">
                <span class="negativo" v-if="item.faltante > 0">
                    {{ redondear(item.faltante, 0) }}
                </span>
            </template>
        </JdTable>
    </JdModal>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
import { redondear } from '@/utils/mine'

export default {
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        redondear,

        modal: {},

        columns: [
            {
                id: 'nombre',
                title: 'Producto',
                width: '25rem',
                show: true,

                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Pedido',
                format: 'number',
                align: 'right',
                width: '7rem',
                show: true,
                sort: true,
            },
            {
                id: 'pedido_item_entregado',
                title: 'Entregado',
                format: 'number',
                align: 'right',
                width: '7rem',
                show: true,
                sort: true,
            },
            {
                id: 'pendiente',
                title: 'Pendiente',
                format: 'number',
                align: 'right',
                width: '7rem',
                show: true,
                sort: true,
            },
            {
                id: 'articulo_stock',
                title: 'Stock',
                format: 'number',
                align: 'right',
                width: '7rem',
                show: true,
                sort: true,
            },
            {
                id: 'faltante',
                title: 'Faltante',
                slot: 'cFaltante',
                align: 'right',
                width: '7rem',
                show: true,
                sort: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mProductosFaltantes

        this.loadPedidos()
    },
    methods: {
        async loadPedidos() {
            this.modal.articulos = []

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socio_pedidos}/pendientes?linea=${this.modal.linea}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.articulos = res.data
        },
    },
}
</script>

<style lang="scss" scoped>
.negativo {
    color: var(--rojo);
}
</style>
