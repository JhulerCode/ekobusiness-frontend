<template>
    <div class="container-datos">
        <JdTable
            :columns="columns_suppliers"
            :datos="articulo_suppliers || []"
            :showResumen="false"
            style="grid-column: 1/3"
        />
    </div>
</template>

<script>
import { JdTable } from '@jhuler/components'
import { urls, get } from '@/utils/crud'
import { useVistas } from '@/pinia/vistas'

export default {
    components: {
        JdTable,
    },
    computed: {
        vistas: () => useVistas(),
    },
    data: () => ({
        vista: {},
        articulo_suppliers: [],
        columns_suppliers: [
            {
                id: 'socio',
                title: 'Proveedor',
                width: '20rem',
                show: true,
            },
            {
                id: 'min_qty',
                title: 'Cantidad mínima',
                type: 'number',
                width: '6rem',
                show: true,
            },
            {
                id: 'price',
                title: 'Precio',
                type: 'number',
                width: '6rem',
                show: true,
            },
            {
                id: 'currency_id',
                title: 'Moneda',
                width: '10rem',
                show: true,
            },
            {
                id: 'delay',
                title: 'Lead time (días)',
                type: 'number',
                width: '6rem',
                show: true,
            },
            {
                id: 'date_start',
                title: 'Fecha inicio',
                type: 'date',
                width: '10rem',
                show: true,
            },
            {
                id: 'date_end',
                title: 'Fecha fin',
                type: 'date',
                width: '10rem',
                show: true,
            },
            {
                id: 'product_code',
                title: 'Código de producto del proveedor',
                type: 'text',
                width: '8rem',
                show: true,
            },
            {
                id: 'product_name',
                title: 'Nombre de producto del proveedor',
                type: 'text',
                width: '20rem',
                show: true,
            },
        ],
    }),
    created() {
        this.vista = this.vistas.vArticuloDetalle
        this.loadArticuloSuppliers()
    },
    methods: {
        async loadArticuloSuppliers() {
            const qry = {
                fltr: {
                    articulo: { op: 'Es', val: this.vista.data.id },
                },
                cols: { exclude: [] },
                incl: ['socio1', 'currency_id1'],
            }

            const res = await get(`${urls.articulo_suppliers}?qry=${JSON.stringify(qry)}`)
            if (res.code !== 0) return

            for (const a of res.data) {
                // Populate strings for JdTable reading
                a.socio = a.socio1?.nombres || ''
                a.currency_id = a.currency_id1?.nombre || ''
            }

            this.articulo_suppliers = res.data
        },
    },
}
</script>

<style lang="scss" scoped>
</style>
