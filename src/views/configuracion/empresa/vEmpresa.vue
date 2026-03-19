<template>
    <VistaDetalleLayout
        v-if="vista && vista.data"
        :vistaName="VIEW_CONFIG_NAME"
        :title="VIEW_CONFIG_TITLE"
        :pestanas="availableTabs"
        @runMethod="runMethod"
    >
        <template #principal-datos>
            <JdInput label="RUC" :nec="true" v-model="vista.data.ruc" :disabled="true" />

            <JdInput
                label="Razón Social"
                :nec="true"
                v-model="vista.data.razon_social"
                style="grid-column: 1/3"
                :disabled="true"
            />

            <JdInput
                label="Nombre Comercial"
                v-model="vista.data.nombre_comercial"
                style="grid-column: 1/3"
                :disabled="vista.mode != 'edit'"
            />

            <JdInputFile
                label="Logo"
                :nec="true"
                accept="image/*"
                v-model="vista.data.logo"
                @handleFile="(file, blob) => ((vista.data.archivo = file), (vista.blob = blob))"
                @deleteFile="((vista.data.archivo = null), (vista.blob = null))"
                :disabled="vista.mode != 'edit'"
            />

            <div class="empresa-logo" style="grid-column: 4/5; grid-row: 1/4">
                <img
                    :src="vista.blob"
                    :alt="'logo-' + vista.data.razon_social"
                    v-if="vista.data.archivo"
                />
                <img
                    :src="vista.data.logo.url"
                    :alt="'logo-' + vista.data.razon_social"
                    v-if="vista.data.logo?.url"
                />
            </div>
        </template>

        <template #pestanas-body>
            <vEmpresaDetalleGeneral v-show="vista.pestana == 1" />
            <vEmpresaDetalleSocial v-show="vista.pestana == 2" />
            <vEmpresaDetalleDirecciones v-show="vista.pestana == 3" />
            <vEmpresaDetalleBancos v-show="vista.pestana == 4" />
        </template>
    </VistaDetalleLayout>
</template>

<script>
// Componentes locales
import vEmpresaDetalleGeneral from './vEmpresaDetalleGeneral.vue'
import vEmpresaDetalleSocial from './vEmpresaDetalleSocial.vue'
import vEmpresaDetalleDirecciones from './vEmpresaDetalleDirecciones.vue'
import vEmpresaDetalleBancos from './vEmpresaDetalleBancos.vue'

// Configuración y Stores
import VIEW_CONFIG from './empresa.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { urls, get, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine.js'

export default {
    name: 'vEmpresa',
    components: {
        vEmpresaDetalleGeneral,
        vEmpresaDetalleSocial,
        vEmpresaDetalleDirecciones,
        vEmpresaDetalleBancos,
    },
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        vista() {
            return this.vistas[VIEW_CONFIG.name]
        },
        VIEW_CONFIG_NAME() {
            return VIEW_CONFIG.name
        },
        VIEW_CONFIG_TITLE() {
            return VIEW_CONFIG.title
        },
        availableTabs() {
            return [
                { id: 1, label: 'General', show: true },
                { id: 3, label: 'Direcciones', show: true },
                { id: 4, label: 'Bancos', show: true },
                { id: 2, label: 'Redes y links', show: true },
            ]
        },
    },
    async created() {
        // 1. Inicialización de la vista
        this.vistas.initVista(VIEW_CONFIG.name, {
            ...JSON.parse(JSON.stringify(VIEW_CONFIG)),
            apiUrl: urls[VIEW_CONFIG.apiPath],
            pestana: 1,
            mode: 'view',
        })

        // 2. Carga de datos
        await this.loadEmpresa()
    },
    unmounted() {
        delete this.vistas[VIEW_CONFIG.name]
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        async loadEmpresa() {
            this.auth.setLoading(true, 'Cargando datos de empresa...')
            const res = await get(`${urls.empresas}/uno/mi-empresa`)
            this.auth.setLoading(false)

            if (res.code === 0) {
                this.vista.data = res.data
                document.title = `${this.vista.data.razon_social}`
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

            this.auth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.empresas, this.vista.data)
            this.auth.setLoading(false)

            if (res.code != 0) return

            this.updateHeaderActions('view')
        },

        // -- Methods auxiliares ---
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
            const props = ['razon_social', 'ruc']
            if (incompleteData(this.vista.data, props)) {
                return true
            }
            return false
        },
        shapeDatos() {
            if (this.vista.data.archivo) this.vista.data.formData = true
        },
    },
}
</script>

<style lang="scss" scoped>
.empresa-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    border: var(--border);

    img {
        max-width: calc(100% - 1rem);
        border-radius: 0.5rem;
    }
}
</style>
