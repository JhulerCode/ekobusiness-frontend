<template>
    <VistaLayout
        :key="$route.fullPath"
        :config="VIEW_CONFIG"
        :checkFiltros="checkFiltros"
        :setQuery="setQuery"
    >
        <template #header-right>
            <div class="flex items-center gap-2">
                <small>Stock:</small> <span>{{ stock }}</span>
            </div>
        </template>
    </VistaLayout>
</template>

<script>
import { useSystem } from '@/pinia/system.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { redondear } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    data: () => ({
        system: useSystem(),
        auth: useAuth(),
        vistas: useVistas(),
        modals: useModals(),
    }),
    computed: {
        VIEW_CONFIG() {
            return {
                name: 'vKardex',
                title: 'Kardex',
                apiPath: 'kardex',
                headerActions: [],
                tableColumns: [
                    {
                        id: 'fecha',
                        title: 'Fecha',
                        type: 'date',
                        prop: 'fecha1',
                        width: '8rem',
                        show: true,
                    },
                    {
                        id: 'tipo',
                        title: 'Operación',
                        prop: 'tipo1.nombre',
                        width: '15rem',
                        show: true,
                        type: 'select',
                        systemKey: 'kardex_operaciones',
                    },
                    {
                        id: 'articulo',
                        title: 'Artículo',
                        prop: 'articulo1.nombre',
                        type: 'related',
                        relatedUrl: 'articulos',
                        width: '20rem',
                        show: this.$route.params.articulo_id ? false : true,
                        seek: this.$route.params.articulo_id ? false : true,
                        filtrable: this.$route.params.articulo_id ? false : true,
                    },
                    {
                        id: 'lote',
                        title: 'Lote',
                        prop: 'lote1.codigo',
                        type: 'related',
                        relatedUrl: 'lotes',
                        width: '8rem',
                        show: true,
                        seek: true,
                    },
                    {
                        id: 'lote1.fv',
                        title: 'Fecha vencimiento',
                        prop: 'lote1.fv1',
                        width: '8rem',
                        show: true,
                    },
                    {
                        id: 'lote1.vu',
                        title: 'Valor unitario',
                        align: 'right',
                        type: 'number',
                        width: '8rem',
                        show: true,
                    },
                    {
                        id: 'cantidad',
                        title: 'Cantidad',
                        prop: 'cantidad1',
                        type: 'decimal',
                        format: {},
                        align: 'right',
                        width: '8rem',
                        show: true,
                    },
                    {
                        id: 'maquina',
                        title: 'Máquina',
                        prop: 'maquina1.nombre',
                        type: 'related',
                        relatedUrl: 'maquinas',
                        width: '10rem',
                        show: true,
                        seek: true,
                    },
                    {
                        id: 'transaccion1.socio',
                        title: 'Socio comercial',
                        prop: 'transaccion1.socio1.nombres',
                        type: 'related',
                        relatedUrl: 'socios',
                        mostrar: 'nombres',
                        width: '15rem',
                        show: true,
                        seek: true,
                    },
                    {
                        id: 'transaccion1.guia',
                        title: 'Guía',
                        prop: 'transaccion1.guia',
                        width: '8rem',
                        show: true,
                        seek: true,
                    },
                    {
                        id: 'observacion',
                        title: 'Observación',
                        type: 'text',
                        width: '8rem',
                        show: true,
                        seek: true,
                    },
                ],
                tableRowActions: [
                    {
                        label: 'Ver compra',
                        icon: 'fa-regular fa-folder-open',
                        action: 'verCompra',
                        ocultar: { tipo: { op: '!=', val: 1 } },
                    },
                    {
                        label: 'Ver venta',
                        icon: 'fa-regular fa-folder-open',
                        action: 'verCompra',
                        ocultar: { tipo: { op: '!=', val: 5 } },
                    },
                ],
            }
        },

        vista() {
            return this.vistas[this.$route.name]
        },
        stock() {
            if (!this.vista.tableData) return 0

            let suma = 0
            for (const a of this.vista.tableData) {
                suma += Number(a.cantidad1 || 0)
            }
            return redondear(suma)
        },
    },
    created() {},
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        checkFiltros() {
            if (this.$route.params.articulo_id) return false

            if (!this.vista.tableColumns.some((a) => a.val || a.val1)) {
                jmsg('error', 'Ingrese al menos un filtro')
                return true
            }
            return false
        },
        async setQuery() {
            this.vista.qry = {
                fltr: { pt_cuarentena: { op: 'Es', val: false } },
                incl: ['lote1', 'transaccion1', 'maquina1', 'articulo1'],
                iccl: {
                    transaccion1: {
                        incl: ['socio1'],
                    },
                },
                ordr: [['fecha', 'DESC']],
                page: this.vista.table_page,
            }

            if (this.$route.params.articulo_id) {
                this.vista.qry.fltr.articulo = { op: 'Es', val: this.$route.params.articulo_id }
            } else {
                this.vista.qry.incl.push('articulo1')
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
            // this.vista.qry.cols.push('lote_id')
        },

        //--- Row actions ---//
        async verCompra(item) {
            console.log('por implementtar', item)
        },
    },
}
</script>
