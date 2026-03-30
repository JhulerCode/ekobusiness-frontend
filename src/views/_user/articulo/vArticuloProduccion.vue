<template>
    <div class="container-datos1">
        <JdSelectQuery
            label="Línea de producción"
            :search="loadLineas"
            v-model="vista.data.linea"
            :selectedObject="vista.data.linea1"
            :disabled="vista.mode != 'edit'"
            style="grid-column: 1/4"
        />

        <JdInput
            label="Sobres en caja"
            type="number"
            v-model="vista.data.filtrantes"
            :disabled="vista.mode != 'edit'"
            style="grid-column: 4/6"
        />
    </div>
</template>

<script>
import { useVistas } from '@/pinia/vistas'
import { get, urls } from '@/utils/crud'

export default {
    data: () => ({
        vistas: useVistas(),
    }),
    computed: {
        vista() {
            return this.vistas[this.$route.name] || { data: {} }
        },
        lineaNombre() {
            return this.vista.data?.linea1?.nombre || ''
        },
    },
    methods: {
        async loadLineas(txtBuscar) {
            const qry = {
                fltr: { activo: { op: 'Es', val: true } },
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
                limt: 25,
            }

            if (txtBuscar) {
                qry.fltr.nombre = { op: 'Contiene', val: txtBuscar }
            }

            const res = await get(`${urls.articulo_lineas}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return []

            return res.data
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos1 {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 0.75rem 2rem;
}
</style>
