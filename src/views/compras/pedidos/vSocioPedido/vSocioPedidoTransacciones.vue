<template>
    <div class="pedido-transacciones">
        <JdTable
            :columns="columns"
            :datos="vista.data.transacciones || []"
            :reload="loadTransacciones"
            maxHeight="40rem"
        />
    </div>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { urls, get } from '@/utils/crud'
import VIEW_CONFIG from './socio_pedido.config.js'

export default {
    data: () => ({
        auth: useAuth(),
        vistas: useVistas(),
        columns: [
            {
                id: 'transaccion1.fecha',
                prop: 'transaccion1.fecha',
                title: 'Fecha',
                width: '8rem',
                show: true,
                sort: true,
            },
            {
                id: 'transaccion1.guia',
                prop: 'transaccion1.guia',
                title: 'Guia',
                width: '8rem',
                show: true,
                sort: true,
            },
            {
                id: 'transaccion1.factura',
                prop: 'transaccion1.factura',
                title: 'Factura',
                width: '8rem',
                show: true,
                sort: true,
            },
            {
                id: 'articulo',
                title: 'Artículo',
                prop: 'articulo1.nombre',
                width: '20rem',
                show: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                type: 'decimal',
                toRight: true,
                width: '6rem',
                show: true,
            },
        ],
    }),
    computed: {
        vista() {
            return this.vistas[VIEW_CONFIG.name]
        },
    },
    created() {
        if (!this.vista.data.transacciones) {
            this.loadTransacciones()
        }
    },
    methods: {
        async loadTransacciones() {
            const qry = {
                fltr: {
                    'transaccion1.socio_pedido': { op: 'Es', val: this.vista.data.id },
                },
                incl: ['transaccion1', 'articulo1'],
                ordr: [['fecha', 'DESC']],
            }

            this.auth.setLoading(true, 'Cargando transacciones...')
            const res = await get(`${urls.transaccion_items}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code !== 0) return
            this.vista.data.transacciones = res.data
        },
    },
}
</script>

<style scoped>
.pedido-transacciones {
    padding: 1rem 0;
}
</style>
