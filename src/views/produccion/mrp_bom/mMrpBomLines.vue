<template>
    <JdTable
        :columns="mrpBomLinesColumns"
        :datos="modal.mrp_bom.mrp_bom_lines || []"
        :rowOptions="rowActions"
        rowOptionsMode="buttons"
        @rowOptionSelected="runMethod"
        :inputsDisabled="!this.useAuth.verifyPermiso('vMrpBom:editar')"
        :agregarFila="addLine"
        :rowReorderable="this.useAuth.verifyPermiso('vMrpBom:editar')"
    />
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
import { genCorrelativo } from '@/utils/mine'

export default {
    components: {},
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
    }),
    computed: {
        mrpBomLinesColumns() {
            return [
                {
                    id: 'articulo',
                    title: 'Artículo',
                    width: '30rem',
                    input: true,
                    select_query: {
                        mostrar: 'nombre',
                        search: this.loadArticulosConsumables,
                    },
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
            ]
        },
        rowActions() {
            return [
                {
                    icon: 'fa-solid fa-trash-can',
                    title: 'Eliminar',
                    action: 'removeLine',
                    permiso: 'vMrpBom:editar',
                },
            ]
        },
    },
    created() {
        this.modal = this.useModals.mMrpBom

        if (this.modal.mode != 1 && !this.modal.mrp_bom_lines_loaded) {
            this.loadMrpBomLines()
        }
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        async loadMrpBomLines() {
            this.modal.mrp_bom_lines_loaded = true
            this.modal.mrp_bom.mrp_bom_lines = []

            const qry = {
                fltr: {
                    mrp_bom: { op: 'Es', val: this.modal.mrp_bom.id },
                },
                cols: { exclude: [] },
                incl: ['articulo1'],
                ordr: [['orden', 'ASC']],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.mrp_bom_lines}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.mrp_bom.mrp_bom_lines = res.data
        },
        addLine() {
            this.modal.mrp_bom.mrp_bom_lines.push({
                table_columns: {},
                id: crypto.randomUUID(),
                orden: genCorrelativo(this.modal.mrp_bom.mrp_bom_lines),
            })
        },
        async removeLine(item) {
            const i = this.modal.mrp_bom.mrp_bom_lines.findIndex((a) => a.id == item.id)
            this.modal.mrp_bom.mrp_bom_lines.splice(i, 1)

            for (const a of this.modal.mrp_bom.mrp_bom_lines) {
                const j = this.modal.mrp_bom.mrp_bom_lines.findIndex((b) => b.id == a.id)
                a.orden = j + 1
            }
        },

        // --- Datos auxiliares ---
        async loadArticulosConsumables(txtBuscar) {
            const qry = {
                fltr: {
                    type: { op: 'Es', val: 'consumable' },
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombre', 'unidad'],
                ordr: [['nombre', 'ASC']],
                limt: 25,
            }

            if (txtBuscar) {
                qry.fltr.nombre = { op: 'Contiene', val: txtBuscar }
            }

            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)

            if (res.code !== 0) return

            return res.data
        },
    },
}
</script>
