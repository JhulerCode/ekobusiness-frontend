<template>
    <JdModal modal="mPedidoMrpBomLines" :buttons="buttons" @button-click="(action) => this[action]()">
        <JdTable
            :columns="columns"
            :datos="modal.articulos || []"
            :rowSelectable="true"
            :download="false"
            :reload="loadMrpBomLines"
            maxHeight="30rem"
        />
    </JdModal>
</template>

<script>
import { JdModal, JdTable } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
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

        buttons: [{ text: 'Agregar articulos', action: 'sendItems', spin: false, show: true }],

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
                id: 'cantidad',
                title: 'Cantidad necesitada',
                format: 'decimal',
                toRight: true,
                width: '7rem',
                show: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mPedidoMrpBomLines
    },
    methods: {
        sendItems() {
            const items = this.modal.articulos.filter((a) => a.selected == true)

            if (items.length == 0) return jmsg('warning', 'Selecciona al menos un artículo')

            this.$emit('sendItems', items)

            for (const a of this.modal.articulos) {
                a.selected = false
            }

            this.useModals.show.mPedidoMrpBomLines = false
        },
        async loadMrpBomLines() {
            const qry = {
                incl: ['articulo1'],
                iccl: {
                    articulo1: {
                        cols: ['combo_articulos'],
                    },
                },
                cols: { exclude: [] },
                fltr: {
                    socio_pedido: { op: 'Es', val: this.modal.socio_pedido },
                },
                ordr: [['orden', 'ASC']],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socio_pedido_items}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.articulos = res.data
        },
    },
}
</script>

<style lang="scss" scoped></style>
