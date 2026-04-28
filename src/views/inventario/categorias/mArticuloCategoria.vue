<template>
    <JdModal
        modal="mArticuloCategoria"
        :buttons="buttons"
        @button-click="(action) => this[action]()"
    >
        <div class="container-datos">
            <JdInput
                label="Nombre"
                :nec="true"
                v-model="modal.articulo_categoria.nombre"
                :disabled="modal.mode == 3"
            />

            <JdSelectQuery
                label="Categoría padre"
                :search="loadCategorias"
                mostrar="categoria_nombre_completo"
                v-model="modal.articulo_categoria.categoria_parent"
                :selectedObject="modal.articulo_categoria.categoria_parent1"
                :disabled="modal.mode == 3"
            />

            <JdTextArea
                label="Descripción"
                v-model="modal.articulo_categoria.descripcion"
                :disabled="modal.mode == 3"
            />

            <JdSwitch
                label="Activo"
                v-model="modal.articulo_categoria.activo"
                :disabled="modal.mode == 3"
            />

            <JdSwitch
                label="Ecommerce?"
                v-model="modal.articulo_categoria.is_ecommerce"
                :disabled="modal.mode == 3"
            />

            <JdSwitch
                label="Destacado"
                v-model="modal.articulo_categoria.is_destacado"
                :disabled="modal.mode == 3"
                v-if="modal.articulo_categoria.is_ecommerce == true"
            />
        </div>
    </JdModal>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post, patch, get } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        urls,

        modal: {},

        buttons: [
            { text: 'Grabar', action: 'crear', spin: false },
            { text: 'Actualizar', action: 'modificar', spin: false },
        ],
    }),
    created() {
        this.modal = this.useModals.mArticuloCategoria

        this.showButtons()
    },
    methods: {
        showButtons() {
            if (this.modal.mode == 1) {
                this.buttons[0].show = true
            } else if (this.modal.mode == 2) {
                this.buttons[1].show = true
            }
        },

        checkDatos() {
            if (incompleteData(this.modal.articulo_categoria, ['nombre'])) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true)
            const res = await post(urls.articulo_categorias, this.modal.articulo_categoria)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            // this.useVistas.addItem('vArticuloCategorias', 'tableData', res.data)
            this.useVistas.vArticuloCategorias.loadTableData()
            this.useModals.show.mArticuloCategoria = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true)
            const res = await patch(urls.articulo_categorias, this.modal.articulo_categoria)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            // this.useVistas.updateItem('vArticuloCategorias', 'tableData', res.data)
            this.useVistas.vArticuloCategorias.loadTableData()
            this.useModals.show.mArticuloCategoria = false
        },

        async loadCategorias(txtBuscar) {
            const qry = {
                fltr: { activo: { op: 'Es', val: true } },
                cols: ['nombre'],
                sqls: ['categoria_nombre_completo'],
                ordr: [['categoria_nombre_completo', 'ASC']],
                limt: 25,
            }

            if (txtBuscar) {
                qry.fltr.nombre = { op: 'Contiene', val: txtBuscar }
            }

            const res = await get(`${urls.articulo_categorias}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return []

            return res.data
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 30rem;
    gap: 0.5rem;

    .container-foto {
        width: 20rem;
        height: 20rem;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }
}
</style>
