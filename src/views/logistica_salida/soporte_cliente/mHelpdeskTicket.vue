<template>
    <JdModal modal="mHelpdeskTicket" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput label="Reclamo" :nec="true" v-model="modal.helpdesk_ticket.nombre" />

            <JdTextArea
                label="Descripción"
                :nec="true"
                v-model="modal.helpdesk_ticket.descripcion"
                style="grid-column: 1/3"
            />

            <JdSelectQuery
                label="Cliente"
                :lista="modal.clientes"
                mostrar="nombres"
                @search="loadClientes"
                :spin="modal.clientes_spin"
                v-model="modal.helpdesk_ticket.socio"
                style="grid-column: 1/3"
            />

            <JdSelectQuery
                label="Producto"
                :lista="modal.productos"
                @search="loadProductos"
                :spin="modal.productos_spin"
                v-model="modal.helpdesk_ticket.articulo"
                style="grid-column: 1/3"
            />

            <JdInput
                label="Fecha reclamo"
                type="date"
                v-model="modal.helpdesk_ticket.reclamo_fecha"
            />

            <JdInput label="Fuente reclamo" v-model="modal.helpdesk_ticket.reclamo_fuente" />
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdTextArea, JdSelectQuery } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdTextArea,
        JdSelectQuery,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        buttons: [
            { text: 'Grabar', action: 'crear', spin: false },
            { text: 'Actualizar', action: 'modificar', spin: false },
        ],
    }),
    created() {
        this.modal = this.useModals.mHelpdeskTicket

        this.showButtons()
    },
    methods: {
        showButtons() {
            if (this.useModals.mHelpdeskTicket.mode == 1) {
                this.buttons[0].show = true
            } else {
                this.buttons[1].show = true
            }
        },
        async loadClientes(txtBuscar) {
            if (!txtBuscar) {
                this.modal.clientes.length = 0
                return
            }

            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: 2 },
                    activo: { op: 'Es', val: true },
                    nombres: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['nombres'],
                ordr: [['nombres', 'ASC']],
            }

            this.modal.clientes = []
            this.modal.clientes_spin = true
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.modal.clientes_spin = false

            if (res.code !== 0) return

            this.modal.clientes = res.data
        },
        async loadProductos(txtBuscar) {
            if (!txtBuscar) {
                this.modal.productos.length = 0
                return
            }

            const qry = {
                fltr: {
                    sale_ok: { op: 'Es', val: true },
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
            }

            this.modal.productos = []
            this.modal.productos_spin = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.modal.productos_spin = false

            if (res.code !== 0) return

            this.modal.productos = res.data
        },

        checkDatos() {
            const props = ['nombre', 'descripcion']

            if (incompleteData(this.modal.helpdesk_ticket, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Creando...')
            const res = await post(urls.helpdesk_tickets, this.modal.helpdesk_ticket)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem('vHelpdeskTickets', 'helpdesk_tickets', res.data)
            this.useModals.show.mHelpdeskTicket = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.helpdesk_tickets, this.modal.helpdesk_ticket)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vHelpdeskTickets', 'helpdesk_tickets', res.data)
            this.useModals.show.mHelpdeskTicket = false
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: repeat(2, 20rem);
    gap: 0.5rem;
}
</style>
