<template>
    <VistaDetalleLayout
        v-if="vista && vista.data"
        :vistaName="VIEW_CONFIG_NAME"
        :title="vista.data.nombre"
        :pestanas="availableTabs"
        @runMethod="runMethod"
    >
        <template #principal-datos>
            <JdInput
                label="Nombre"
                :nec="true"
                v-model="vista.data.nombre"
                style="grid-column: 1/3"
                :disabled="vista.mode != 'edit'"
            />

            <JdSelect
                label="Tipo"
                :nec="true"
                :lista="articulo_tipos || []"
                v-model="vista.data.type"
                style="grid-column: 1/2"
                :disabled="vista.mode != 'edit'"
            />

            <div class="flags">
                <JdCheckBox
                    label="Se vende"
                    :nec="true"
                    v-model="vista.data.sale_ok"
                    :disabled="vista.mode != 'edit'"
                />

                <JdCheckBox
                    label="Se compra"
                    :nec="true"
                    v-model="vista.data.purchase_ok"
                    v-if="vista.data.type != 'combo'"
                    :disabled="vista.mode != 'edit'"
                />

                <JdCheckBox
                    label="Se produce"
                    :nec="true"
                    v-model="vista.data.produce_ok"
                    v-if="vista.data.type == 'consumable'"
                    :disabled="vista.mode != 'edit'"
                />

                <JdSwitch
                    label="Activo?"
                    v-model="vista.data.activo"
                    :disabled="vista.mode != 'edit'"
                />
            </div>
        </template>

        <template #pestanas-body>
            <vArticuloDetalleGeneral v-if="vista.pestana == 1" />
            <vArticuloDetalleCompra v-if="vista.pestana == 2" />
            <vArticuloDetalleVenta v-if="vista.pestana == 3" />

            <vArticuloDetalleInventario v-if="vista.pestana == 4" />
            <vArticuloDetalleProduccion v-if="vista.pestana == 5" />

            <vArticuloDetalleComponentes v-if="vista.pestana == 6" />
        </template>
    </VistaDetalleLayout>
</template>

<script>
import { JdInput, JdSwitch, JdCheckBox, JdSelect } from '@jhuler/components'
import { get, urls } from '@/utils/crud'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useSystem } from '@/pinia/system'

// Configuración de la vista
import VIEW_CONFIG from './articulos.config.js'

// Subcomponentes
import vArticuloDetalleGeneral from './vArticuloDetalleGeneral.vue'
import vArticuloDetalleCompra from './vArticuloDetalleCompra.vue'
import vArticuloDetalleVenta from './vArticuloDetalleVenta.vue'
import vArticuloDetalleInventario from './vArticuloDetalleInventario.vue'
import vArticuloDetalleProduccion from './vArticuloDetalleProduccion.vue'
import vArticuloDetalleComponentes from './vArticuloDetalleComponentes.vue'

export default {
    components: {
        JdInput,
        JdSelect,
        JdSwitch,
        JdCheckBox,

        vArticuloDetalleGeneral,
        vArticuloDetalleCompra,
        vArticuloDetalleVenta,
        vArticuloDetalleInventario,
        vArticuloDetalleProduccion,
        vArticuloDetalleComponentes,
    },
    data: () => ({
        pestana: 1,

        // Datos del sistema
        articulo_tipos: [],
    }),
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        useSystem: () => useSystem(),
        vista() {
            return this.vistas[VIEW_CONFIG.name]
        },
        VIEW_CONFIG_NAME() {
            return VIEW_CONFIG.name
        },
        availableTabs() {
            if (!this.vista.data) return []

            return [
                { id: 1, label: 'General', show: true },
                { id: 2, label: 'Compra', show: this.vista.data.purchase_ok },
                { id: 3, label: 'Venta', show: this.vista.data.sale_ok },
                { id: 4, label: 'Inventario', show: this.vista.data.type == 'consumable' },
                { id: 5, label: 'Producción', show: this.vista.data.produce_ok },
                { id: 6, label: 'Componentes', show: this.vista.data.type == 'combo' },
            ]
        },
    },
    async created() {
        // 1. Inicialización de la vista
        this.vistas.initVista(VIEW_CONFIG.name, {
            ...JSON.parse(JSON.stringify(VIEW_CONFIG)),
            apiUrl: urls[VIEW_CONFIG.apiPath],
            pestana: 1,
        })

        // 2. Carga inicial
        await this.loadArticuloTipos()
        await this.loadArticulo()
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        async loadArticulo() {
            const qry = {
                incl: ['categoria1', 'linea1'],
            }

            this.auth.setLoading(true, 'Cargando artículo...')
            const res = await get(
                `${urls.articulos}/uno/${this.$route.params.id}?qry=${JSON.stringify(qry)}`,
            )
            this.auth.setLoading(false)

            if (res.code === 0) {
                this.vista.data = res.data
                document.title = `${this.vista.data.nombre}`

                this.vista.articulo_categorias = [{ ...res.data.categoria1 }]
                this.vista.articulo_linea = [{ ...res.data.linea1 }]
            }
        },

        // --- Header actions ---
        editar() {
            this.vista.mode = 'edit'
            this.updateHeaderActions()
        },
        cancelar() {
            this.vista.mode = 'view'
            // Opcional: recargar el artículo para deshacer cambios
            // this.loadArticulo()
            this.updateHeaderActions()
        },
        guardar() {
            // Lógica final para de guardar aquí (ej: PUT/POST)
            // ...
            this.vista.mode = 'view'
            this.updateHeaderActions()
        },
        updateHeaderActions() {
            const isEdit = this.vista.mode === 'edit'
            if (this.vista.headerActions) {
                this.vista.headerActions.forEach((action) => {
                    if (action.action === 'editar') action.show = !isEdit
                    if (action.action === 'cancelar') action.show = isEdit
                    if (action.action === 'guardar') action.show = isEdit
                })
            }
        },

        // --- Data auxiliar ---
        async loadArticuloTipos() {
            await this.useSystem.load(['articulo_tipos'])
            this.articulo_tipos = this.useSystem.get('articulo_tipos')
        },
    },
}
</script>

<style lang="scss" scoped>
.flags {
    grid-column: 1/3;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}
</style>
