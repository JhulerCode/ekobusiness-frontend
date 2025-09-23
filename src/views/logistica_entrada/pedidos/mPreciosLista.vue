<template>
    <JdModal modal="mPreciosLista" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="mrg-btm1">
            {{ modal.precio_lista.nombre }} - {{ modal.precio_lista.moneda }}
        </div>

        <JdTable :columns="columns" :datos="modal.articulos || []" :rowSelectable="true" maxHeight="30rem"
            :reload="loadPrecioListaItems" :download="false">
        </JdTable>
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
                id: 'precio',
                title: 'Valor unitario',
                toRight: true,
                width: '7rem',
                show: true,
                sort: true,
            }
        ],
    }),
    created() {
        this.modal = this.useModals.mPreciosLista
        this.loadPrecioListaItems()
    },
    methods: {
        async loadPrecioListaItems() {
            const qry = {
                fltr: { precio_lista: { op: 'Es', val: this.modal.precio_lista.id } },
                cols: ['articulo', 'precio']
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.precio_lista_items}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.modal.articulos = res.data
        },
        sendItems() {
            const items = this.modal.articulos.filter(a => a.selected == true)

            if (items.length == 0) return jmsg('warning', 'Selecciona al menos un artículo')

            this.$emit('sendItems', items)
            this.useModals.show.mPreciosLista = false
        }
    }
}
</script>

<style lang="scss" scoped></style>