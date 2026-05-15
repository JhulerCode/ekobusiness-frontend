<template>
    <JdModal modal="mFormatoValue" :buttons="buttons" @button-click="(action) => this[action]()">
        <FormatoRenderer
            ref="documentRef"
            :estructura="modal.estructura"
            :values="modal.formato_value.values"
            :listas="modal.listas"
            :mode="modal.mode"
            @elegir-obj="
                (obj, fieldId) => {
                    modal.formato_value.values[fieldId + '1'] = obj
                }
            "
        />
    </JdModal>
</template>

<script>
import FormatoRenderer from './FormatoRenderer.vue'
import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'
import { urls, post, patch } from '@/utils/crud'
import html2pdf from 'html2pdf.js'

export default {
    name: 'mFormatoValue',
    components: { FormatoRenderer },
    data: () => ({
        auth: useAuth(),
        modals: useModals(),

        modal: {},
    }),
    computed: {
        buttons() {
            return [
                { text: 'Grabar', action: 'grabar', show: this.modal.mode == 1 },
                { text: 'Cancelar', action: 'cancelEdit', tipo: 2, show: this.modal.mode == 2 },
                { text: 'Modificar', action: 'modificar', show: this.modal.mode == 2 },
                { text: 'Editar', action: 'editar', tipo: 2, show: this.modal.mode == 3 },
                { text: 'Exportar PDF', action: 'exportarPdf', show: this.modal.mode == 3 },
            ]
        },
    },
    created() {
        this.modal = this.modals.mFormatoValue
        if (!this.modal.formato_value) this.modal.formato_value = { values: {} }
        if (!this.modal.formato_value.values) this.modal.formato_value.values = {}
        this.initializeValues()
    },
    methods: {
        initializeValues() {
            const entityName = this.modal.estructura?.entity
            const entityData = entityName
                ? this.modal[entityName + '1'] || this.modal[entityName]
                : null

            const processBlocks = (blocks) => {
                if (!blocks) return
                blocks.forEach((block) => {
                    if (block.props?.fieldId && block.props?.relatedPath && entityData) {
                        // Solo inicializamos si el valor actual está vacío (para no sobreescribir datos cargados)
                        if (
                            this.modal.formato_value.values[block.props.fieldId] === undefined ||
                            this.modal.formato_value.values[block.props.fieldId] === null ||
                            this.modal.formato_value.values[block.props.fieldId] === ''
                        ) {
                            const value = block.props.relatedPath
                                .split('.')
                                .reduce((acc, key) => acc?.[key], entityData)

                            if (value !== undefined && value !== null) {
                                this.modal.formato_value.values[block.props.fieldId] = value
                            }
                        }
                    }
                    if (block.children) {
                        processBlocks(block.children)
                    }
                })
            }

            if (this.modal.estructura?.structure) {
                processBlocks([this.modal.estructura.structure])
            }
        },
        async grabar() {
            this.auth.setLoading(true, 'Grabando...')
            const res = await post(urls.formato_values, this.modal.formato_value)
            this.auth.setLoading(false)
            if (res.code != 0) return
            this.modal.formato_value.id = res.data.id
            this.modal.mode = 3
        },
        editar() {
            this.modal.original_data = JSON.parse(JSON.stringify(this.modal.formato_value.values))
            this.modal.mode = 2
        },
        cancelEdit() {
            this.modal.formato_value.values = JSON.parse(JSON.stringify(this.modal.original_data))
            this.modal.mode = 3
        },
        async modificar() {
            this.auth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.formato_values, this.modal.formato_value)
            this.auth.setLoading(false)
            if (res.code != 0) return
            this.modal.mode = 3
        },
        async exportarPdf() {
            this.auth.setLoading(true, 'Generando PDF...')
            const element = this.$refs.documentRef.elementoPdf

            const opciones = {
                margin: 0.5,
                filename: `${Date.now()}.pdf`,
                image: { type: 'jpeg', quality: 1 },
                html2canvas: { scale: 4, useCORS: true },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
            }

            const worker = html2pdf().set(opciones).from(element).toPdf()
            const pdf = await worker.get('pdf')
            const totalPages = pdf.internal.getNumberOfPages()

            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i)
                pdf.setFontSize(8)
                pdf.setTextColor(150)
                pdf.text(
                    `Página ${i} de ${totalPages}`,
                    pdf.internal.pageSize.getWidth() / 2,
                    pdf.internal.pageSize.getHeight() - 0.25,
                    { align: 'center' },
                )
            }

            await worker.save()
            this.auth.setLoading(false)
        },
    },
}
</script>

<style lang="scss" scoped></style>
