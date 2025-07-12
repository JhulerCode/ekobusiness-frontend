<template>
    <JdModal modal="mProductosFaltantes">
        <JdTable :columns="columns" :datos="modal.articulos || []" :reload="loadPedidos">
            <template v-slot:cCantidad="{ item }">
                {{ redondear(item.cantidad - item.entregado, 0) }}
            </template>

            <template v-slot:cFaltante="{ item }">
                <span :class="{ 'negativo': (item.stock - (item.cantidad - item.entregado)) < 0 }">
                    {{ redondear(item.stock - (item.cantidad - item.entregado), 0) }}
                </span>
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

import { urls, get } from '@/utils/crud'
import { redondear } from '@/utils/mine'

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

        modal: {},

        columns: [
            {
                id: 'nombre',
                title: 'Producto',
                width: '25rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'stock',
                title: 'Stock',
                format: 'number',
                toRight: true,
                width: '7rem',
                show: true,
            },
            {
                id: 'pedido',
                title: 'Pedido',
                slot: 'cCantidad',
                toRight: true,
                width: '7rem',
                show: true
            },
            {
                id: 'faltante',
                title: 'Faltante',
                slot: 'cFaltante',
                toRight: true,
                width: '7rem',
                show: true
            }
        ]
    }),
    created() {
        this.modal = this.useModals.mProductosFaltantes

        this.loadPedidos()
    },
    methods: {
        async loadPedidos() {
            const qry = {
                produccion_tipo: this.modal.produccion_tipo
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socio_pedidos}/pendientes?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.articulos = res.data
        }
    }
}
</script>

<style lang="scss" scoped>
.negativo {
    color: var(--rojo)
}
</style>