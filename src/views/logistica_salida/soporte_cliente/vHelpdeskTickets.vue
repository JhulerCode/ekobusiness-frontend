<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Soporte al cliente</strong>

            <div class="buttons">
                <JdButton
                    text="Nuevo"
                    title="Crear nuevo"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vHelpdeskTickets:crear')"
                />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.helpdesk_tickets || []"
            :colAct="true"
            :configFiltros="openConfigFiltros"
            :reload="loadHelpdesk"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        >
        </JdTable>
    </div>

    <mHelpdesk v-if="useModals.show.mHelpdesk" />
    <mTipoCambios v-if="useModals.show.mTipoCambios" />

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdButton, JdTable, mConfigFiltros } from '@jhuler/components'

import mHelpdesk from './mHelpdesk.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    components: {
        JdButton,
        JdTable,

        mConfigFiltros,

        mHelpdesk,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vHelpdeskTickets',
        columns: [
            {
                id: 'nombre',
                title: 'Nombre',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'descripcion',
                title: 'Descripción',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'socio',
                title: 'Cliente',
                type: 'text',
                width: '5rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'articulo',
                title: 'Producto',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'reclamo_fecha',
                title: 'Fecha de reclamo',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'reclamo_fuente',
                title: 'Fuente de reclamo',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
        tableRowOptions: [
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vHelpdeskTickets:editar',
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: 'vHelpdeskTickets:eliminar',
                ocultar: { estandar: true },
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vHelpdeskTickets
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vHelpdeskTickets:listar') == true) this.loadHelpdesk()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
                ordr: [['nombre', 'ASC']],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('estandar')
        },
        async loadHelpdesk() {
            this.setQuery()

            this.vista.helpdesk_tickets = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.helpdesk}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.helpdesk_tickets = res.data
        },

        nuevo() {
            const item = { estandar: false }

            this.useModals.setModal('mHelpdesk', 'Nuevo ticket', 1, item)
        },

        async openConfigFiltros() {
            const cols = this.columns

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadHelpdesk,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.helpdesk}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mHelpdesk', 'Editar ticket', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.helpdesk, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vHelpdeskTickets', 'helpdesk_tickets', item)
        },
    },
}
</script>

<style lang="scss" scoped></style>
