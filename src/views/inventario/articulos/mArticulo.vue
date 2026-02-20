<template>
    <JdModal modal="mArticulo" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="general-datos">
            <JdInput
                label="Nombre"
                :nec="true"
                v-model="modal.articulo.nombre"
                style="grid-column: 1/5"
            />

            <JdInput
                label="Código barras / EAN"
                v-model="modal.articulo.codigo_barra"
                style="grid-column: 1/4"
            />

            <JdSelect
                label="Tipo"
                :nec="true"
                :lista="modal.articulo_tipos || []"
                v-model="modal.articulo.type"
                style="grid-column: 1/3"
                @elegir="setArticuloType"
            />

            <JdCheckBox
                label="Se vende"
                :nec="true"
                v-model="modal.articulo.sale_ok"
                style="grid-column: 1/2"
            />

            <JdCheckBox
                label="Se compra"
                :nec="true"
                v-model="modal.articulo.purchase_ok"
                v-if="modal.articulo.type != 'combo'"
            />

            <JdCheckBox
                label="Se produce"
                :nec="true"
                v-model="modal.articulo.produce_ok"
                v-if="modal.articulo.type == 'consumable'"
            />

            <JdSwitch label="Activo?" v-model="modal.articulo.activo" />
        </div>

        <div class="extra-datos">
            <ul class="pestanas">
                <li @click="modal.pestana = 1" :class="{ 'pestana-activo': modal.pestana == 1 }">
                    General
                </li>

                <li
                    @click="modal.pestana = 2"
                    :class="{ 'pestana-activo': modal.pestana == 2 }"
                    v-if="modal.articulo.purchase_ok == true"
                >
                    Compra
                </li>

                <li
                    @click="modal.pestana = 3"
                    :class="{ 'pestana-activo': modal.pestana == 3 }"
                    v-if="modal.articulo.sale_ok == true"
                >
                    Venta
                </li>

                <li
                    @click="modal.pestana = 4"
                    :class="{ 'pestana-activo': modal.pestana == 4 }"
                    v-if="modal.articulo.type == 'consumable'"
                >
                    Inventario
                </li>

                <li
                    @click="modal.pestana = 5"
                    :class="{ 'pestana-activo': modal.pestana == 5 }"
                    v-if="modal.articulo.produce_ok == true"
                >
                    Producción
                </li>

                <li
                    @click="modal.pestana = 6"
                    :class="{ 'pestana-activo': modal.pestana == 6 }"
                    v-if="modal.articulo.type == 'combo'"
                >
                    Componentes
                </li>
            </ul>

            <div class="pestanas-body">
                <div class="container-datos" v-if="modal.pestana == 1">
                    <JdSelect
                        label="Tributo"
                        :nec="true"
                        v-model="modal.articulo.igv_afectacion"
                        :lista="modal.igv_afectaciones || []"
                    />

                    <JdSelect
                        label="Unidad"
                        :nec="true"
                        v-model="modal.articulo.unidad"
                        :lista="modal.unidades"
                        mostrar="nombre_completo"
                    />

                    <JdSelectQuery
                        label="Categoría"
                        :spin="modal.spin_articulo_categorias"
                        :lista="modal.articulo_categorias"
                        @search="loadCategorias"
                        v-model="modal.articulo.categoria"
                    />

                    <JdSelect
                        label="Tipo de materia prima"
                        :lista="modal.mp_tipos || []"
                        v-model="modal.articulo.mp_tipo"
                        v-if="modal.articulo.categoria == materiaprima_id"
                    />

                    <JdInput label="Marca" v-model="modal.articulo.marca" />
                </div>

                <mArticuloCompra v-if="modal.pestana == 2" />

                <mArticiloVenta v-if="modal.pestana == 3" />

                <div class="container-datos" v-if="modal.pestana == 4">
                    <JdSwitch label="Tiene fecha de vencimiento?" v-model="modal.articulo.has_fv" />
                </div>

                <div class="container-datos" v-if="modal.pestana == 5">
                    <JdSelectQuery
                        label="Tipo de producción"
                        :spin="modal.spin_articulo_lineas"
                        :lista="modal.articulo_lineas"
                        @search="loadLineas"
                        v-model="modal.articulo.linea"
                    />

                    <JdInput
                        label="Sobres en caja"
                        type="number"
                        v-model="modal.articulo.filtrantes"
                    />
                </div>

                <mArticuloComponentes v-if="modal.pestana == 6" />
            </div>
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSwitch, JdCheckBox, JdSelectQuery, JdSelect } from '@jhuler/components'

