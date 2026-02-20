<template>
    <JdTable
        :columns="modal.mrp_bom_socios_columns"
        :datos="modal.mrp_bom.mrp_bom_socios || []"
        :seeker="false"
        :download="false"
        :colAct="true"
        :inputsDisabled="!this.useAuth.verifyPermiso('vMrpBom:editar')"
        :agregarFila="addLineSocio"
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

import { urls, get } from '@/utils/crud'

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

        if (this.modal.mode != 1 && !this.modal.mrp_bom_socios_loaded) {
            this.loadMrpBomSocios()
        }
    },
    methods: {
        setMrpBomLinesColumns() {
            this.modal.mrp_bom_socios_columns = [
                {
                    id: 'socio',
                    title: 'Subcontratistas',
                    width: '30rem',
                    input: true,
                    select_query: {
                        mostrar: 'nombres',
                        search: this.loadSocios,
                    },
                    show: true,
                },
            ]
        },

        async loadMrpBomSocios() {
            this.modal.mrp_bom_socios_loaded = true
            this.modal.mrp_bom.mrp_bom_socios = []

            const qry = {
                fltr: {
                    mrp_bom: { op: 'Es', val: this.modal.mrp_bom.id },
                },
                cols: { exclude: [] },
                incl: ['socio1'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.mrp_bom_socios}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            for (const a of res.data) {
                a.table_columns = {
                    socio_lista: [{ ...a.socio1 }],
                }
            }

            this.modal.mrp_bom.mrp_bom_socios = res.data
        },
        async loadSocios(txtBuscar, fila, column) {
            if (!txtBuscar) {
                fila.table_columns[column.id + '_lista'].length = 0
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

            fila.table_columns[column.id + '_spin'] = true
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            fila.table_columns[column.id + '_spin'] = false

            if (res.code !== 0) return

            fila.table_columns[column.id + '_lista'] = res.data
        },

        addLineSocio() {
            this.modal.mrp_bom.mrp_bom_socios.push({
                table_columns: {},
                id: crypto.randomUUID(),
            })
        },
        async removeLineSocio(item) {
            const i = this.modal.mrp_bom.mrp_bom_socios.findIndex((a) => a.id == item.id)
            this.modal.mrp_bom.mrp_bom_socios.splice(i, 1)
        },
    },
}
</script>
