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
import FormatoRenderer from '@/components/formatos/FormatoRenderer.vue'
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
            this.modal.formato_value = res.data
            this.modal.mode = 3
            this.$emit('created', res.data)
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
        cssToInches(value) {
            if (!value || typeof value !== 'string') return 0
            const num = parseFloat(value)
            if (isNaN(num)) return 0

            const unit = value.replace(/[\d.\-+\s]/g, '').toLowerCase()

            switch (unit) {
                case 'in':
                    return num
                case 'cm':
                    return num / 2.54
                case 'mm':
                    return num / 25.4
                case 'px':
                    return num / 96
                case 'pt':
                    return num / 72
                case 'rem':
                case 'em':
                    // 1rem/em ≈ 16px at default browser settings
                    return (num * 16) / 96
                default:
                    // If no unit, assume px
                    return num / 96
            }
        },
        async exportarPdf() {
            this.auth.setLoading(true, 'Generando PDF...')
            const container = this.$refs.documentRef.elementoPdf
            // const pageSheet = container.querySelector('.page-sheet')
            const pageReal = container.querySelector('.page-real')
            const docConfig = this.modal.estructura?.config || {}

            const marginTop = this.cssToInches(docConfig.paddingTop)
            const marginRight = this.cssToInches(docConfig.paddingRight)
            const marginBottom = this.cssToInches(docConfig.paddingBottom)
            const marginLeft = this.cssToInches(docConfig.paddingLeft)
            const paperFormat = (docConfig.paperSize || 'A4').toLowerCase()
            const orientation = docConfig.orientation === 'landscape' ? 'l' : 'p'

            const opciones = {
                margin: [marginTop, marginLeft, marginBottom, marginRight],
                filename: `${Date.now()}.pdf`,
                image: { type: 'jpeg', quality: 1 },
                html2canvas: { scale: 4, useCORS: true },
                jsPDF: { unit: 'in', format: paperFormat, orientation: orientation },
            }

            let worker = html2pdf().set(opciones).from(pageReal).toPdf()

            const pdf = await worker.get('pdf')
            const totalPages = pdf.internal.getNumberOfPages()

            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i)
                pdf.setFontSize(8)
                pdf.setTextColor(150)

                const width = pdf.internal.pageSize.getWidth()
                const height = pdf.internal.pageSize.getHeight()

                pdf.text(`Página ${i} de ${totalPages}`, width / 2, height - 0.25, {
                    align: 'center',
                })
            }

            await worker.save()

            this.auth.setLoading(false)
        },
    },
}
</script>

<style lang="scss" scoped></style>