import mArticuloCompra from './mArticuloCompra.vue'
import mArticiloVenta from './mArticuloVenta.vue'
import mArticuloComponentes from './mArticuloComponentes.vue'

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
        JdCheckBox,
        JdSelectQuery,

        mArticiloVenta,
        mArticuloCompra,
        mArticuloComponentes,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        nuevo_componente: {},
        materiaprima_id: 'f000be66-e4b1-4334-b57a-0e356eb8c7a6',

        buttons: [
            { text: 'Grabar', action: 'crear', spin: false },
            { text: 'Actualizar', action: 'modificar', spin: false },
        ],
    }),
    created() {
        this.modal = this.useModals.mArticulo
        this.showButtons()

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
        async loadLineas(txtBuscar) {
            if (!txtBuscar) {
                this.modal.articulo_lineas.length = 0
                return
            }

            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
            }

            this.modal.articulo_lineas = []
            this.modal.spin_articulo_lineas = true
            const res = await get(`${urls.articulo_lineas}?qry=${JSON.stringify(qry)}`)
            this.modal.spin_articulo_lineas = false

            if (res.code != 0) return

            this.modal.articulo_lineas = res.data
        },
        async loadCategorias(txtBuscar) {
            if (!txtBuscar) {
                this.modal.articulo_categorias.length = 0
                return
            }

            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
            }

            this.modal.articulo_categorias = []
            this.modal.spin_articulo_categorias = true
            const res = await get(`${urls.articulo_categorias}?qry=${JSON.stringify(qry)}`)
            this.modal.spin_articulo_categorias = false

            if (res.code != 0) return

            this.modal.articulo_categorias = res.data
        },

        setArticuloType() {
            if (this.modal.articulo.type == 'combo') {
                this.modal.articulo.purchase_ok = false
                this.modal.articulo.produce_ok = false
            }

            if (this.modal.articulo.type == 'service') {
                this.modal.articulo.produce_ok = false
            }
        },

        checkDatos() {
            const props = ['nombre', 'type', 'igv_afectacion', 'unidad']

            if (this.modal.articulo.type == 'combo') {
                if (this.modal.articulo.combo_componentes.length == 0) {
                    jmsg('warning', 'Agregue al menos un componente')
                    return true
                }

                for (const a of this.modal.articulo.combo_componentes) {
                    if (incompleteData(a, ['articulo', 'cantidad'])) {
                        jmsg('warning', 'Ingrese los datos necesarios')
                        return true
                    }
                }
            }

            if (this.modal.articulo.sale_ok == true) {
                if (this.modal.articulo.is_ecommerce == true) {
                    props.push('descripcion', 'precio')
                }
            }

            // if (this.modal.articulo.produce_ok == true) {
            //     props.push('linea')
            // }

            if (incompleteData(this.modal.articulo, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        shapeDatos() {
            if (this.modal.articulo.type == 'combo') {
                this.modal.articulo.purchase_ok = false
            }

            // if (this.modal.articulo.tipo == 1) {
            //     this.modal.articulo.codigo_barra = null
            //     this.modal.articulo.linea = null
            //     this.modal.articulo.filtrantes = null
            // }

            // if (this.modal.articulo.linea == 2) {
            //     this.modal.articulo.filtrantes = null
            // }

            if (this.modal.articulo.precio_anterior == '') {
                this.modal.articulo.precio_anterior = null
            }

            // if (this.modal.mode == 2) {
            //     this.modal.articulo.dirty = {}
            //     const send = JSON.parse(JSON.stringify(this.modal.articulo))
            //     const { articulo_suppliers, ...articulo } = send

            //     this.modal.articulo.dirty.articulo = articulo !== this.modal.original.articulo

            //     this.modal.articulo.dirty.articulo_suppliers =
            //         articulo_suppliers !== this.modal.original.articulo_suppliers
            // }
        },
        async crear() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true)
            const res = await post(urls.articulos, this.modal.articulo)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem(
                this.modal.articulo.tipo == 1 ? 'vArticulos' : 'vProductosTerminados',
                'articulos',
                res.data,
            )
            this.useModals.show.mArticulo = false
        },
        async modificar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true)
            const res = await patch(urls.articulos, this.modal.articulo)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem(
                this.modal.articulo.tipo == 1 ? 'vArticulos' : 'vProductosTerminados',
                'articulos',
                res.data,
            )
            this.useModals.show.mArticulo = false
        },
    },
}
</script>

<style lang="scss" scoped>
.general-datos {
    display: grid;
    grid-template-columns: repeat(4, 12rem);
    gap: 0.5rem;
    margin-bottom: 2rem;
}

.extra-datos {
    border-top: var(--border);
    border-bottom: var(--border);

    .pestanas {
        display: flex;
        background-color: var(--bg-color2);

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
        padding: 1rem 0;

        .container-datos {
            display: grid;
            grid-template-columns: repeat(2, 24rem);
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
