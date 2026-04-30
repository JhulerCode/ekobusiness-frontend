<template>
    <div v-if="mode == 3" class="print-field">
        <div class="print-label">
            {{ field.label }}
        </div>

        <div class="print-separator">:</div>

        <div class="print-value">
            {{ displayValue }}
        </div>
    </div>

    <component
        v-else
        :is="resolveComponent(field.component)"
        v-model="model"
        :label="field.label"
        :type="field.inputType"
        :lista="getOptions()"
        :mostrar="field.mostrar || 'nombre'"
        :disabled="field.readonly"
    />
</template>

<script setup>
import { computed } from 'vue'

import JdInput from '@/components/inputs/JdInput.vue'
import JdSelect from '@/components/inputs/JdSelect.vue'
import JdSelectQuery from '@/components/inputs/JdSelectQuery.vue'
import JdTextArea from '@/components/inputs/JdTextArea.vue'

const props = defineProps({
    field: Object,
    modelValue: [String, Number, Object],
    listas: Object,
    mode: Boolean,
})

const emit = defineEmits(['update:modelValue'])

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
        const options = getOptions()
        const mostrar = props.field.mostrar || 'nombre'
        return options.find((o) => o.id === model.value)?.[mostrar]
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
        return []
    }

    return props.listas[props.field.optionsKey] || []
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
</style>
