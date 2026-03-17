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
            :lista="igv_afectaciones || []"
            :disabled="vista.mode != 'edit'"
        />

        <JdSelect
            label="Unidad"
            :nec="true"
            v-model="vista.data.unidad"
            :lista="unidades"
            mostrar="nombre_completo"
            :disabled="vista.mode != 'edit'"
        />

        <JdSelectQuery
            label="Categoría"
            :spin="vista.spin_articulo_categorias"
            :lista="vista.articulo_categorias"
            @search="loadCategorias"
            v-model="vista.data.categoria"
            :disabled="vista.mode != 'edit'"
        />

        <JdSelect
            label="Tipo de materia prima"
            :lista="mp_tipos || []"
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
import { JdInput, JdSelect } from '@jhuler/components'
import JdSelectQuery from '@/components/inputs/JdSelectQuery.vue'
import { get, urls } from '@/utils/crud'

export default {
    components: {
        JdInput,
        JdSelect,
        JdSelectQuery,
    },
    computed: {
        useSystem: () => useSystem(),
        vistas: () => useVistas(),
    },
    data: () => ({
        vista: {},

        // Datos del sistema
        igv_afectaciones: [],
        unidades: [],
        mp_tipos: [],

        materiaprima_id: 'f000be66-e4b1-4334-b57a-0e356eb8c7a6',
    }),
    async created() {
        this.vista = this.vistas.vArticuloDetalle

        this.loadDatosSistema()
    },
    methods: {
        async loadDatosSistema() {
            const keys = ['igv_afectaciones', 'unidades', 'mp_tipos']
            const toLoad = keys.filter((key) => this.useSystem.get(key).length === 0)
            if (toLoad.length > 0) {
                await this.useSystem.load(toLoad)
            }

            this.igv_afectaciones = this.useSystem.get('igv_afectaciones')
            this.unidades = this.useSystem.get('unidades')
            this.mp_tipos = this.useSystem.get('mp_tipos')
        },
        async loadCategorias(txtBuscar) {
            if (!txtBuscar) {
                this.vista.articulo_categorias.length = 0
                return
            }

            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
            }

            this.vista.articulo_categorias = []
            this.vista.spin_articulo_categorias = true
            const res = await get(`${urls.articulo_categorias}?qry=${JSON.stringify(qry)}`)
            this.vista.spin_articulo_categorias = false

            if (res.code != 0) return

            this.vista.articulo_categorias = res.data
        },
    },
}
</script>
