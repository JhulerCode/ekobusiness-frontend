<template>
    <JdModal modal="mProductosFaltantes">
        <JdButton icon="fa-solid fa-rotate" tipo="2" @click="loadPedidos" class="mrg-btm1" />

        <JdTable :columns="columns" :datos="modal.articulos || []" :reload="loadPedidos">
            <template v-slot:cCantidad="{ item }">
                {{ redondear(item.cantidad - item.pedido_item_entregado, 0) }}
            </template>

            <template v-slot:cFaltante="{ item }">
                <span
                    class="negativo"
                    v-if="item.stock < item.cantidad - item.pedido_item_entregado"
                >
                    {{ redondear(item.cantidad - item.pedido_item_entregado - item.stock, 0) }}
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
                toRight: true,
                width: '7rem',
                show: true,
                sort: true,
            },
            {
                id: 'pedido_item_entregado',
                title: 'Entregado',
                format: 'number',
                toRight: true,
                width: '7rem',
                show: true,
                sort: true,
            },
            {
                id: 'pendiente',
                title: 'Pendiente',
                format: 'number',
                toRight: true,
                width: '7rem',
                show: true,
                sort: true,
            },
            {
                id: 'articulo_stock',
                title: 'Stock',
                format: 'number',
                toRight: true,
                width: '7rem',
                show: true,
                sort: true,
            },
            {
                id: 'faltante',
                title: 'Faltante',
                slot: 'cFaltante',
                toRight: true,
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
