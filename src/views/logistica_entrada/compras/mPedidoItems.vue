<template>
    <JdModal modal="mPedidoItems" :buttons="buttons" @button-click="(action) => this[action]()">
        <JdTable :columns="columns" :datos="modal.articulos || []" :rowSelectable="true" :download="false"
            maxHeight="30rem">

        </JdTable>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdTable from '@/components/JdTable.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},

        buttons: [
            { text: 'Agregar articulos', action: 'sendItems', spin: false, show: true },
        ],

        columns: [
            {
                id: 'articulo',
                title: 'Artículo',
                prop: 'articulo1.nombre',
                width: '25rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'unidad',
                title: 'Unidad',
                prop: 'articulo1.unidad',
                width: '5rem',
                show: true,
            },
            {
                id: 'pu',
                title: 'Precio',
                toRight: true,
                width: '7rem',
                show: true,
                sort: false,
            },
            {
                id: 'cantidad',
                title: 'Pedido',
                format: 'decimal',
                toRight: true,
                width: '7rem',
                show: true,
                sort: false,
            },
            {
                id: 'entregado',
                title: 'Entregado',
                format: 'decimal',
                toRight: true,
                width: '7rem',
                show: true,
                sort: false,
            },
            // {
            //     id: 'faltante',
            //     title: 'Faltante',
            //     slot: 'cFaltante',
            //     toRight: true,
            //     width: '7rem',
            //     show: true,
            //     sort: false,
            // },
        ],
    }),
    created() {
        this.modal = this.useModals.mPedidoItems
    },
    methods: {
        // selectAll(bol) {
        //     for (const a of this.modal.articulos) {
        //         a.selected = bol ? true : false
        //     }
        // },
        sendItems() {
            const items = this.modal.articulos.filter(a => a.selected == true)

            if (items.length == 0) return jmsg('warning', 'Selecciona al menos un artículo')

            this.$emit('sendItems', items)

            for (const a of this.modal.articulos) {
                a.selected = false
            }

            this.useModals.show.mPedidoItems = false
        }
    }
}
</script>

<style lang="scss" scoped></style>