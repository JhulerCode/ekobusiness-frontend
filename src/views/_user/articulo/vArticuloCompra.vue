<template>
    <div class="container-datos">
        <JdTable
            :columns="columns_suppliers"
            :datos="vista.data.articulo_suppliers || []"
            :rowOptions="rowActions"
            rowOptionsMode="buttons"
            @rowOptionSelected="runMethod"
            :inputsDisabled="vista.mode == 'view'"
            :agregarFila="vista.mode == 'view' ? null : addSupplier"
            style="grid-column: 1/5"
        />
    </div>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { urls, get } from '@/utils/crud'

export default {
    data: () => ({
        auth: useAuth(),
        vistas: useVistas(),
    }),
    computed: {
        vista() {
            return this.vistas[this.$route.name] || { data: {} }
        },
        columns_suppliers() {
            return [
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
        rowActions() {
            if (this.vista.mode == 'view') return []
            return [
                {
                    icon: 'fa-solid fa-trash-can',
                    title: 'Eliminar',
                    action: 'removeSupplier',
                },
            ]
        },
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        async loadArticuloSuppliers() {
            this.vista.articulo_suppliers_loaded = true
            this.vista.data.articulo_suppliers = []

            const qry = {
                fltr: {
                    articulo: { op: 'Es', val: this.vista.data.id },
                },
                cols: { exclude: [] },
                incl: ['socio1', 'currency_id1'],
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_suppliers}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code != 0) return
            this.vista.data.articulo_suppliers = res.data
        },
        addSupplier() {
            this.vista.data.articulo_suppliers.push({
                table_columns: {},
                id: crypto.randomUUID(),
            })
        },
        async removeSupplier(item) {
            const i = this.vista.data.articulo_suppliers.findIndex((a) => a.id == item.id)
            this.vista.data.articulo_suppliers.splice(i, 1)
        },

        // --- Datos auxiliares ---
        async loadProveedores(txtBuscar) {
            const qry = {
                fltr: { activo: { op: 'Es', val: true } },
                cols: ['nombres'],
                ordr: [['nombres', 'ASC']],
                limt: 25,
            }

            if (txtBuscar) {
                qry.fltr.nombres = { op: 'Contiene', val: txtBuscar }
            }

            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)

            if (res.code !== 0) return []

            return res.data
        },
        async loadMonedas(txtBuscar) {
            const qry = {
                fltr: { activo: { op: 'Es', val: true } },
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
                limt: 25,
            }

            if (txtBuscar) {
                qry.fltr.nombre = { op: 'Contiene', val: txtBuscar }
            }

            const res = await get(`${urls.monedas}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return []

            return res.data
        },
    },
}
</script>
