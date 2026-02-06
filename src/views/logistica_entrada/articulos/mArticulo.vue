<template>
    <JdModal modal="mArticulo" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput
                label="Nombre"
                :nec="true"
                v-model="articulo.nombre"
                style="grid-column: 1/5"
            />

            <JdInput
                label="Código barras / EAN"
                v-model="articulo.codigo_barra"
                style="grid-column: 1/4"
            />

            <JdSelect
                label="Tipo"
                :nec="true"
                :lista="modal.articulo_tipos || []"
                v-model="articulo.type"
                style="grid-column: 1/3"
                @elegir="setArticuloType"
            />

            <JdCheckBox
                label="Se vende"
                :nec="true"
                v-model="articulo.sale_ok"
                style="grid-column: 1/2"
            />

            <JdCheckBox
                label="Se compra"
                :nec="true"
                v-model="articulo.purchase_ok"
                v-if="articulo.type != 'combo'"
            />

            <JdSwitch label="Activo?" v-model="articulo.activo" style="grid-column: 4/5" />
        </div>

        <div class="extra-datos">
            <ul class="pestanas">
                <li @click="modal.pestana = 1" :class="{ 'pestana-activo': modal.pestana == 1 }">
                    General
                </li>

                <li
                    @click="modal.pestana = 2"
                    :class="{ 'pestana-activo': modal.pestana == 2 }"
                    v-if="articulo.purchase_ok == true"
                >
                    Compra
                </li>

                <li
                    @click="modal.pestana = 3"
                    :class="{ 'pestana-activo': modal.pestana == 3 }"
                    v-if="articulo.sale_ok == true"
                >
                    Venta
                </li>

                <li
                    @click="modal.pestana = 4"
                    :class="{ 'pestana-activo': modal.pestana == 4 }"
                    v-if="articulo.type == 'consumable'"
                >
                    Inventario
                </li>

                <li
                    @click="modal.pestana = 5"
                    :class="{ 'pestana-activo': modal.pestana == 5 }"
                    v-if="articulo.type == 'consumable'"
                >
                    Producción
                </li>

                <li
                    @click="modal.pestana = 6"
                    :class="{ 'pestana-activo': modal.pestana == 6 }"
                    v-if="articulo.type == 'combo'"
                >
                    Componentes
                </li>
            </ul>

            <div class="pestanas-body">
                <div class="container-datos general" v-if="modal.pestana == 1">
                    <JdSelect
                        label="Tributo"
                        :nec="true"
                        v-model="articulo.igv_afectacion"
                        :lista="modal.igv_afectaciones || []"
                    />

                    <JdSelect
                        label="Unidad"
                        :nec="true"
                        v-model="articulo.unidad"
                        :lista="modal.unidades"
                        mostrar="nombre_completo"
                    />

                    <JdSelect
                        label="Categoría"
                        :lista="modal.articulo_categorias || []"
                        v-model="articulo.categoria"
                    />

                    <JdSelect
                        label="Tipo de materia prima"
                        :lista="modal.mp_tipos || []"
                        v-model="articulo.mp_tipo"
                        v-if="articulo.categoria == materiaprima_id"
                    />

                    <JdInput label="Marca" v-model="articulo.marca" />
                </div>

                <div class="container-datos compra" v-if="modal.pestana == 2"></div>

                <div class="container-datos venta" v-if="modal.pestana == 3">
                    <JdInput
                        label="Precio de venta/lista"
                        type="number"
                        v-model="articulo.list_price"
                    />

                    <JdCheckBox label="Mostrar en ecommerce" v-model="articulo.is_ecommerce" />

                    <template v-if="articulo.is_ecommerce == true">
                        <div class="mrg-top1" style="grid-column: 1/3">
                            <strong>--- Datos para el ecommerce ---</strong>
                        </div>

                        <JdTextArea
                            label="Descripción"
                            :nec="true"
                            v-model="articulo.descripcion"
                            :disabled="modal.mode == 3"
                            style="grid-column: 1/3"
                        />

                        <JdInput
                            label="Precio de venta"
                            :nec="true"
                            type="number"
                            v-model="articulo.precio"
                        />

                        <JdInput
                            label="Precio anterior"
                            type="number"
                            v-model="articulo.precio_anterior"
                        />

                        <JdInput
                            label="Contenido neto (g)"
                            type="number"
                            v-model="articulo.contenido_neto"
                        />

                        <JdInput
                            label="Dimenciones"
                            v-model="articulo.dimenciones"
                            placeholder="largo x ancho x alto mm"
                        />

                        <JdInput
                            label="Tipo de envase"
                            v-model="articulo.envase_tipo"
                            placeholder="CAJA, BOLSA"
                        />

                        <JdCheckBox label="Destacado" v-model="articulo.is_destacado" />

                        <div style="grid-column: 1/3">
                            <div class="container-anadir">
                                <JdButton
                                    text="Añadir"
                                    tipo="2"
                                    :small="true"
                                    @click="addNewIngrediente"
                                />
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

                        <div style="grid-column: 1/3">
                            <div class="container-anadir">
                                <JdButton
                                    text="Añadir"
                                    tipo="2"
                                    :small="true"
                                    @click="addNewBeneficio"
                                />
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
                    </template>
                </div>

                <div class="container-datos inventario" v-if="modal.pestana == 4">
                    <JdSwitch label="Tiene fecha de vencimiento?" v-model="articulo.has_fv" />
                </div>

                <div class="container-datos produccion" v-if="modal.pestana == 5">
                    <JdSelect
                        label="Tipo de producción"
                        v-model="articulo.linea"
                        :lista="modal.articulo_lineas"
                    />

                    <JdInput label="Sobres en caja" type="number" v-model="articulo.filtrantes" />
                </div>

                <div class="container-datos componentes" v-if="modal.pestana == 6">
                    <!-- <div class="agregar" style="grid-column: 1/3"> -->
                    <JdSelectQuery
                        label="Artículo"
                        :nec="true"
                        v-model="nuevo_componente.articulo"
                        :spin="modal.spin_articulos_consumables"
                        :lista="modal.articulos_consumables"
                        @search="load_articulos_consumables"
                        @elegir="setComponenteNuevo"
                        style="grid-column: 1/3"
                    />

                    <JdInput
                        type="number"
                        label="Cantidad"
                        :nec="true"
                        v-model="nuevo_componente.cantidad"
                        style="grid-column: 1/2"
                    />

                    <JdButton text="Agregar" tipo="2" @click="addComponente" />
                    <!-- </div> -->

                    <JdTable
                        :columns="columns_componentes"
                        :datos="articulo.combo_articulos || []"
                        :seeker="false"
                        :colAct="true"
                        :download="false"
                        style="grid-column: 1/3"
                    >
                        <template v-slot:cAction="{ item }">
                            <JdButton
                                tipo="2"
                                :small="true"
                                icon="fa-solid fa-trash-can"
                                title="Eliminar"
                                @click="quitar(item)"
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
    JdCheckBox,
    JdSelectQuery,
} from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post, patch, get } from '@/utils/crud'
import { incompleteData, genCorrelativo } from '@/utils/mine'
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
        JdCheckBox,
        JdSelectQuery,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        nuevo_componente: {},
        materiaprima_id: 'f000be66-e4b1-4334-b57a-0e356eb8c7a6',

        articulo: {},

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

        columns_componentes: [
            {
                id: 'articulo',
                title: 'Artículo',
                prop: 'articulo1.nombre',
                width: '25rem',
                show: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                type: 'number',
                input: true,
                width: '6rem',
                show: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mArticulo
        this.articulo = this.useModals.mArticulo.articulo

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

        async loadDatosSistema() {
            const qry = ['igv_afectaciones', 'unidades', 'mp_tipos', 'articulo_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },
        async loadLineas() {
            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
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
                ordr: [['nombre', 'ASC']],
            }

            this.modal.articulo_categorias = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_categorias}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.articulo_categorias = res.data
        },
        async load_articulos_consumables(txtBuscar) {
            if (!txtBuscar) {
                this.modal.articulos_consumables.length = 0
                return
            }

            const qry = {
                fltr: {
                    type: { op: 'Es', val: 'consumable' },
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['nombre', 'unidad', 'igv_afectacion', 'has_fv'],
                ordr: [['nombre', 'ASC']],
            }

            this.modal.spin_articulos_consumables = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.modal.spin_articulos_consumables = false

            if (res.code !== 0) return

            this.modal.articulos_consumables = JSON.parse(JSON.stringify(res.data))
        },

        setArticuloType() {
            if (this.articulo.type == 'combo') {
                this.articulo.purchase_ok = false
            }
        },

        //--- COMBO ---//
        setComponenteNuevo(a) {
            if (a == null) {
                this.nuevo_componente = {}
            } else {
                this.nuevo_componente.nombre = a.nombre
                this.nuevo_componente.unidad = a.unidad
            }
        },
        async addComponente() {
            if (this.nuevo_componente.articulo == null || this.nuevo_componente.cantidad == null) {
                return jmsg('warning', 'Selecciona un artículo e ingrese la cantidad')
            }

            const i = this.articulo.combo_articulos.findIndex(
                (a) => a.articulo == this.nuevo_componente.articulo,
            )
            if (i !== -1) return jmsg('warning', 'El artículo ya está agregado')

            this.articulo.combo_articulos.push({
                id: crypto.randomUUID(),
                orden: genCorrelativo(this.articulo.combo_articulos),
                articulo: this.nuevo_componente.articulo,
                cantidad: this.nuevo_componente.cantidad,
                articulo1: {
                    nombre: this.nuevo_componente.nombre,
                    unidad: this.nuevo_componente.unidad,
                },
            })

            this.nuevo_componente = {}
        },
        async removeComponente(item) {
            const i = this.articulo.combo_articulos.findIndex((a) => a.articulo == item.articulo)
            this.articulo.combo_articulos.splice(i, 1)
        },

        //--- ECOMMERCE ---//
        addNewIngrediente() {
            this.articulo.ingredientes.push({
                id: crypto.randomUUID(),
            })
        },
        removeIngrediente(item) {
            this.articulo.ingredientes = this.articulo.ingredientes.filter((a) => a.id != item.id)
        },
        addNewBeneficio() {
            this.articulo.beneficios.push({
                id: crypto.randomUUID(),
            })
        },
        removeBeneficio(item) {
            this.articulo.beneficios = this.articulo.beneficios.filter((a) => a.id != item.id)
        },

        checkDatos() {
            const props = ['nombre', 'type', 'igv_afectacion', 'unidad']

            if (this.articulo.type == 'combo') {
                if (this.articulo.combo_articulos.length == 0) {
                    jmsg('warning', 'Agregue al menos un componente')
                    return true
                }

                for (const a of this.articulo.combo_articulos) {
                    if (incompleteData(a, ['articulo', 'cantidad'])) {
                        jmsg('warning', 'Ingrese los datos necesarios')
                        return true
                    }
                }
            }

            if (this.articulo.sale_ok == true) {
                if (this.articulo.is_ecommerce == true) {
                    props.push('descripcion', 'precio')
                }
            }

            if (incompleteData(this.articulo, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        shapeDatos() {
            if (this.articulo.type == 'combo') {
                this.articulo.purchase_ok = false
            }

            // if (this.articulo.tipo == 1) {
            //     this.articulo.codigo_barra = null
            //     this.articulo.linea = null
            //     this.articulo.filtrantes = null
            // }

            // if (this.articulo.linea == 2) {
            //     this.articulo.filtrantes = null
            // }

            // if (this.articulo.precio_anterior == '') {
            //     this.articulo.precio_anterior = null
            // }
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
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: repeat(4, 12rem);
    gap: 0.5rem;
    margin-bottom: 2rem;
}

.extra-datos {
    .pestanas {
        display: flex;
        background-color: var(--bg-color2);
        margin-bottom: 1rem;

        li {
            padding: 0.3rem 0.5rem;
            font-size: 0.8rem;
            cursor: pointer;
        }

        .pestana-activo {
            background-color: var(--bg-color);
        }
    }

    .pestanas-body {
        .container-datos {
            display: grid;
            gap: 0.5rem;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem 2rem;
        }

        .venta {
            .container-anadir {
                display: flex;
                justify-content: end;
            }
        }
    }
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
