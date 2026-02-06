<template>
    <JdModal modal="mMrpBom" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="datos-generales">
            <JdSelectQuery
                label="Artículo"
                :nec="true"
                v-model="modal.mrp_bom.articulo"
                :spin="modal.spin_articulos_fabricables"
                :lista="modal.articulos_fabricables"
                @search="loadArticulosFabricables"
                style="grid-column: 1/5"
            />

            <JdSelect
                label="Tipo"
                :nec="true"
                v-model="modal.mrp_bom.tipo"
                :lista="modal.mrp_bom_tipos"
                style="grid-column: 1/3"
            />
        </div>

        <div class="agregar" v-if="useAuth.verifyPermiso('vMrpBom:editar')">
            <strong>Componentes</strong>

            <JdSelectQuery
                label="Componente"
                :nec="true"
                v-model="nuevo.articulo"
                :spin="modal.spin_articulos"
                :lista="modal.articulos || []"
                @search="loadArticulosConsumables"
                @elegir="setComponenteNuevo"
                style="grid-column: 1/5"
            />

            <JdInput
                type="number"
                label="Cantidad"
                :nec="true"
                v-model="nuevo.cantidad"
                style="grid-column: 1/3"
            />

            <JdButton text="Agregar" @click="addLine" />
        </div>

        <JdTable
            :columns="columns"
            :datos="modal.mrp_bom.mrp_bom_lines || []"
            :seeker="false"
            :download="false"
            :colAct="true"
            :reload="loadReceta"
            class="jd-table"
            @onChange="(action, a) => this[action](a)"
            :inputsDisabled="!this.useAuth.verifyPermiso('vReceta:editar')"
        >
            <template v-slot:cAction="{ item }">
                <JdButton
                    :small="true"
                    tipo="2"
                    icon="fa-solid fa-trash-can"
                    title="Eliminar"
                    @click="removeLine(item)"
                    v-if="this.useAuth.verifyPermiso('vReceta:eliminar')"
                />
            </template>

            <template v-slot:cOrden="{ item }">
                <div class="acts">
                    <JdButton
                        icon="fa-solid fa-angle-down"
                        :small="true"
                        tipo="2"
                        @click="reorderLine(item, 1)"
                        v-if="item.orden != modal.mrp_bom.mrp_bom_lines.length"
                    />

                    <span v-else></span>

                    <JdButton
                        icon="fa-solid fa-angle-up"
                        :small="true"
                        tipo="2"
                        @click="reorderLine(item, 2)"
                        v-if="item.orden != 1"
                    />
                </div>
            </template>
        </JdTable>
    </JdModal>
</template>

<script>
import { JdModal, JdSelect, JdTable, JdButton, JdInput, JdSelectQuery } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch } from '@/utils/crud'
import { jmsg } from '@/utils/swal'
import { genCorrelativo, incompleteData } from '@/utils/mine'

