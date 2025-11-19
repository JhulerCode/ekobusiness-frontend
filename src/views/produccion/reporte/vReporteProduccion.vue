<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Reporte de producción</strong>

            <div class="buttons">
                <JdSelect
                    :lista="vista.produccion_tipos"
                    v-model="vista.linea"
                    style="width: 10rem"
                />
                <JdInput type="date" v-model="vista.f1" style="width: 10rem" />
                <JdInput type="date" v-model="vista.f2" style="width: 10rem" />
                <JdButton @click="loadProduccionProductos" text="Buscar" />
            </div>
        </div>

        <div class="container-tables">
            <JdTable :columns="columns_produccion" :datos="vista.produccion_mes || []" />
            <JdTable :columns="columns_insumos" :datos="vista.insumos || []" />
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
                width: '20rem',
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
                id: 'cantidad_real',
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
                width: '5rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vReporteProduccion
        this.initFiltros()

        if (this.vista.loaded) return

        this.loadDatosSistema()
        // if (this.useAuth.verifyPermiso('vReporteProduccion:listar') == true)
        //     this.loadProduccionProductos()
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

            this.vista.produccion_mes = res.data.produccion_mes
            this.vista.insumos = res.data.insumos
        },

        async loadDatosSistema() {
            const qry = ['produccion_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },
}
</script>

<style lang="scss" scoped>
.container-tables {
    display: flex;
    gap: 2rem;
    height: calc(100% - 4rem);
}
</style>
