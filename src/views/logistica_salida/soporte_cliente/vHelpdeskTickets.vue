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
            :reload="loadHelpdeskTickets"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
            :meta="vista.table_meta"
            @prevPage="((vista.table_page -= 1), loadHelpdeskTickets())"
            @nextPage="((vista.table_page += 1), loadHelpdeskTickets())"
        />
    </div>

    <mHelpdeskTicket v-if="useModals.show.mHelpdeskTicket" />

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdButton, JdTable, mConfigFiltros } from '@jhuler/components'

import mHelpdeskTicket from './mHelpdeskTicket.vue'

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

        mHelpdeskTicket,
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
                width: '15rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'socio1.nombres',
                title: 'Cliente',
                prop: 'socio1.nombres',
                type: 'text',
                width: '15rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'articulo1.nombre',
                title: 'Producto',
                prop: 'articulo1.nombre',
                type: 'text',
                width: '15rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'reclamo_fecha',
                title: 'Fecha de reclamo',
                format: 'date',
                type: 'date',
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
            {
                id: 'createdAt',
                title: 'Creado el',
                format: 'datetime',
                type: 'datetime',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'createdBy1.nombres',
                title: 'Creado por',
                prop: 'createdBy1.nombres_apellidos',
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
        this.vista.table_page = 1
        if (this.useAuth.verifyPermiso('vHelpdeskTickets:listar') == true)
            this.loadHelpdeskTickets()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['socio1', 'articulo1', 'createdBy1'],
                page: this.vista.table_page,
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('estandar')
        },
        async loadHelpdeskTickets() {
            this.setQuery()

            this.vista.helpdesk_tickets = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.helpdesk_tickets}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.helpdesk_tickets = res.data
            this.vista.table_meta = res.meta
        },

        nuevo() {
            const send = { helpdesk_ticket: { estado: 1 } }

            this.useModals.setModal('mHelpdeskTicket', 'Nuevo ticket', 1, send, true)
        },

        async openConfigFiltros() {
            const cols = this.columns

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadHelpdeskTickets,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            const qry = {
                incl: ['socio1', 'articulo1'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(
                `${urls.helpdesk_tickets}/uno/${item.id}?qry=${JSON.stringify(qry)}`,
            )
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                helpdesk_ticket: res.data,
                clientes: [{ ...res.data.socio1 }],
                productos: [{ ...res.data.articulo1 }],
            }

            this.useModals.setModal('mHelpdeskTicket', 'Editar ticket', 2, send, true)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.helpdesk_tickets, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vHelpdeskTickets', 'helpdesk_tickets', item)
        },
    },
}
</script>

<style lang="scss" scoped></style>
