<template>
    <JdModal modal="mCombo" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdSelect
                label="Categoria"
                :nec="true"
                :lista="modal.articulo_categorias || []"
                v-model="articulo.categoria"
                style="grid-column: 1/4"
            />

            <!-- <JdInput label="Código interno" v-model="articulo.codigo" style="grid-column: 1/4;" /> -->

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

            <JdSelect
                label="Tributo"
                :nec="true"
                v-model="articulo.igv_afectacion"
                :lista="modal.igv_afectaciones || []"
                style="grid-column: 1/4"
            />

            <JdSwitch label="Activo?" v-model="articulo.activo" style="grid-column: 1/3" />
        </div>

        <div class="agregar">
            <strong style="grid-column: 1/5">--- Componentes ---</strong>
            <JdSelectQuery
                label="Artículo"
                :nec="true"
                v-model="nuevo.articulo"
                :spin="spinArticulos"
                :lista="modal.articulos"
                @search="searchArticulos"
                @elegir="setArticulo"
                style="grid-column: 1/5"
            />

            <JdInput
                type="number"
                label="Cantidad"
                :nec="true"
                v-model="nuevo.cantidad"
                style="grid-column: 1/3"
            />

            <JdButton text="Agregar" tipo="2" @click="addArticulo" />
        </div>

        <JdTable
            :columns="columns"
            :datos="articulo.combo_articulos || []"
            :seeker="false"
            :colAct="true"
            :download="false"
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
    </JdModal>
</template>

<script>
import {
    JdModal,
    JdInput,
    JdSelect,
    JdSwitch,
    JdSelectQuery,
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
        JdSelectQuery,
        JdButton,
        JdSwitch,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        articulo: {},

        nuevo: {},
        spinArticulos: false,

        buttons: [
            { text: 'Grabar', action: 'crear', spin: false },
            { text: 'Actualizar', action: 'modificar', spin: false },
        ],

        columns: [
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
        this.modal = this.useModals.mCombo
        this.articulo = this.useModals.mCombo.item

        this.showButtons()

        this.loadCategorias()
        this.loadDatosSistema()
    },
    methods: {
        showButtons() {
            if (this.useModals.mCombo.mode == 1) {
                this.buttons[0].show = true
            } else {
                this.buttons[1].show = true
            }
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
        async loadDatosSistema() {
            const qry = ['igv_afectaciones', 'unidades']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },

        async searchArticulos(txtBuscar) {
            if (!txtBuscar) {
                this.modal.articulos.length = 0
                return
            }

            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: 2 },
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['nombre', 'unidad', 'igv_afectacion', 'has_fv'],
                ordr: [['nombre', 'ASC']],
            }

            this.spinArticulos = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.spinArticulos = false

            if (res.code !== 0) return

            this.modal.articulos = JSON.parse(JSON.stringify(res.data))
        },
        setArticulo(a) {
            if (a == null) {
                this.nuevo = {}
            } else {
                this.nuevo.nombre = a.nombre
                this.nuevo.unidad = a.unidad
            }
        },
        async addArticulo() {
            if (this.nuevo.articulo == null || this.nuevo.cantidad == null)
                return jmsg('warning', 'Selecciona un artículo e ingrese la cantidad')

            const i = this.articulo.combo_articulos.findIndex(
                (a) => a.articulo == this.nuevo.articulo,
            )
            if (i !== -1) return jmsg('warning', 'El artículo ya está agregado')

            this.articulo.combo_articulos.push({
                id: genId(this.articulo.combo_articulos),
                articulo: this.nuevo.articulo,
                articulo1: { nombre: this.nuevo.nombre },
                cantidad: this.nuevo.cantidad,
            })

            this.nuevo = {}
        },
        async quitar(item) {
            const i = this.articulo.combo_articulos.findIndex((a) => a.articulo == item.articulo)
            this.articulo.combo_articulos.splice(i, 1)
        },

        checkDatos() {
            const props = ['tipo', 'categoria', 'nombre', 'igv_afectacion', 'codigo_barra']

            if (incompleteData(this.articulo, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            if (this.articulo.combo_articulos.length == 0) {
                jmsg('warning', 'Agregue al menos un artículo al combo')
                return true
            }

            for (const a of this.articulo.combo_articulos) {
                if (incompleteData(a, ['articulo', 'cantidad'])) {
                    jmsg('warning', 'Ingrese los datos necesarios de los artículos')
                    return true
                }
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true)
            const res = await post(urls.articulos, this.articulo)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem('vProductosTerminados', 'articulos', res.data)
            this.useModals.show.mCombo = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true)
            const res = await patch(urls.articulos, this.articulo)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vProductosTerminados', 'articulos', res.data)
            this.useModals.show.mCombo = false
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

.agregar {
    display: grid;
    grid-template-columns: repeat(4, 10rem);
    gap: 0.5rem;
    margin-bottom: 1rem;
    margin-top: 2rem;
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
