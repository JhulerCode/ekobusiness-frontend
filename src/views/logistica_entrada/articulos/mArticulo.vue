<template>
    <JdModal modal="mArticulo" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="two-cols">
            <div class="container-datos">
                <JdSelect
                    label="Tipo de producción"
                    :nec="true"
                    v-model="articulo.produccion_tipo"
                    :lista="modal.articulo_lineas"
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
                    label="Contenido neto (g)"
                    type="number"
                    :nec="true"
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

                <JdSelect
                    label="Tipo de materia prima"
                    :nec="true"
                    :lista="modal.mp_tipos || []"
                    v-model="articulo.mp_tipo"
                    style="grid-column: 1/4"
                    v-if="articulo.is_ecommerce == true && articulo.categoria == materiaprima_id"
                />

                <JdSwitch
                    label="Tiene fecha de vencimiento?"
                    v-model="articulo.has_fv"
                    style="grid-column: 1/3"
                />

                <JdSwitch label="Activo?" v-model="articulo.activo" style="grid-column: 1/3" />

                <JdSwitch
                    label="Mostrar en tienda online"
                    v-model="articulo.is_ecommerce"
                    style="grid-column: 1/3"
                    v-if="articulo.tipo == 2 || articulo.categoria == materiaprima_id"
                />

                <small style="grid-column: 1/3">{{ articulo.id }}</small>
            </div>

            <div
                class="container-datos2"
                v-if="articulo.is_ecommerce == true && articulo.tipo == 2"
            >
                <strong>--- Datos para la tienda online ---</strong>

                <JdTextArea
                    label="Descripción"
                    :nec="true"
                    v-model="articulo.descripcion"
                    :disabled="modal.mode == 3"
                />

                <JdInput
                    label="Precio de venta"
                    :nec="true"
                    type="number"
                    v-model="articulo.precio"
                />

                <JdInput label="Precio anterior" type="number" v-model="articulo.precio_anterior" />

                <JdInput
                    label="Dimenciones"
                    :nec="true"
                    v-model="articulo.dimenciones"
                    placeholder="80 × 64 × 130 mm"
                />

                <JdInput
                    label="Tipo de envase"
                    :nec="true"
                    v-model="articulo.envase_tipo"
                    placeholder="CAJA"
                />

                <JdSwitch label="Es destacado?" v-model="articulo.is_destacado" />

                <div>
                    <div class="container-anadir">
                        <JdButton text="Añadir" tipo="2" :small="true" @click="addNewIngrediente" />
                    </div>
                    <JdTable
                        :columns="columnsIngredientes"
                        :datos="articulo.ingredientes"
                        :seeker="false"
                        :download="false"
                        :colAct="true"
                    >
                        <template v-slot:cAction="{ item }">
                            <JdButton
                                icon="fa-solid fa-trash"
                                title="Eliminar"
                                tipo="2"
                                :small="true"
                                @click="removeIngrediente(item)"
                            />
                        </template>
                    </JdTable>
                </div>

                <div>
                    <div class="container-anadir">
                        <JdButton text="Añadir" tipo="2" :small="true" @click="addNewBeneficio" />
                    </div>
                    <JdTable
                        :columns="columnsBeneficios"
                        :datos="articulo.beneficios"
                        :seeker="false"
                        :download="false"
                        :colAct="true"
                    >
                        <template v-slot:cAction="{ item }">
                            <JdButton
                                icon="fa-solid fa-trash"
                                title="Eliminar"
                                tipo="2"
                                :small="true"
                                @click="removeBeneficio(item)"
                            />
                        </template>
                    </JdTable>
                </div>
            </div>
        </div>
    </JdModal>
</template>

