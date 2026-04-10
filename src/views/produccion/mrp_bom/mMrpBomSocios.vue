<template>
    <JdTable
        :columns="mrpBomSociosColumns"
        :datos="modal.mrp_bom.mrp_bom_socios || []"
        :rowOptions="rowActions"
        rowOptionsMode="buttons"
        @rowOptionSelected="runMethod"
        :inputsDisabled="!this.useAuth.verifyPermiso('vMrpBom:editar')"
        :agregarFila="addLineSocio"
    />
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'

export default {
    components: {},
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
    }),
    computed: {
        mrpBomSociosColumns() {
            return [
                {
                    id: 'socio',
                    title: 'Subcontratistas',
                    width: '30rem',
                    type: 'select_query',
                    input: {
                        search: this.loadSocios,
                        selectedObjectProp: 'socio1',
                        mostrar: 'nombres',
                    },
                    show: true,
                },
            ]
        },
        rowActions() {
            return [
                {
                    icon: 'fa-solid fa-trash-can',
                    title: 'Eliminar',
                    action: 'removeLineSocio',
                    permiso: 'vMrpBom:editar',
                },
            ]
        },
    },
    created() {
        this.modal = this.useModals.mMrpBom

        if (this.modal.mode != 1 && !this.modal.mrp_bom_socios_loaded) {
            this.loadMrpBomSocios()
        }
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
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

            this.modal.mrp_bom.mrp_bom_socios = res.data
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

        // --- Datos auxiliares ---
        async loadSocios(txtBuscar) {
            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: 1 },
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombres'],
                ordr: [['nombres', 'ASC']],
                limt: 25,
            }

            if (txtBuscar) {
                qry.fltr.nombres = { op: 'Contiene', val: txtBuscar }
            }

            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)

            if (res.code !== 0) return

            return res.data
        },
    },
}
</script>
