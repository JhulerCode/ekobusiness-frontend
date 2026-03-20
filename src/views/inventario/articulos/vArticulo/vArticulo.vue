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
                :lista="vista.articulo_tipos || []"
                v-model="vista.data.type"
                style="grid-column: 1/2"
                :disabled="vista.mode != 'edit'"
                @elegir="setArticuloType"
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
            <vArticuloGeneral v-if="vista.pestana == 1" />
            <vArticuloCompra v-if="vista.pestana == 2" />
            <vArticuloVenta v-if="vista.pestana == 3" />

            <vArticuloInventario v-if="vista.pestana == 4" />
            <vArticuloProduccion v-if="vista.pestana == 5" />

            <vArticuloComponentes v-if="vista.pestana == 6" />
        </template>
    </VistaDetalleLayout>
</template>

<script>
import VIEW_CONFIG from './articulos.config.js'

import vArticuloGeneral from './vArticuloGeneral.vue'
import vArticuloCompra from './vArticuloCompra.vue'
import vArticuloVenta from './vArticuloVenta.vue'
import vArticuloInventario from './vArticuloInventario.vue'
import vArticuloProduccion from './vArticuloProduccion.vue'
import vArticuloComponentes from './vArticuloComponentes.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useSystem } from '@/pinia/system'
import { urls, get, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine.js'
import { jmsg } from '@/utils/swal.js'

export default {
    components: {
        vArticuloGeneral,
        vArticuloCompra,
        vArticuloVenta,
        vArticuloInventario,
        vArticuloProduccion,
        vArticuloComponentes,
    },
    data: () => ({
        pestana: 1,
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
    unmounted() {
        delete this.vistas[VIEW_CONFIG.name]
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
            }
        },

        // --- Header actions ---
        editar() {
            this.vista.original_data = JSON.parse(JSON.stringify(this.vista.data))
            this.updateHeaderActions('edit')
        },
        cancelar() {
            this.vista.data = JSON.parse(JSON.stringify(this.vista.original_data))
            this.updateHeaderActions('view')
        },
        async guardar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.auth.setLoading(true)
            const res = await patch(urls.articulos, this.vista.data)
            this.auth.setLoading(false)

            if (res.code != 0) return

            this.updateHeaderActions('view')
        },

        // -- Methods auxiliares ---
        setArticuloType() {
            if (this.vista.data.type == 'combo') {
                this.vista.data.purchase_ok = false
                this.vista.data.produce_ok = false
            }

            if (this.vista.data.type == 'service') {
                this.vista.data.produce_ok = false
            }
        },
        updateHeaderActions(mode) {
            this.vista.mode = mode
            const isEdit = mode === 'edit'
            if (this.vista.headerActions) {
                this.vista.headerActions.forEach((action) => {
                    if (action.action === 'editar') action.show = !isEdit
                    if (action.action === 'cancelar') action.show = isEdit
                    if (action.action === 'guardar') action.show = isEdit
                })
            }
        },
        checkDatos() {
            const props = ['nombre', 'type', 'igv_afectacion', 'unidad']

            if (this.vista.data.type == 'combo') {
                if (this.vista.data.combo_componentes.length == 0) {
                    jmsg('warning', 'Agregue al menos un componente')
                    return true
                }

                for (const a of this.vista.data.combo_componentes) {
                    if (incompleteData(a, ['articulo', 'cantidad'])) {
                        jmsg('warning', 'Ingrese los datos necesarios')
                        return true
                    }
                }
            }

            if (this.vista.data.sale_ok == true) {
                if (this.vista.data.is_ecommerce == true) {
                    props.push('descripcion', 'precio')
                }
            }

            if (incompleteData(this.vista.data, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        shapeDatos() {
            if (this.vista.data.type == 'combo') {
                this.vista.data.purchase_ok = false
            }

            if (this.vista.data.precio_anterior == '') {
                this.vista.data.precio_anterior = null
            }
        },

        // --- Data auxiliar ---
        async loadArticuloTipos() {
            await this.useSystem.load(['articulo_tipos'])
            this.vista.articulo_tipos = this.useSystem.get('articulo_tipos')
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
