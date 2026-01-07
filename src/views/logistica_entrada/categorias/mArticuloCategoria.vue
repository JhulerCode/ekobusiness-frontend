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
                v-model="articulo_categoria.nombre"
                :disabled="modal.mode == 3"
            />

            <JdTextArea
                label="Descripción"
                v-model="articulo_categoria.descripcion"
                :disabled="modal.mode == 3"
            />

            <JdSwitch
                label="Activo"
                v-model="articulo_categoria.activo"
                :disabled="modal.mode == 3"
            />

            <template v-if="articulo_categoria.tipo == 2">
                <JdSwitch
                    label="Ecommerce?"
                    v-model="articulo_categoria.is_ecommerce"
                    :disabled="modal.mode == 3"
                />

                <JdSwitch
                    label="Destacado"
                    v-model="articulo_categoria.is_destacado"
                    :disabled="modal.mode == 3"
                />
            </template>
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdTextArea, JdSwitch } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdTextArea,
        JdSwitch,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        urls,

        modal: {},
        articulo_categoria: {},

        buttons: [
            { text: 'Grabar', action: 'crear', spin: false },
            { text: 'Actualizar', action: 'modificar', spin: false },
        ],
    }),
    created() {
        this.modal = this.useModals.mArticuloCategoria
        this.articulo_categoria = this.useModals.mArticuloCategoria.item

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
            if (incompleteData(this.articulo_categoria, ['tipo', 'nombre'])) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true)
            const res = await post(urls.articulo_categorias, this.articulo_categoria)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem(
                this.articulo_categoria.tipo == 1 ? 'vArticuloCategorias' : 'vProductoCategorias',
                'articulo_categorias',
                res.data,
            )
            this.useModals.show.mArticuloCategoria = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true)
            const res = await patch(urls.articulo_categorias, this.articulo_categoria)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem(
                this.articulo_categoria.tipo == 1 ? 'vArticuloCategorias' : 'vProductoCategorias',
                'articulo_categorias',
                res.data,
            )
            this.useModals.show.mArticuloCategoria = false
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
