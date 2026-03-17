<template>
    <div class="container-datos">
        <JdTable
            :columns="columns_componentes"
            :datos="combo_componentes || []"
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
        combo_componentes: [],
        columns_componentes: [
            {
                id: 'articulo',
                title: 'Artículo',
                width: '30rem',
                show: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                type: 'number',
                width: '6rem',
                show: true,
            },
        ],
    }),
    created() {
        this.vista = this.vistas.vArticuloDetalle
        this.loadArticuloComponentes()
    },
    methods: {
        async loadArticuloComponentes() {
            const qry = {
                fltr: {
                    articulo_principal: { op: 'Es', val: this.vista.data.id },
                },
                cols: { exclude: [] },
                incl: ['articulo1'],
            }

            const res = await get(`${urls.combo_componentes}?qry=${JSON.stringify(qry)}`)
            if (res.code !== 0) return

            for (const a of res.data) {
                a.articulo = a.articulo1?.nombre || ''
            }

            this.combo_componentes = res.data
        },
    },
}
</script>

<style lang="scss" scoped>
</style>
