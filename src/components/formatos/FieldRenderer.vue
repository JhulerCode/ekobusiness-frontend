<template>
    <template v-if="field">
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
                :mostrar="field.mostrar || 'nombre'"
                :disabled="field.readonly"
                :selectedObject="data ? data[field.id + '1'] : null"
                @elegir="(obj) => $emit('elegir-obj', obj, field.id)"
            />
        </div>

        <div v-if="field.help" class="field-help">
            {{ field.help }}
        </div>
    </template>
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
        return undefined
    }

    return props.listas[props.field.optionsKey]
}

const handleSearch = async (txtBuscar) => {
    if (!props.field.searchUrl) return []

    const qry = {
        fltr: props.field.searchFltr || {},
        cols: props.field.searchCols || ['nombre'],
        ordr: props.field.searchOrdr || [[props.field.searchCols?.[0] || 'nombre', 'ASC']],
        limt: props.field.searchLimt || 25,
    }

    if (txtBuscar) {
        const searchField = props.field.searchField || props.field.mostrar || 'nombre'
        qry.fltr[searchField] = { op: 'Contiene', val: txtBuscar }
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