<script>
import {
    JdModal,
    JdInput,
    JdSelect,
    JdSwitch,
    JdTextArea,
    JdTable,
    JdButton,
} from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post, patch, get } from '@/utils/crud'
import { incompleteData, genId } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdTextArea,
        JdSwitch,
        JdTable,
        JdButton,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        articulo: {},
        materiaprima_id: 'f000be66-e4b1-4334-b57a-0e356eb8c7a6',

        buttons: [
            { text: 'Grabar', action: 'crear', spin: false },
            { text: 'Actualizar', action: 'modificar', spin: false },
        ],

        columnsIngredientes: [
            {
                id: 'nombre',
                title: 'Ingredientes',
                width: '25rem',
                input: true,
                type: 'longtext',
                show: true,
                sort: true,
            },
        ],
        columnsBeneficios: [
            {
                id: 'nombre',
                title: 'Beneficios',
                width: '25rem',
                input: true,
                type: 'longtext',
                show: true,
                sort: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mArticulo
        this.articulo = this.useModals.mArticulo.item

        this.showButtons()

        this.loadLineas()
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

        async loadLineas() {
            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                },
            }

            this.modal.articulo_lineas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_lineas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.articulo_lineas = res.data
        },
        async loadCategorias() {
            const qry = {
                cols: ['nombre'],
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
            const qry = ['igv_afectaciones', 'unidades', 'mp_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },

        checkDatos() {
            const props = ['tipo', 'categoria', 'nombre', 'unidad', 'igv_afectacion']

            if (this.articulo.tipo == 1) {
                if (this.articulo.is_ecommerce == true) {
                    if (this.articulo.categoria == this.materiaprima_id) {
                        props.push('mp_tipo')
                    }
                }
            }

            if (this.articulo.tipo == 2) {
                props.push('codigo_barra', 'produccion_tipo', 'contenido_neto')

                if (this.articulo.produccion_tipo == 1 || this.articulo.produccion_tipo == 3) {
                    props.push('filtrantes')
                }

                if (this.articulo.is_ecommerce == true) {
                    props.push('descripcion', 'precio', 'dimenciones', 'envase_tipo')

                    if (this.articulo.ingredientes.length == 0) {
                        jmsg('warning', 'Ingrese al menos un ingrediente')
                        return true
                    }

                    if (this.articulo.beneficios.length == 0) {
                        jmsg('warning', 'Ingrese al menos un beneficio')
                        return true
                    }
                }
            }

            if (incompleteData(this.articulo, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        shapeDatos() {
            if (this.articulo.tipo == 1) {
                this.articulo.codigo_barra = null
                this.articulo.produccion_tipo = null
                this.articulo.filtrantes = null
            }

            if (this.articulo.produccion_tipo == 2) {
                this.articulo.filtrantes = null
            }

            if (this.articulo.precio_anterior == '') {
                this.articulo.precio_anterior = null
            }
        },
        async crear() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true)
            const res = await post(urls.articulos, this.articulo)
            this.useAuth.setLoading(false)

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
            this.shapeDatos()

            this.useAuth.setLoading(true)
            const res = await patch(urls.articulos, this.articulo)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem(
                this.articulo.tipo == 1 ? 'vArticulos' : 'vProductosTerminados',
                'articulos',
                res.data,
            )
            this.useModals.show.mArticulo = false
        },

        addNewIngrediente() {
            this.articulo.ingredientes.push({
                id: genId(),
            })
        },
        removeIngrediente(item) {
            this.articulo.ingredientes = this.articulo.ingredientes.filter((a) => a.id != item.id)
        },
        addNewBeneficio() {
            this.articulo.beneficios.push({
                id: genId(),
            })
        },
        removeBeneficio(item) {
            this.articulo.beneficios = this.articulo.beneficios.filter((a) => a.id != item.id)
        },
    },
}
</script>

<style lang="scss" scoped>
.two-cols {
    display: flex;
    gap: 3rem;
}

.container-datos {
    display: grid;
    grid-template-columns: repeat(4, 10rem);
    gap: 0.5rem;
    height: fit-content;
}

.container-datos2 {
    display: grid;
    grid-template-columns: 30rem;
    gap: 0.5rem;
    height: fit-content;
}

.container-anadir {
    display: flex;
    justify-content: end;
}

@media (max-width: 540px) {
    .two-cols {
        flex-direction: column;
    }

    .container-datos,
    .container-datos2 {
        grid-template-columns: minmax(100%, 33.5rem) !important;

        > * {
            grid-column: 1/2 !important;
        }
    }
}
</style>
