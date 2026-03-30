<template>
    <div class="container-datos">
        <JdInput
            label="Código barras / EAN"
            v-model="vista.data.codigo_barra"
            :disabled="vista.mode != 'edit'"
        />

        <JdSelect
            label="Tributo"
            :nec="true"
            v-model="vista.data.igv_afectacion"
            :lista="useSystem.data.igv_afectaciones || []"
            :disabled="vista.mode != 'edit'"
        />

        <JdSelect
            label="Unidad"
            :nec="true"
            v-model="vista.data.unidad"
            :lista="useSystem.data.unidades"
            mostrar="nombre_completo"
            :disabled="vista.mode != 'edit'"
        />

        <JdSelectQuery
            label="Categoría"
            :search="loadCategorias"
            v-model="vista.data.categoria"
            :selectedObject="vista.data.categoria1"
            :disabled="vista.mode != 'edit'"
        />

        <JdSelect
            label="Tipo de materia prima"
            :lista="useSystem.data.mp_tipos || []"
            v-model="vista.data.mp_tipo"
            v-if="vista.data.categoria == materiaprima_id"
            :disabled="vista.mode != 'edit'"
        />

        <JdInput label="Marca" v-model="vista.data.marca" :disabled="vista.mode != 'edit'" />
    </div>
</template>

<script>
import { useSystem } from '@/pinia/system'
import { useVistas } from '@/pinia/vistas'
import { get, urls } from '@/utils/crud'

export default {
    data: () => ({
        useSystem: useSystem(),
        vistas: useVistas(),
        materiaprima_id: 'f000be66-e4b1-4334-b57a-0e356eb8c7a6',
    }),
    computed: {
        vista() {
            return this.vistas[this.$route.name] || { data: {} }
        },
    },
    async created() {
        await this.useSystem.load(['igv_afectaciones', 'unidades', 'mp_tipos'])
    },
    methods: {
        async loadCategorias(txtBuscar) {
            const qry = {
                fltr: { activo: { op: 'Es', val: true } },
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
                limt: 25,
            }

            if (txtBuscar) {
                qry.fltr.nombre = { op: 'Contiene', val: txtBuscar }
            }

            const res = await get(`${urls.articulo_categorias}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return []

            return res.data
        },
    },
}
</script>
