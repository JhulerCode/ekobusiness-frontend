<template>
    <JdTable
        :columns="columns_socios"
        :datos="modal.mrp_bom.mrp_bom_socios || []"
        :seeker="false"
        :download="false"
        :colAct="true"
        @onChange="(action, a) => this[action](a)"
        :inputsDisabled="!this.useAuth.verifyPermiso('vMrpBom:editar')"
        v-if="modal.mrp_bom.tipo == 'subcontratar'"
    >
        <template v-slot:cAction="{ item }">
            <JdButton
                :small="true"
                tipo="2"
                icon="fa-solid fa-trash-can"
                title="Eliminar"
                @click="removeLineSocio(item)"
                v-if="this.useAuth.verifyPermiso('vMrpBom:editar')"
            />
        </template>
    </JdTable>
</template>

<script>
import { JdTable, JdButton } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch } from '@/utils/crud'
import { jmsg } from '@/utils/swal'
import { incompleteData } from '@/utils/mine'

export default {
    components: {
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

        // columns: [
        //     {
        //         id: 'orden',
        //         title: 'Ordenar',
        //         slot: 'cOrden',
        //         width: '5rem',
        //         show: true,
        //     },
        //     {
        //         id: 'articulo',
        //         title: 'Componente',
        //         slot: 'cArticulo',
        //         width: '25rem',
        //         show: true,
        //     },
        //     {
        //         id: 'unidad',
        //         title: 'Unidad',
        //         prop: 'articulo1.unidad',
        //         width: '5rem',
        //         show: true,
        //     },
        //     {
        //         id: 'cantidad',
        //         title: 'Cantidad',
        //         toRight: true,
        //         input: true,
        //         type: 'number',
        //         width: '6rem',
        //         show: true,
        //     },
        // ],

        buttons: [
            { text: 'Grabar', action: 'crear' },
            { text: 'Actualizar', action: 'modificar' },
        ],
    }),
    created() {
        this.modal = this.useModals.mMrpBom
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
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                    type: { op: 'Es', val: 'consumable' },
                    produce_ok: { op: 'Es', val: true },
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
        async loadArticulosConsumables(txtBuscar, fila, column) {
            if (!txtBuscar) {
                fila.table_columns[column.id + '_lista'].length = 0
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

            fila.table_columns[column.id + '_spin'] = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            fila.table_columns[column.id + '_spin'] = false

            if (res.code !== 0) return

            fila.table_columns[column.id + '_lista'] = res.data
        },
        async loadDatosSistema() {
            const qry = ['mrp_bom_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
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
