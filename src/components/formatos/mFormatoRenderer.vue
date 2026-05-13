<template>
    <JdModal
        modal="mFormatoRenderer"
        :buttons="buttons"
        @button-click="(action) => actions[action]()"
    >
        <div class="renderer-side">
            <FormatoDocument
                ref="documentRef"
                :estructura="estructura"
                :values="modal.formato_value.values"
                :listas="listas"
                :mode="modal.mode"
                @elegir-obj="(obj, fieldId) => {
                    modal.formato_value.values[fieldId + '1'] = obj
                }"
            />
        </div>
    </JdModal>
</template>

<script setup>
import { computed, ref } from 'vue'
import FormatoDocument from './FormatoDocument.vue'
import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'
import { urls, post, patch } from '@/utils/crud'
import html2pdf from 'html2pdf.js'

const modals = useModals()
const auth = useAuth()
const documentRef = ref(null)
const modal = modals.mFormatoRenderer

// Initialize formatting values if they don't exist
if (!modal.formato_value) modal.formato_value = { values: {} }
if (!modal.formato_value.values) modal.formato_value.values = {}

const estructura = computed(() => {
    return {
        header: modal.header || {},
        layout: modal.layout || [],
        fields: modal.fields || [],
        instructivo: modal.instructivo || [],
    }
})

const listas = computed(() => {
    return modal.listas || {}
})

const buttons = computed(() => {
    return [
        { text: 'Grabar', action: 'grabar', show: modal.mode == 1 },
        { text: 'Cancelar', action: 'cancelEdit', tipo: 2, show: modal.mode == 2 },
        { text: 'Modificar', action: 'modificar', show: modal.mode == 2 },
        { text: 'Editar', action: 'editar', tipo: 2, show: modal.mode == 3 },
        { text: 'Exportar PDF', action: 'exportarPdf', show: modal.mode == 3 },
    ]
})

const initializeValues = () => {
    if (!estructura.value?.fields) return

    estructura.value.fields.forEach((field) => {
        if (!field.related) return

        const entityData = modal[field.related.entity]
        if (!entityData) return

        modal.formato_value.values[field.id] = field.related.path
            .split('.')
            .reduce((acc, key) => acc?.[key], entityData)
    })
}
initializeValues()

const actions = {
    grabar: async () => {
        auth.setLoading(true, 'Grabando...')
        const res = await post(urls.formato_values, modal.formato_value)
        auth.setLoading(false)
        if (res.code != 0) return
        modal.formato_value.id = res.data.id
        modal.mode = 3
    },
    editar: () => {
        modal.original_data = JSON.parse(JSON.stringify(modal.formato_value.values))
        modal.mode = 2
    },
    cancelEdit: () => {
        modal.formato_value.values = JSON.parse(JSON.stringify(modal.original_data))
        modal.mode = 3
    },
    modificar: async () => {
        auth.setLoading(true, 'Actualizando...')
        const res = await patch(urls.formato_values, modal.formato_value)
        auth.setLoading(false)
        if (res.code != 0) return
        modal.mode = 3
    },
    exportarPdf: async () => {
        auth.setLoading(true, 'Generando PDF...')
        const element = documentRef.value.elementoPdf

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
        auth.setLoading(false)
    },
}
</script>

<style lang="scss" scoped>
.renderer-side {
    overflow-y: auto;
    display: flex;
    justify-content: center;
    background-color: #525659;
    padding: 2rem;
    box-shadow: inset 0 0 2rem rgba(0, 0, 0, 0.5);
    min-height: 80vh;
}
</style>
