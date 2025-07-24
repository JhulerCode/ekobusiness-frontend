<template>
    <div style="display: flex; gap: 20px;">
        <!-- Gráfico de Barras -->
        <v-chart :option="barOptions" @click="handleBarClick" style="width: 50%; height: 400px;" autoresize />

        <!-- Gráfico de Pie -->
        <v-chart :option="pieOptions" style="width: 50%; height: 400px;" autoresize />
    </div>
</template>

<script>
import { use } from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'

use([
    BarChart,
    PieChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    CanvasRenderer
])

export default {
    components: {
        VChart,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        meses: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
        ventas: [500, 700, 800, 600, 1200, 900],
        detalles: {
            'Enero': [{ name: 'Producto A', value: 300 }, { name: 'Producto B', value: 200 }],
            'Febrero': [{ name: 'Producto A', value: 400 }, { name: 'Producto B', value: 300 }],
            'Marzo': [{ name: 'Producto A', value: 500 }, { name: 'Producto B', value: 300 }],
            'Abril': [{ name: 'Producto A', value: 350 }, { name: 'Producto B', value: 250 }],
            'Mayo': [{ name: 'Producto A', value: 800 }, { name: 'Producto B', value: 400 }],
            'Junio': [{ name: 'Producto A', value: 500 }, { name: 'Producto B', value: 400 }]
        },
        selectedIndex: null, // Por defecto no hay selección
        defaultColor: '#7cb5ec',
        highlightColor: '#f45b5b'
    }),
    created() {
        this.vista = this.useVistas.vSessions
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vSessions:listar') == true) this.loadSessions()
    },
    computed: {
        barOptions() {
            const colors = this.meses.map((_, idx) => {
                if (this.selectedIndex === null) return this.defaultColor
                return idx === this.selectedIndex ? this.highlightColor : this.defaultColor
            })

            return {
                title: { text: 'Ventas por Mes' },
                tooltip: {},
                xAxis: { data: this.meses },
                yAxis: {},
                series: [{
                    name: 'Ventas',
                    type: 'bar',
                    data: this.ventas,
                    itemStyle: {
                        color: (params) => colors[params.dataIndex]
                    }
                }]
            }
        },
        pieOptions() {
            if (this.selectedIndex === null) {
                // Pie global: suma de todos los meses
                const total = {}
                for (const mes of this.meses) {
                    for (const item of this.detalles[mes]) {
                        if (!total[item.name]) total[item.name] = 0
                        total[item.name] += item.value
                    }
                }
                return {
                    title: { text: 'Detalle Total' },
                    tooltip: {},
                    legend: { orient: 'vertical', left: 'left' },
                    series: [{
                        name: 'Productos',
                        type: 'pie',
                        radius: '70%',
                        data: Object.keys(total).map(name => ({
                            name,
                            value: total[name]
                        }))
                    }]
                }
            } else {
                // Pie de un mes específico
                const month = this.meses[this.selectedIndex]
                return {
                    title: { text: `Detalle de ${month}` },
                    tooltip: {},
                    legend: { orient: 'vertical', left: 'left' },
                    series: [{
                        name: 'Productos',
                        type: 'pie',
                        radius: '70%',
                        data: this.detalles[month]
                    }]
                }
            }
        }
    },
    methods: {
        handleBarClick(params) {
            // Si haces clic en la misma barra, des-selecciona (toggle)
            if (this.selectedIndex === params.dataIndex) {
                this.selectedIndex = null
            } else {
                this.selectedIndex = params.dataIndex
            }
        },
        setQuery() {
            this.vista.qry = {
                fltr: {},
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadSessions() {
            this.setQuery()

            this.vista.sessions = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.sessions}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.sessions = res.data
        },
    },
}
</script>

<style lang="scss" scoped></style>