export default {
    components: {
        JdModal,
        JdSelect,
        JdSelectQuery,
        JdInput,
        JdButton,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        nuevo: {},

        columns: [
            {
                id: 'orden',
                title: 'Ordenar',
                slot: 'cOrden',
                width: '5rem',
                show: true,
            },
            {
                id: 'articulo',
                title: 'Componente',
                prop: 'articulo1.nombre',
                width: '25rem',
                show: true,
            },
            {
                id: 'unidad',
                title: 'Unidad',
                prop: 'articulo1.unidad',
                width: '5rem',
                show: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                toRight: true,
                input: true,
                type: 'number',
                onchange: 'modificar',
                width: '6rem',
                show: true,
            },
        ],

        buttons: [
            { text: 'Grabar', action: 'crear' },
            { text: 'Actualizar', action: 'modificar' },
        ],
    }),
    created() {
        this.modal = this.useModals.mMrpBom

        if (this.useAuth.verifyPermiso('vReceta:editar') == false) this.columns[0].show = false

        this.showButtons()

        this.loadDatosSistema()
    },
    methods: {
        showButtons() {
            if (this.modal.mode == 1) {
                this.buttons[0].show = true
            } else if (this.modal.mode == 2) {
                this.buttons[1].show = true
            }
        },

        async loadArticulosFabricables(txtBuscar) {
            if (!txtBuscar) {
                this.modal.articulos_fabricables.length = 0
                return
            }

            const qry = {
                fltr: {
                    type: { op: 'Es', val: 'consumable' },
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['nombre', 'unidad'],
                ordr: [['nombre', 'ASC']],
            }

            this.modal.spin_articulos_fabricables = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.modal.spin_articulos_fabricables = false

            if (res.code !== 0) return

            this.modal.articulos_fabricables = JSON.parse(JSON.stringify(res.data))
        },
        async loadArticulosConsumables(txtBuscar) {
            if (!txtBuscar) {
                this.modal.articulos.length = 0
                return
            }

            const qry = {
                fltr: {
                    type: { op: 'Es', val: 'consumable' },
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['nombre', 'unidad'],
                ordr: [['nombre', 'ASC']],
            }

            this.modal.spin_articulos = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.modal.spin_articulos = false

            if (res.code !== 0) return

            this.modal.articulos = JSON.parse(JSON.stringify(res.data))
        },
        async loadDatosSistema() {
            const qry = ['mrp_bom_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },

        addLine() {
            if (this.nuevo.articulo == null || this.nuevo.cantidad == null) {
                return jmsg('warning', 'Selecciona un artículo e ingrese la cantidad')
            }

            const i = this.modal.mrp_bom.mrp_bom_lines.findIndex(
                (a) => a.articulo == this.nuevo.articulo,
            )
            if (i !== -1) return jmsg('warning', 'El artículo ya está agregado')

            this.modal.mrp_bom.mrp_bom_lines.push({
                orden: genCorrelativo(this.modal.mrp_bom.mrp_bom_lines),
                articulo: this.nuevo.articulo,
                cantidad: this.nuevo.cantidad,
                articulo1: {
                    nombre: this.nuevo.nombre,
                    unidad: this.nuevo.unidad,
                },
            })

            this.nuevo = {}
        },
        async removeLine(item) {
            const i = this.modal.mrp_bom.mrp_bom_lines.findIndex((a) => a.articulo == item.articulo)
            this.modal.mrp_bom.mrp_bom_lines.splice(i, 1)

            for (const a of this.modal.mrp_bom.mrp_bom_lines) {
                const j = this.modal.mrp_bom.mrp_bom_lines.findIndex(
                    (b) => b.articulo == a.articulo,
                )
                a.orden = j + 1
            }
        },
        async reorderLine(item, k) {
            const i = this.modal.mrp_bom.mrp_bom_lines.findIndex((a) => a.articulo == item.articulo)

            const o = k == 1 ? item.orden + 1 : item.orden - 1
            const j = k == 1 ? i + 1 : i - 1

            const peer = this.modal.mrp_bom.mrp_bom_lines[j]

            peer.orden = item.orden
            item.orden = o

            this.modal.mrp_bom.mrp_bom_lines.sort((a, b) => a.orden - b.orden)
        },

        setComponenteNuevo(a) {
            if (a == null) {
                this.nuevo = {}
            } else {
                this.nuevo.nombre = a.nombre
                this.nuevo.unidad = a.unidad
            }
        },
        checkDatos() {
            const props = ['articulo', 'tipo']

            if (incompleteData(this.modal.mrp_bom, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            for (const a of this.modal.mrp_bom.mrp_bom_lines) {
                if (incompleteData(a, ['articulo', 'cantidad'])) {
                    jmsg('warning', 'Ingrese los datos necesarios de cada componente')
                    return true
                }
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Agregando...')
            const res = await post(urls.mrp_boms, this.modal.mrp_bom)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.useVistas.addItem('mMrpBom', 'mrp_boms', res.data)
            this.useModals.show.mMrpBom = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Modificando...')
            const res = await patch(urls.mrp_boms, this.modal.mrp_bom)
            this.useAuth.setLoading(false)

            if (res.code != 0) return false

            this.useVistas.updateItem('mMrpBom', 'mrp_boms', res.data)
            this.useModals.show.mMrpBom = false
        },

        async loadReceta() {
            const qry = {
                fltr: {
                    articulo_principal: { op: 'Es', val: this.receta.id },
                },
                cols: ['articulo', 'cantidad', 'orden'],
                incl: ['articulo1'],
            }

            this.modal.mrp_bom.mrp_bom_lines = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.receta_insumos}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false, '')

            if (res.code != 0) return

            this.modal.mrp_bom.mrp_bom_lines = res.data
        },
    },
}
</script>

<style lang="scss" scoped>
.datos-generales {
    display: grid;
    grid-template-columns: repeat(4, 10rem);
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.agregar {
    display: grid;
    grid-template-columns: repeat(4, 10rem);
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.jd-table {
    .acts {
        display: grid;
        grid-template-columns: 1.75rem 1.75rem;
        gap: 0.5rem;
    }
}
</style>
