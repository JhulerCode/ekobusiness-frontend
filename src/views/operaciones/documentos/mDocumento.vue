<template>
    <JdModal modal="mDocumento" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <template v-if="documento.tipo == 1">
                <JdInput label="Nombre" :nec="true" v-model="documento.nombre" />
                <JdTextArea label="Descripción" v-model="documento.descripcion" />
            </template>

            <template v-if="documento.tipo == 2">
                <JdTextArea
                    label="Denominación legal"
                    :nec="true"
                    v-model="documento.denominacion_legal"
                />
                <JdTextArea
                    label="Denominación comercial"
                    :nec="true"
                    v-model="documento.denominacion_comercial"
                />
                <JdInput
                    label="Registro sanitario"
                    :nec="true"
                    v-model="documento.registro_sanitario"
                />
            </template>

            <JdInput
                label="Fecha de emisión"
                :nec="true"
                type="date"
                v-model="documento.fecha_emision"
            />
            <JdInput
                label="Fecha de vencimiento"
                :nec="true"
                type="date"
                v-model="documento.fecha_vencimiento"
            />
            <JdInput
                label="Recodar días antes"
                :nec="true"
                type="number"
                v-model="documento.recordar_dias"
            />

            <JdInputFile
                label="Documento"
                accept="application/pdf"
                v-model="documento.file_name"
                @handleFile="(file) => (documento.archivo = file)"
                @deleteFile="documento.archivo = null"
            />
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdTextArea, JdInputFile } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdTextArea,
        JdInputFile,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        documento: {},

        buttons: [
            { text: 'Grabar', action: 'crear', spin: false },
            { text: 'Actualizar', action: 'modificar', spin: false },
        ],
    }),
    created() {
        this.documento = this.useModals.mDocumento.item

        this.showButtons()
    },
    methods: {
        showButtons() {
            if (this.useModals.mDocumento.mode == 1) {
                this.buttons[0].show = true
            } else {
                this.buttons[1].show = true
            }
        },

        checkDatos() {
            const props = ['tipo', 'fecha_emision', 'fecha_vencimiento', 'recordar_dias']

            if (this.documento.tipo == 1) props.push('nombre')
            if (this.documento.tipo == 2)
                props.push('denominacion_legal', 'denominacion_comercial', 'registro_sanitario')

            if (incompleteData(this.documento, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            if (this.documento.fecha_emision > this.documento.fecha_vencimiento) {
                jmsg('warning', 'La fecha de vencimiento debe ser mayor a la fecha de emisión')
                return true
            }

            return false
        },
        shapeDatos() {
            if (this.documento.archivo) this.documento.formData = true
        },
        async crear() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Creando...')
            const res = await post(urls.documentos, this.documento)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const vista = this.documento.tipo == 1 ? 'vDocumentos' : 'vRegistrosSanitarios'
            this.useVistas.addItem(vista, 'documentos', res.data)
            this.useModals.show.mDocumento = false
        },
        // modificar1() {
        //     if (this.checkDatos()) return
        //     console.log(this.documento)
        // },
        async modificar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.documentos, this.documento)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const vista = this.documento.tipo == 1 ? 'vDocumentos' : 'vRegistrosSanitarios'
            this.useVistas.updateItem(vista, 'documentos', res.data)
            this.useModals.show.mDocumento = false
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 30rem;
    gap: 0.5rem;
}
</style>
