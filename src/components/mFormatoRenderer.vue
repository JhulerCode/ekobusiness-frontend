<template>
    <JdModal
        modal="mFormatoRenderer"
        :buttons="buttons"
        @button-click="(action) => actions[action]()"
    >
        <div class="extra-space">
            <div ref="elementoPdf" class="pdfall">
                <div class="document-header">
                    <div class="header-left" crossorigin="anonymous">
                        <img :src="auth.empresa?.logo?.url" class="logo" />
                    </div>

                    <div class="header-center">
                        <div class="header-system">{{ estructura.header.topTitle }}</div>

                        <div class="header-title">
                            {{ estructura.header.title }}
                        </div>
                    </div>

                    <div class="header-right">
                        <div
                            v-for="item in estructura.header.rightInfo"
                            :key="item.label"
                            class="header-info-row"
                        >
                            {{ item.label }}: {{ item.value }}
                        </div>
                    </div>
                </div>

                <div v-for="section in estructura.layout" :key="section.title" class="section">
                    <div class="section-header">
                        <strong>{{ section.title }}</strong>
                    </div>

                    <div class="section-body">
                        <div
                            v-for="(row, rowIndex) in section.rows"
                            :key="rowIndex"
                            class="row"
                            :style="{ 'margin-bottom': modal.mode == 3 ? '0.75rem' : '0.5rem' }"
                        >
                            <div
                                v-for="column in row.columns"
                                :key="column.field"
                                class="column"
                                :class="'col-' + column.span"
                            >
                                <FieldRenderer
                                    :field="getField(column.field)"
                                    v-model="modal.values[column.field]"
                                    :listas="listas"
                                    :mode="modal.mode"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="estructura.instructivo">
                    <h3 class="section">Instructivo</h3>
                    <ul class="instructivo">
                        <li v-for="(a, i) in estructura.instructivo" :key="i">
                            {{ a }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </JdModal>
</template>

<script setup>
import { computed, ref } from 'vue'
import FieldRenderer from './FieldRenderer.vue'
import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'
import { urls, post, patch } from '@/utils/crud'
import html2pdf from 'html2pdf.js'

const modals = useModals()
const auth = useAuth()
// const form = reactive({})
const elementoPdf = ref(null)
const modal = modals.mFormatoRenderer

const getField = (fieldId) => {
    return estructura.value.fields.find((x) => x.id === fieldId)
}

const estructura = computed(() => {
    return modal.estructura || {}
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

const actions = {
    grabar: async () => {
        auth.setLoading(true, 'Grabando...')
        const res = await post(urls.formato_values, modal.values)
        auth.setLoading(false)

        if (res.code != 0) return

        modal.mode = 3
    },
    editar: () => {
        modal.original_data = JSON.parse(JSON.stringify(modal.values))
        modal.mode = 2
    },
    cancelEdit: () => {
        modal.values = JSON.parse(JSON.stringify(modal.original_data))
        modal.mode = 3
    },
    modificar: async () => {
        const send = {
            id: modal.values.id,
            values: modal.values,
        }

        auth.setLoading(true, 'Actualizando...')
        const res = await patch(urls.formato_values, send)
        auth.setLoading(false)

        if (res.code != 0) return

        modal.mode = 3
    },
    exportarPdf: async () => {
        auth.setLoading(true, 'Generando PDF...')
        const element = elementoPdf.value

        const opciones = {
            margin: 0.5,
            filename: `recepcion_1.pdf`,
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
                {
                    align: 'center',
                },
            )
        }

        await worker.save()
        auth.setLoading(false)
    },
}
</script>

<style lang="scss" scoped>
.extra-space {
    padding: 2.5rem;
    background-color: white;
}

.pdfall {
    width: 7.27in;
    // height: 10.69in;
    background-color: white;

    * {
        // font-family: 'Roboto', sans-serif;
        font-size: 0.9rem;
        --bg-color: #ffffff;
        --bg-color-hover: whitesmoke;
        --bg-color-selected: #def8f2;

        --bg-color2: #f2f2f2;
        --bg-color-transparent: rgba(0, 0, 0, 0.5);

        --text-color: black;
        --text-color2: rgba(60, 60, 60, 0.66);

        --border: solid 1px #dfdfdf;
        --shadow-color: #d1d0d0;
    }
}

.document-header {
    display: grid;
    grid-template-columns: 11rem 1fr 15rem;
    gap: 1rem;

    .header-left {
        display: flex;
        align-items: center;
        justify-content: center;

        img {
            max-width: 100%;
            max-height: 100%;
        }
    }

    .header-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        text-align: center;

        .header-system {
            font-size: 0.8rem;
        }

        .header-title {
            font-weight: bold;
            font-size: 1rem;
        }
    }

    .header-right {
        border: var(--border);
        border-radius: 1rem;
        padding: 0.5rem;
        .header-info-row {
            text-align: center;
            font-size: 0.8rem;
        }
    }
}

.section {
    margin-top: 1.5rem;

    .section-header {
        background-color: var(--bg-color2);
        padding: 0.3rem 0.5rem;

        * {
            color: var(--text-color2);
        }
    }

    .section-body {
        padding: 0.5rem;
    }
}

.row {
    display: flex;
    gap: 1rem;
}

.col-12 {
    width: 100%;
}

.col-6 {
    width: 50%;
}

.col-4 {
    width: calc(100% / 3);
}

@media print {
    .section {
        break-inside: avoid;
    }
}
</style>
