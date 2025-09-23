<template>
    <JdModal modal="mArticulo" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdSelect
                label="Tipo de producción"
                :nec="true"
                v-model="articulo.produccion_tipo"
                :lista="modal.produccion_tipos"
                v-if="articulo.tipo == 2"
                style="grid-column: 1/3"
            />

            <JdInput
                label="Sobres en caja"
                type="number"
                :nec="true"
                v-model="articulo.filtrantes"
                v-if="articulo.tipo == 2 && [1, 3, '1', '3'].includes(articulo.produccion_tipo)"
                style="grid-column: 3/5"
            />

            <JdSelect
                label="Categoria"
                :nec="true"
                :lista="modal.articulo_categorias || []"
                v-model="articulo.categoria"
                style="grid-column: 1/4"
            />

            <JdInput
                label="EAN"
                :nec="true"
                v-model="articulo.codigo_barra"
                style="grid-column: 1/4"
                v-if="articulo.tipo == 2"
            />

            <JdInput
                label="Nombre"
                :nec="true"
                v-model="articulo.nombre"
                style="grid-column: 1/5"
            />

            <JdSelect
                label="Unidad"
                :nec="true"
                v-model="articulo.unidad"
                :lista="modal.unidades"
                mostrar="nombre_completo"
                style="grid-column: 1/3"
            />

            <JdInput
                label="Contenido neto"
                type="number"
                v-model="articulo.contenido_neto"
                v-if="articulo.tipo == 2"
                style="grid-column: 3/5"
            />

            <JdInput
                label="Marca"
                v-model="articulo.marca"
                v-if="articulo.tipo == 2"
                style="grid-column: 1/3"
            />

            <JdSelect
                label="Tributo"
                :nec="true"
                v-model="articulo.igv_afectacion"
                :lista="modal.igv_afectaciones || []"
                style="grid-column: 1/4"
            />

            <JdSwitch
                label="Tiene fecha de vencimiento?"
                v-model="articulo.has_fv"
                style="grid-column: 1/3"
            />
            <!-- <JdSwitch label="Se vende?" v-model="articulo.vende" style="grid-column: 1/3;" v-if="articulo.tipo == 1" /> -->
            <JdSwitch label="Activo?" v-model="articulo.activo" style="grid-column: 1/3" />
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSelect, JdSwitch } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post, patch, get } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdSwitch,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        articulo: {},

        buttons: [
            { text: 'Grabar', action: 'crear', spin: false },
            { text: 'Actualizar', action: 'modificar', spin: false },
        ],
    }),
    created() {
        this.modal = this.useModals.mArticulo
        this.articulo = this.useModals.mArticulo.item

        this.showButtons()

        this.loadCategorias()
        this.loadDatosSistema()
    },
    methods: {
        showButtons() {
            if (this.useModals.mArticulo.mode == 1) {
                this.buttons[0].show = true
            } else {
                this.buttons[1].show = true
            }
        },

        async loadCategorias() {
            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: this.articulo.tipo },
                    activo: { op: 'Es', val: true },
                },
            }

            this.modal.articulo_categorias = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_categorias}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.articulo_categorias = res.data
        },
        async loadDatosSistema() {
            const qry = ['produccion_tipos', 'igv_afectaciones', 'unidades']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },

        checkDatos() {
            const props = ['tipo', 'categoria', 'nombre', 'unidad', 'igv_afectacion']

            if (this.articulo.tipo == 2) props.push('codigo_barra', 'produccion_tipo')

            if (this.articulo.tipo == 2 && this.articulo.produccion_tipo != 2)
                props.push('filtrantes')

            if (incompleteData(this.articulo, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            // SHAPE DATOS
            if (this.articulo.tipo == 1) {
                this.articulo.codigo_barra = null
                this.articulo.produccion_tipo = null
                this.articulo.filtrantes = null
            }

            if (this.articulo.produccion_tipo == 2) {
                this.articulo.filtrantes = null
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.buttons[0].spin = true
            const res = await post(urls.articulos, this.articulo)
            this.buttons[0].spin = false

            if (res.code != 0) return

            this.useVistas.addItem(
                this.articulo.tipo == 1 ? 'vArticulos' : 'vProductosTerminados',
                'articulos',
                res.data,
            )
            this.useModals.show.mArticulo = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.buttons[1].spin = true
            const res = await patch(urls.articulos, this.articulo)
            this.buttons[1].spin = false

            if (res.code != 0) return

            this.useVistas.updateItem(
                this.articulo.tipo == 1 ? 'vArticulos' : 'vProductosTerminados',
                'articulos',
                res.data,
            )
            this.useModals.show.mArticulo = false
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: repeat(4, 10rem);
    gap: 0.5rem;
}

@media (max-width: 540px) {
    .container-datos {
        grid-template-columns: minmax(100%, 33.5rem) !important;

        > * {
            grid-column: 1/2 !important;
        }
    }
}
</style>
