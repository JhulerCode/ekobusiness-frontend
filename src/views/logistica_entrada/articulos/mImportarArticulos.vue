<template>
    <JdModal modal="mImportarArticulos" :buttons="buttons" @button-click="(action) => this[action]()">
        <JdTable :columns="columns" :datos="modal.articulos" :seeker="false" :download="false">
        </JdTable>
    </JdModal>
</template>

<script>
import JdModal from "@/components/JdModal.vue"
import JdTable from "@/components/JdTable.vue"

import { useAuth } from "@/pinia/auth"
import { useVistas } from "@/pinia/vistas"
import { useModals } from "@/pinia/modals"

import { urls, post } from "@/utils/crud"

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
            { id: 'Nombre', show: true, width: '25rem', title: "Nombre" },
            { id: 'Tipo_produccion', show: true, width: '8rem', title: "Tipo de producción", prop: "Tipo_produccion1.nombre" },
            { id: 'Sobres_caja', show: true, width: '7rem', title: "Sobres en caja" },
            { id: 'Categoria', show: true, width: '10rem', title: "Categoria", prop: "Categoria1.nombre" },
            { id: 'EAN', show: true, width: '10rem', title: "EAN" },
            { id: 'Unidad', show: true, width: '5rem', title: "Unidad", prop: "Unidad" },
            { id: 'Marca', show: true, width: '8rem', title: "Marca" },
            { id: 'Tributo', show: true, width: '18rem', title: "Tributo", prop: "Tributo1.nombre" }
        ],

        buttons: [
            { text: "Grabar", action: "grabar", spin: false, show: true },
        ],
    }),
    created() {
        this.modal = this.useModals.mImportarArticulos

        if (this.modal.tipo == 1) {
            this.columns[1].show = false
            this.columns[2].show = false
            this.columns[4].show = false
            this.columns[6].show = false
        }
    },
    methods: {
        eliminar(item) {
            this.modal.articulos = this.modal.articulos.filter(a => a !== item)
        },
        async grabar() {
            const send = {
                tipo: this.modal.tipo,
                articulos: this.modal.articulos,
            }

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(`${urls.articulos}/bulk`, send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.show.mImportarArticulos = false
        }
    },
};
</script>

<style scoped>
button {
    margin-top: 20px;
}
</style>