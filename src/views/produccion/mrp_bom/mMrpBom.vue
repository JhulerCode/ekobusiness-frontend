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

            <JdButton
                text="Agregar"
                tipo="2"
                @click="addLineSocio"
                v-if="
                    useAuth.verifyPermiso('vMrpBom:editar') && modal.mrp_bom.tipo == 'subcontratar'
                "
            />
        </div>

        <JdTable
            :columns="columns_socios"
            :datos="modal.mrp_bom.mrp_bom_socios || []"
            :seeker="false"
            :download="false"
            :colAct="true"
            @onChange="(action, a) => this[action](a)"
            :inputsDisabled="!this.useAuth.verifyPermiso('vReceta:editar')"
            class="mrg-btm2"
            v-if="modal.mrp_bom.tipo == 'subcontratar'"
        >
            <template v-slot:cAction="{ item }">
                <JdButton
                    :small="true"
                    tipo="2"
                    icon="fa-solid fa-trash-can"
                    title="Eliminar"
                    @click="removeLineSocio(item)"
                    v-if="this.useAuth.verifyPermiso('vReceta:editar')"
                />
            </template>

            <template v-slot:cSocio="{ item }">
                <JdSelectQuery
                    :nec="true"
                    v-model="item.socio"
                    :spin="modal.spin_socios"
                    :lista="modal['socios' + item.id] || []"
                    mostrar="nombres"
                    @search="(value) => loadSocios(value, item)"
                    style="grid-column: 1/5"
                />
            </template>
        </JdTable>

        <JdButton
            text="Agregar"
            tipo="2"
            @click="addLine"
            v-if="useAuth.verifyPermiso('vMrpBom:editar')"
        />

        <JdTable
            :columns="columns"
            :datos="modal.mrp_bom.mrp_bom_lines || []"
            :seeker="false"
            :download="false"
            :colAct="true"
            class="jd-table"
            :inputsDisabled="!this.useAuth.verifyPermiso('vReceta:editar')"
        >
            <template v-slot:cAction="{ item }">
                <JdButton
                    :small="true"
                    tipo="2"
                    icon="fa-solid fa-trash-can"
                    title="Eliminar"
                    @click="removeLine(item)"
                    v-if="this.useAuth.verifyPermiso('vReceta:editar')"
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

            <template v-slot:cArticulo="{ item }">
                <JdSelectQuery
                    :nec="true"
                    v-model="item.articulo"
                    :spin="modal.spin_articulos"
                    :lista="modal['articulos' + item.id] || []"
                    @search="(value) => loadArticulosConsumables(value, item)"
                    @elegir="(value) => setComponenteNuevo(value, item)"
                    style="grid-column: 1/5"
                />
            </template>
        </JdTable>
    </JdModal>
</template>

<script>
import { JdModal, JdSelect, JdTable, JdButton, JdSelectQuery } from '@jhuler/components'

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
        JdButton,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        nuevo: {},

        columns_socios: [
            {
                id: 'socio',
                title: 'Subcontratistas',
                slot: 'cSocio',
                width: '35rem',
                show: true,
            },
        ],

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
                slot: 'cArticulo',
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
        async loadSocios(txtBuscar, item) {
            if (!txtBuscar) {
                this.modal['socios' + item.id].length = 0
                return
            }

            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: 1 },
                    activo: { op: 'Es', val: true },
                    nombres: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['nombres'],
                ordr: [['nombres', 'ASC']],
            }

            this.modal.spin_socios = true
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.modal.spin_socios = false

            if (res.code !== 0) return

            this.modal['socios' + item.id] = JSON.parse(JSON.stringify(res.data))
        },
        async loadArticulosConsumables(txtBuscar, item) {
            if (!txtBuscar) {
                this.modal['articulos' + item.id].length = 0
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

            this.modal['articulos' + item.id] = JSON.parse(JSON.stringify(res.data))
        },
        async loadDatosSistema() {
            const qry = ['mrp_bom_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },

        addLine() {
            this.modal.mrp_bom.mrp_bom_lines.push({
                id: crypto.randomUUID(),
                orden: genCorrelativo(this.modal.mrp_bom.mrp_bom_lines),
                articulo: null,
                cantidad: null,
                articulo1: {},
            })
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

        addLineSocio() {
            this.modal.mrp_bom.mrp_bom_socios.push({
                id: crypto.randomUUID(),
                socio: null,
                socio1: {},
            })
        },
        async removeLineSocio(item) {
            const i = this.modal.mrp_bom.mrp_bom_socios.findIndex((a) => a.id == item.id)
            this.modal.mrp_bom.mrp_bom_socios.splice(i, 1)
        },

        setComponenteNuevo(a, item) {
            if (a == null) {
                item.articulo1 = {}
            } else {
                item.articulo1 = {
                    nombre: a.nombre,
                    unidad: a.unidad,
                }
            }
        },
        checkDatos() {
            const props = ['articulo', 'tipo']

            if (incompleteData(this.modal.mrp_bom, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            if (this.modal.mrp_bom.mrp_bom_lines.length == 0) {
                jmsg('warning', 'Agregue al menos un componente')
                return true
            }

            for (const a of this.modal.mrp_bom.mrp_bom_lines) {
                if (incompleteData(a, ['articulo', 'cantidad'])) {
                    jmsg('warning', 'Ingrese los datos necesarios de cada componente')
                    return true
                }
            }

            if (this.modal.mrp_bom.tipo == 'subcontratar') {
                if (this.modal.mrp_bom.mrp_bom_socios.length == 0) {
                    jmsg('warning', 'Agregue al menos un subcontratista')
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

            this.useVistas.addItem('vMrpBom', 'mrp_boms', res.data)
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
