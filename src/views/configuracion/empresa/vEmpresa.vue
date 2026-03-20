<template>
    <VistaDetalleLayout
        v-if="vista && vista.data"
        vistaName="vEmpresa"
        :pestanas="availableTabs"
        @runMethod="runMethod"
    >
        <template #principal-datos>
            <JdInput
                label="RUC"
                :nec="true"
                v-model="vista.data.ruc"
                :disabled="!is_nuevo ? true : vista.mode == 'view'"
            />

            <JdInput
                label="Razón Social"
                :nec="true"
                v-model="vista.data.razon_social"
                style="grid-column: 1/3"
                :disabled="!is_nuevo ? true : vista.mode == 'view'"
            />

            <JdInput
                label="Nombre Comercial"
                v-model="vista.data.nombre_comercial"
                style="grid-column: 1/3"
                :disabled="vista.mode != 'edit'"
            />

            <JdInputImage
                v-model="vista.data.logo"
                @handleFile="(file) => (vista.data.archivo = file)"
                @deleteFile="vista.data.archivo = null"
                :disabled="vista.mode != 'edit'"
                style="grid-column: 4/5; grid-row: 1/4"
            />
        </template>

        <template #pestanas-body>
            <vEmpresaDetalleGeneral v-show="vista.pestana == 1" />
            <vEmpresaDetalleSocial v-show="vista.pestana == 2" />
            <vEmpresaDetalleDirecciones v-show="vista.pestana == 3" />
            <vEmpresaDetalleBancos v-show="vista.pestana == 4" />
            <vEmpresaDetalleModulos v-show="vista.pestana == 5" />
        </template>
    </VistaDetalleLayout>
</template>

<script>
// Componentes locales
import vEmpresaDetalleGeneral from './vEmpresaDetalleGeneral.vue'
import vEmpresaDetalleSocial from './vEmpresaDetalleSocial.vue'
import vEmpresaDetalleDirecciones from './vEmpresaDetalleDirecciones.vue'
import vEmpresaDetalleBancos from './vEmpresaDetalleBancos.vue'
import vEmpresaDetalleModulos from './vEmpresaDetalleModulos.vue'

// Configuración y Stores
import VIEW_CONFIG from './empresa.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { urls, get, post, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine.js'

export default {
    name: 'vEmpresa',
    components: {
        vEmpresaDetalleGeneral,
        vEmpresaDetalleSocial,
        vEmpresaDetalleDirecciones,
        vEmpresaDetalleBancos,
        vEmpresaDetalleModulos,
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
        availableTabs() {
            const tabs = [
                { id: 1, label: 'General', show: true },
                { id: 3, label: 'Direcciones', show: true },
                { id: 4, label: 'Bancos', show: true },
                { id: 2, label: 'Redes y links', show: true },
            ]

            if (this.auth.empresa.subdominio === 'admin') {
                tabs.push({ id: 5, label: 'Módulos', show: true })
            }

            return tabs
        },
        is_nuevo() {
            return this.$route.params.id === 'nuevo'
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
            const param_id = this.$route.params.id

            if (param_id === 'nuevo') {
                this.vista.data = {
                    igv_porcentaje: 18,
                    direcciones: [],
                    bancos: [],
                }
                this.vista.mode = 'edit'
                return
            }

            const id = this.$route.name == 'vEmpresa' ? this.auth.empresa.id : param_id

            this.auth.setLoading(true, 'Cargando datos de empresa...')
            const res = await get(`${urls.empresas}/uno/${id}`)
            this.auth.setLoading(false)

            if (res.code === 0) {
                this.vista.data = res.data
                document.title = `${this.vista.data.razon_social}`
            }
        },

        // --- Header actions ---
        async guardar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.auth.setLoading(true, 'Guardando...')
            let res
            if (this.is_nuevo) {
                res = await post(urls.empresas, this.vista.data)
            } else {
                res = await patch(urls.empresas, this.vista.data)
            }
            this.auth.setLoading(false)

            if (res.code != 0) return

            if (this.is_nuevo) {
                this.$router.push({ name: 'vAdminEmpresaDetalle', params: { id: res.data.id } })
            }

            this.vista.mode = 'view'
        },

        checkDatos() {
            const props = ['razon_social', 'ruc', 'subdominio', 'igv_porcentaje']
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
