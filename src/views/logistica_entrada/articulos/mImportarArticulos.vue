<template>
    <JdModal
        modal="mImportarArticulos"
        :buttons="buttons"
        @button-click="(action) => this[action]()"
    >
        <JdTable :columns="columns" :datos="modal.articulos" :seeker="false" :download="false" />
    </JdModal>
</template>

<script>
import { JdModal, JdTable } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, post } from '@/utils/crud'

export default {
    components: {
        JdModal,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        modal: {},

        columns: [
            { id: 'nombre', title: 'Nombre', width: '25rem', show: true },
            { id: 'codigo_barra', title: 'EAN', width: '10rem', show: true },
            { id: 'type', title: 'Tipo', prop: 'type1.nombre', width: '10rem', show: true },
            {
                id: 'Se compra',
                title: 'Se compra',
                width: '10rem',
                show: true,
            },
            {
                id: 'Se vende',
                title: 'Se vende',
                width: '10rem',
                show: true,
            },

            {
                id: 'Tributo',
                show: true,
                width: '18rem',
                title: 'Tributo',
                prop: 'igv_afectacion1.nombre',
            },
            { id: 'unidad', title: 'Unidad', width: '5rem', show: true },
            {
                id: 'categoria',
                title: 'Categoria',
                prop: 'categoria1.nombre',
                width: '10rem',
                show: true,
            },
            { id: 'Marca', title: 'Marca', width: '8rem', show: true },

            { id: 'Tiene fv', title: 'Tiene fv', width: '10rem', show: true },
        ],

        buttons: [{ text: 'Grabar', action: 'grabar', spin: false, show: true }],
    }),
    created() {
        this.modal = this.useModals.mImportarArticulos

        // if (this.modal.tipo == 1) {
        //     this.columns[1].show = false
        //     this.columns[2].show = false
        //     this.columns[4].show = false
        //     this.columns[6].show = false
        // }
    },
    methods: {
        eliminar(item) {
            this.modal.articulos = this.modal.articulos.filter((a) => a !== item)
        },
        async grabar() {
            const send = {
                // tipo: this.modal.tipo,
                articulos: this.modal.articulos,
            }

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(`${urls.articulos}/bulk`, send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.show.mImportarArticulos = false
        },
    },
}
</script>

<style scoped>
button {
    margin-top: 20px;
}
</style>
