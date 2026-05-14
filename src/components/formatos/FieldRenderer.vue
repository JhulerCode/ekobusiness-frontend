<template>
    <div v-if="field" class="field-renderer-container">
        <div v-if="mode == 3" class="print-field">
            <div class="print-label" :style="labelStyle">
                {{ field.label }}
            </div>

            <div class="print-separator" :style="labelStyle">:</div>

            <div class="print-value" :style="valueStyle">
                {{ displayValue }}
            </div>
        </div>

        <div v-else class="field-wrapper">
            <component
                :is="resolveComponent(field.component)"
                v-model="model"
                :label="field.label"
                :type="field.inputType"
                :lista="getOptions()"
                :search="field.searchUrl ? handleSearch : undefined"
                :mostrar="field.mostrar || field.searchField || 'nombre'"
                :disabled="!field.relatedPath"
                :selectedObject="data ? data[field.id + '1'] : null"
                @elegir="(obj) => $emit('elegir-obj', obj, field.id)"
            />
        </div>

        <div v-if="field.help" class="field-help">
            {{ field.help }}
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

import JdInput from '@/components/inputs/JdInput.vue'
import JdSelect from '@/components/inputs/JdSelect.vue'
import JdSelectQuery from '@/components/inputs/JdSelectQuery.vue'
import JdTextArea from '@/components/inputs/JdTextArea.vue'
import { urls, get } from '@/utils/crud'

const props = defineProps({
    field: Object,
    modelValue: [String, Number, Object],
    listas: Object,
    mode: [String, Number],
    data: Object,
    labelStyle: Object,
    valueStyle: Object,
})

const emit = defineEmits(['update:modelValue', 'elegir-obj'])

const model = computed({
    get() {
        return props.modelValue
    },

    set(value) {
        emit('update:modelValue', value)
    },
})

const displayValue = computed(() => {
    if (model.value == null) {
        return ''
    }

    if (props.field.component === 'JdSelect') {
        const options = getOptions() || []
        const mostrar = props.field.mostrar || 'nombre'
        return options.find((o) => o.id === model.value)?.[mostrar]
    }

    if (props.field.component === 'JdSelectQuery') {
        if (props.data && props.data[props.field.id + '1']) {
            const mostrar = props.field.mostrar || 'nombre'
            return props.data[props.field.id + '1'][mostrar]
        }
    }

    return model.value
})

const resolveComponent = (component) => {
    const map = {
        JdInput,
        JdSelect,
        JdSelectQuery,
        JdTextArea,
    }

    return map[component]
}

const getOptions = () => {
    if (!props.field.optionsKey) {
        return null
    }

    return props.listas[props.field.optionsKey] || []
}

const safeJsonParse = (val, fallback) => {
    if (!val) return fallback
    if (typeof val !== 'string') return val

    let cleanedVal = val.trim()
    // Intentamos arreglar JSON perezoso (comillas simples o llaves sin comillas)
    if (cleanedVal.startsWith('{') || cleanedVal.startsWith('[')) {
        cleanedVal = cleanedVal
            .replace(/'/g, '"')
            .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
    }

    try {
        const res = JSON.parse(cleanedVal)
        if (typeof res === 'string' && (res.startsWith('[') || res.startsWith('{'))) {
            return safeJsonParse(res, fallback)
        }
        return res
    } catch {
        try {
            return JSON.parse(val)
        } catch {
            return fallback
        }
    }
}

const handleSearch = async (txtBuscar) => {
    if (!props.field.searchUrl) return []

    const sField = props.field.searchField || props.field.mostrar || 'nombre'

    const qry = {
        fltr: safeJsonParse(props.field.searchFltr, {}),
        cols: safeJsonParse(props.field.searchCols, [sField]),
        ordr: safeJsonParse(props.field.searchOrdr, [[sField, 'ASC']]),
        limt: parseInt(props.field.searchLimt) || 25,
    }

    // Aseguramos que sField esté siempre en las columnas para poder mostrar el valor
    if (!qry.cols.includes(sField)) {
        qry.cols.push(sField)
    }

    if (txtBuscar) {
        qry.fltr[sField] = { op: 'Contiene', val: txtBuscar }
    }

    const res = await get(`${urls[props.field.searchUrl]}?qry=${JSON.stringify(qry)}`)

    if (res.code !== 0) return []

    return res.data
}
</script>

<style scoped>
.print-field {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
}

.print-label {
    /* width: 45%; */
    font-weight: bold;
}

.print-separator {
    width: 10px;
    text-align: center;
    font-weight: bold;
}

.print-value {
    /* flex: 1; */
    word-break: break-word;
    /* line-height: 1.2rem; */
    white-space: pre-wrap;
}

.field-wrapper {
    display: flex;
    flex-direction: column;
}

.field-help {
    font-size: 0.8rem;
    color: var(--text-color2);
    margin-top: 0.2rem;
}
</style>
