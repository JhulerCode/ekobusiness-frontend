<template>
    <div class="tablero">
        <div class="head">
            <strong>Reporte de producción</strong>

            <div class="buttons">
                <JdSelect
                    :lista="vista.articulo_lineas"
                    :loaded="vista.lineasLoaded"
                    @reload="loadLineas"
                    v-model="vista.linea"
                    style="width: 10rem"
                />
                <JdInput type="date" v-model="vista.f1" style="width: 10rem" />
                <JdInput type="date" v-model="vista.f2" style="width: 10rem" />
                <JdButton @click="loadProduccionProductos" text="Buscar" />
            </div>
        </div>

        <div class="tablero-body" v-if="vista.resumen">
            <div class="cols2">
                <div class="card">
                    <div class="card-head">
                        <p>Produccion</p>

                        <div class="monto-resumen">
                            <span>{{ redondear(vista.resumen.produccion_mes_total, 0) }}</span>
                            <p>Total</p>
                        </div>
                    </div>

                    <JdTable
                        :columns="columns_produccion"
                        :datos="vista.resumen.produccion_mes || []"
                        height="30rem"
                    />
                </div>

                <div class="card">
                    <div class="card-head">
                        <p>Insumos</p>
                    </div>

                    <JdTable
                        :columns="columns_insumos"
                        :datos="vista.resumen.insumos || []"
                        height="30rem"
                    />
                </div>

                <div class="card">
                    <div class="card-head">
                        <p>Insumos por categoría</p>
                    </div>

                    <JdTable
                        :columns="columns_insumos_categorias"
                        :datos="vista.resumen.insumos_categorias || []"
                        height="22rem"
                    />
                </div>

                <div class="card">
                    <div class="card-head">
                        <p>Por responsable</p>
                    </div>

                    <JdTable
                        :columns="columns_por_responsable"
                        :datos="vista.resumen.por_responsable || []"
                        height="22rem"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { JdTable, JdSelect, JdInput, JdButton } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
import { redondear } from '@/utils/mine'

import dayjs from 'dayjs'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdTable,
        JdSelect,
        JdInput,
        JdButton,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        dayjs,
        redondear,

        vista: {},

        columns_produccion: [
            {
                id: 'nombre',
                title: 'Nombre',
                width: '25rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                format: 'number',
                toRight: true,
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],

        columns_insumos: [
            {
                id: 'nombre',
                title: 'Nombre',
                width: '15rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'cantidad_plan',
                title: 'Cant. receta',
                format: 'decimal',
                toRight: true,
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cant. real',
                format: 'decimal',
                toRight: true,
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'diferencia',
                title: 'Diferencia',
                format: 'decimal',
                toRight: true,
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],

        columns_insumos_categorias: [
            {
                id: 'nombre',
                title: 'Nombre',
                width: '12rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'cantidad_plan',
                title: 'Cant. receta',
                format: 'decimal',
                toRight: true,
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cant. real',
                format: 'decimal',
                toRight: true,
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'diferencia',
                title: 'Diferencia',
                format: 'decimal',
                toRight: true,
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],

        columns_por_responsable: [
            {
                id: 'responsable',
                title: 'Nombre',
                prop: 'responsable1.nombres_apellidos',
                width: '12rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cant. programada',
                format: 'number',
                toRight: true,
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'productos_terminados',
                title: 'Cant. real',
                format: 'number',
                toRight: true,
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'diferencia',
                title: 'Diferencia',
                format: 'number',
                toRight: true,
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vReporteProduccion
        this.initFiltros()

        if (!this.vista.lineasLoaded) this.loadLineas()
    },
    methods: {
        initFiltros() {
            if (!this.vista.linea) this.vista.linea = 1
            if (!this.vista.f1) this.vista.f1 = dayjs().startOf('month').format('YYYY-MM-DD')
            if (!this.vista.f2) this.vista.f2 = dayjs().format('YYYY-MM-DD')
        },
        checkDatos() {
            if (!this.vista.linea || !this.vista.f1 || !this.vista.f2) {
                jmsg('error', 'Ingrese los campos de filtro')
                return true
            }

            if (this.vista.f1 > this.vista.f2) {
                jmsg('error', 'Seleccione una fecha válida')
                return true
            }

            return false
        },
        async loadProduccionProductos() {
            if (this.checkDatos()) return

            this.vista.produccion_mes = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(
                `${urls.kardex}/produccion/${this.vista.linea}&${this.vista.f1}&${this.vista.f2}`,
            )
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.resumen = res.data
        },

        async loadLineas() {
            const qry = {
                fltr: {},
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
            }

            this.vista.articulo_lineas = []
            this.vista.lineasLoaded = false
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_lineas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.vista.lineasLoaded = true

            if (res.code != 0) return

            this.vista.articulo_lineas = res.data
        },
    },
}
</script>
