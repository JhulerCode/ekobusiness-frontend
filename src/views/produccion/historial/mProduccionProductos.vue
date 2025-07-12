<template>
    <JdModal modal="mProduccionProductos" :buttons="buttons" @button-click="(action) => this[action]()">
        <p class="mrg-btm1">
            {{ modal.produccion_orden1.articulo1.nombre }}
        </p>

        <JdTable :columns="columns" :datos="modal.transaccion_items || []" :seeker="false" :download="false"
            :reload="loadTransaccionItems">
        </JdTable>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
// import JdButton from '@/components/inputs/JdButton.vue'
// import JdSelect from '@/components/inputs/JdSelect.vue'
import JdTable from '@/components/JdTable.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
// import { incompleteData, genId } from '@/utils/mine'
// import { jmsg } from '@/utils/swal'

import dayjs from 'dayjs'

export default {
    components: {
        JdModal,
        // JdButton,
        // JdSelect,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        dayjs,

        columns: [
            {
                id: 'lote',
                title: 'Lote',
                width: '8rem',
                show: true,
            },
            {
                id: 'fv',
                title: 'F. vencimiento',
                format: 'date',
                width: '10rem',
                show: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                width: '8rem',
                show: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mProduccionProductos

        this.loadTransaccionItems()
    },
    methods: {
        async loadTransaccionItems() {
            const qry = {
                fltr: {
                    transaccion_tipo: { op: 'Es', val: 4 },
                    transaccion_produccion_orden: { op: 'Es', val: this.modal.produccion_orden }
                }
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}/items?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.transaccion_items = res.data
        }
    }
}
</script>

<style lang="scss" scoped>
.jd-table {
    .fv_div {
        display: grid;
        grid-template-columns: 5.5rem 5rem 5rem;
    }
}
</style>