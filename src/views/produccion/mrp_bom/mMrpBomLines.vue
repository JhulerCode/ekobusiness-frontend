<template>
    <JdTable
        :columns="modal.mrp_bom_lines_columns"
        :datos="modal.mrp_bom.mrp_bom_lines || []"
        :seeker="false"
        :download="false"
        :colAct="true"
        class="jd-table"
        :inputsDisabled="!this.useAuth.verifyPermiso('vMrpBom:editar')"
        :agregarFila="addLine"
        :rowReorderable="this.useAuth.verifyPermiso('vMrpBom:editar')"
    >
        <template v-slot:cAction="{ item }">
            <JdButton
                :small="true"
                tipo="2"
                icon="fa-solid fa-trash-can"
                title="Eliminar"
                @click="removeLine(item)"
                v-if="this.useAuth.verifyPermiso('vMrpBom:editar')"
            />
        </template>
    </JdTable>
</template>

<script>
import { JdButton } from '@jhuler/components'
import JdTable from '@/components/JdTable/JdTable.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
import { genCorrelativo } from '@/utils/mine'

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
    }),
    created() {
        this.modal = this.useModals.mMrpBom
        this.setMrpBomLinesColumns()

        if (this.modal.mode != 1 && !this.modal.mrp_bom_lines_loaded) {
            this.loadMrpBomLines()
        }
    },
    methods: {
        setMrpBomLinesColumns() {
            this.modal.mrp_bom_lines_columns = [
                {
                    id: 'articulo',
                    title: 'Artículo',
                    width: '30rem',
                    input: true,
                    select_query: {
                        mostrar: 'nombre',
                        search: this.loadArticulosConsumables,
                        elegir: this.elegirArticuloConsumible,
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

            for (const a of res.data) {
                a.table_columns = {
                    articulo_lista: [{ ...a.articulo1 }],
                }
            }

            this.modal.mrp_bom.mrp_bom_lines = res.data
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
        elegirArticuloConsumible(elegido, fila, column) {
            console.log('asd')
            console.log(elegido, fila, column)
            fila.articulo1 = { ...elegido }
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
    },
}
</script>

<style lang="scss" scoped></style>
