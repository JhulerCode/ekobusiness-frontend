<template>
    <VistaDetalleLayout
        :config="VIEW_CONFIG"
        :pestanas="availableTabs"
        :loadNewData="loadNewData"
        :loadExistingData="loadExistingData"
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
            <vEmpresaGeneral v-show="vista.pestana == 1" />
            <vEmpresaSocial v-show="vista.pestana == 2" />
            <vEmpresaDirecciones v-show="vista.pestana == 3" />
            <vEmpresaBancos v-show="vista.pestana == 4" />
            <vEmpresaModulos v-show="vista.pestana == 5" />
        </template>
    </VistaDetalleLayout>
</template>

<script>
import vEmpresaGeneral from './vEmpresaGeneral.vue'
import vEmpresaSocial from './vEmpresaSocial.vue'
import vEmpresaDirecciones from './vEmpresaDirecciones.vue'
import vEmpresaBancos from './vEmpresaBancos.vue'
import vEmpresaModulos from './vEmpresaModulos.vue'

import VIEW_CONFIG from './empresa.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { urls, get, post, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine.js'

export default {
    components: {
        vEmpresaGeneral,
        vEmpresaSocial,
        vEmpresaDirecciones,
        vEmpresaBancos,
        vEmpresaModulos,
    },
    data: () => ({
        VIEW_CONFIG,
        auth: useAuth(),
        vistas: useVistas(),
    }),
    computed: {
        vista() {
            return this.vistas[this.$route.name]
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
            return this.$route.params[this.vista.pathKey] === 'nuevo'
        },
    },
    created() {
        console.log(this.$route.name)
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        async loadNewData() {
            this.vista.data = {
                igv_porcentaje: 18,
                direcciones: [],
                bancos: [],
            }
        },
        async loadExistingData() {
            const param_id = this.$route.params[this.vista.pathKey]
            const id = this.$route.name == 'vEmpresa' ? this.auth.empresa.id : param_id

            this.auth.setLoading(true, 'Cargando datos de empresa...')
            const res = await get(`${urls.empresas}/uno/${id}`)
            this.auth.setLoading(false)

            console.log('ASD', res.data)

            if (res.code === 0 && res.data) {
                this.vista.data = res.data

                if (this.$route.name != 'vEmpresa') {
                    document.title = `${this.vista.data[this.vista.titleKey]}`
                }
            }
        },

        //--- Header actions ---//
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
                this.$router.push({
                    name: 'vAdminEmpresa',
                    params: { [this.vista.pathKey]: res.data.id },
                })
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
