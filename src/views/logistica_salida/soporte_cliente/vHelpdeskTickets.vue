<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left">
                <strong>Soporte al cliente</strong>

                <JdButton
                    text="Nuevo"
                    title="Crear nuevo"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vHelpdeskTickets:crear')"
                />
            </div>

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="tableColumns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadHelpdeskTickets"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadHelpdeskTickets" />

                <JdButton
                    icon="fa-solid fa-file-excel"
                    tipo="2"
                    title="Exportar"
                    @click="$refs['jdtable'].downloadData()"
                />

                <JdButton
                    icon="fa-solid fa-gear"
                    tipo="2"
                    title="Columnas"
                    @click="$refs['jdtable'].openConfigCols()"
                />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="tableColumns"
            :datos="vista.helpdesk_tickets || []"
            :colAct="true"
            :rowOptions="tableRowActions"
            @rowOptionSelected="runMethod"
            ref="jdtable"
            :reload="loadHelpdeskTickets"
        />
    </div>

    <mHelpdeskTicket v-if="useModals.show.mHelpdeskTicket" />
    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdButton, mConfigFiltros, mConfigCols } from '@jhuler/components'
import JdBuscador from '@/components/JdBuscador.vue'
import JdTable from '@/components/JdTable/JdTable.vue'
import JdPaginacion from '@/components/JdPaginacion.vue'

import mHelpdeskTicket from './mHelpdeskTicket.vue'

import { TABLE_COLUMNS, TABLE_ROW_ACTIONS } from './helpdesk_tickets.config'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    name: 'vHelpdeskTickets',
    components: {
        JdButton,
        JdBuscador,
        JdTable,
        JdPaginacion,
        mConfigCols,
        mConfigFiltros,
        mHelpdeskTicket,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vHelpdeskTickets',
        tableColumns: JSON.parse(JSON.stringify(TABLE_COLUMNS)),
        tableRowActions: TABLE_ROW_ACTIONS,
    }),
    created() {
        this.vista = this.useVistas.vHelpdeskTickets
        this.useAuth.setColumns(this.tableName, this.tableColumns)

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

            this.useAuth.updateQuery(this.tableColumns, this.vista.qry)
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
            const cols = this.tableColumns

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
