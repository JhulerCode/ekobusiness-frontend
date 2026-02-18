<template>
    <div class="container-datos">
        <JdTable
            :columns="modal.columns_suppliers"
            :datos="modal.articulo.articulo_suppliers || []"
            :colAct="true"
            :seeker="false"
            :download="false"
            :agregarFila="addSupplier"
            style="grid-column: 1/3"
        >
            <template v-slot:cAction="{ item }">
                <JdButton
                    tipo="2"
                    :small="true"
                    icon="fa-solid fa-trash-can"
                    title="Eliminar"
                    @click="removeSupplier(item)"
                />
            </template>
        </JdTable>
    </div>
</template>

<script>
import { JdButton, JdTable } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'

export default {
    components: {
        JdTable,
        JdButton,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
    }),
    created() {
        this.modal = this.useModals.mArticulo
        this.setColumnsSuppliers()

        if (this.modal.mode != 1 && !this.modal.articulo_suppliers_loaded) {
            this.loadArticuloSuppliers()
        }
    },
    methods: {
        setColumnsSuppliers() {
            this.modal.columns_suppliers = [
                {
                    id: 'socio',
                    title: 'Proveedor',
                    width: '20rem',
                    input: true,
                    select_query: {
                        mostrar: 'nombres',
                        search: this.loadProveedores,
                    },
                    show: true,
                    sort: true,
                },
                {
                    id: 'min_qty',
                    title: 'Cantidad mínima',
                    type: 'number',
                    input: true,
                    width: '6rem',
                    show: true,
                    sort: true,
                },
                {
                    id: 'price',
                    title: 'Precio',
                    type: 'number',
                    input: true,
                    width: '6rem',
                    show: true,
                    sort: true,
                },
                {
                    id: 'currency_id',
                    title: 'Moneda',
                    width: '10rem',
                    input: true,
                    select_query: {
                        search: this.loadMonedas,
                    },
                    show: true,
                    sort: true,
                },
                {
                    id: 'delay',
                    title: 'Lead time (días)',
                    type: 'number',
                    input: true,
                    width: '6rem',
                    show: true,
                    sort: true,
                },
                {
                    id: 'date_start',
                    title: 'Fecha inicio',
                    type: 'date',
                    input: true,
                    width: '10rem',
                    show: true,
                    sort: true,
                },
                {
                    id: 'date_end',
                    title: 'Fecha fin',
                    type: 'date',
                    input: true,
                    width: '10rem',
                    show: true,
                    sort: true,
                },
                {
                    id: 'product_code',
                    title: 'Código de producto del proveedor',
                    type: 'text',
                    input: true,
                    width: '8rem',
                    show: true,
                    sort: true,
                },
                {
                    id: 'product_name',
                    title: 'Nombre de producto del proveedor',
                    type: 'text',
                    input: true,
                    width: '20rem',
                    show: true,
                    sort: true,
                },
            ]
        },

        async loadArticuloSuppliers() {
            this.modal.articulo_suppliers_loaded = true
            this.modal.articulo.articulo_suppliers = []

            const qry = {
                fltr: {
                    articulo: { op: 'Es', val: this.modal.articulo.id },
                },
                cols: { exclude: [] },
                incl: ['socio1', 'currency_id1'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_suppliers}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            for (const a of res.data) {
                a.table_columns = {
                    socio_lista: [{ ...a.socio1 }],
                    currency_id_lista: [{ ...a.currency_id1 }],
                }
            }

            this.modal.articulo.articulo_suppliers = res.data
        },
        async loadProveedores(txtBuscar, fila, column) {
            if (!txtBuscar) {
                fila.table_columns[column.id + '_lista'].length = 0
                return
            }

            const qry = {
                fltr: {
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
        async loadMonedas(txtBuscar, fila, column) {
            if (!txtBuscar) {
                fila.table_columns[column.id + '_lista'].length = 0
                return
            }

            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
            }

            fila.table_columns[column.id + '_spin'] = true
            const res = await get(`${urls.monedas}?qry=${JSON.stringify(qry)}`)
            fila.table_columns[column.id + '_spin'] = false

            if (res.code != 0) return

            fila.table_columns[column.id + '_lista'] = res.data
        },

        addSupplier() {
            this.modal.articulo.articulo_suppliers.push({
                table_columns: {},
                id: crypto.randomUUID(),
            })
        },
        async removeSupplier(item) {
            const i = this.modal.articulo.articulo_suppliers.findIndex((a) => a.id == item.id)
            this.modal.articulo.articulo_suppliers.splice(i, 1)
        },
    },
}
</script>
