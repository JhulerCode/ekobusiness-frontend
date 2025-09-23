<template>
    <JdModal modal="mPedidosClientes">
        <div class="contairner-datos">
            <JdSelect
                label="Cliente"
                v-model="modal.socio"
                :lista="modal.clientes || []"
                mostrar="nombres_apellidos"
                :loaded="modal.clientesLoaded"
                @reload="loadClientes"
            />

            <JdButton text="Buscar" tipo="2" @click="loadPedidos" />
        </div>

        <JdTable :columns="columns" :datos="modal.articulos || []">
            <template v-slot:cCantidad="{ item }">
                {{ redondear(item.cantidad - item.entregado, 0) }}
            </template>

            <template v-slot:cFaltante="{ item }">
                <span class="negativo" v-if="item.stock < item.cantidad - item.entregado">
                    {{ redondear(item.cantidad - item.entregado - item.stock, 0) }}
                </span>
            </template>
        </JdTable>
    </JdModal>
</template>

<script>
import { JdModal, JdSelect, JdTable, JdButton } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'
import { redondear } from '@/utils/mine'

export default {
    components: {
        JdModal,
        JdTable,
        JdSelect,
        JdButton,
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
                sort: true,
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
                show: true,
            },
            {
                id: 'faltante',
                title: 'Faltante',
                slot: 'cFaltante',
                toRight: true,
                width: '7rem',
                show: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mPedidosClientes

        this.loadClientes()
    },
    methods: {
        async loadClientes() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: 2 }, activo: { op: 'Es', val: true } },
                cols: ['nombres', 'apellidos', 'nombres_apellidos'],
            }

            this.modal.clientesLoaded = false
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.modal.clientesLoaded = true

            if (res.code != 0) return

            this.modal.clientes = res.data
        },
        async loadPedidos() {
            const qry = {
                socio: this.modal.socio,
            }

            this.modal.articulos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socio_pedidos}/pendientes?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.articulos = res.data
        },
    },
}
</script>

<style lang="scss" scoped>
.contairner-datos {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    margin-bottom: 2rem;
}

.negativo {
    color: var(--rojo);
}
</style>
