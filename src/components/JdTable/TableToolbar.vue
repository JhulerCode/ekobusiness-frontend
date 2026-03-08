<template>
    <div class="container-top">
        <div class="left">
            <div class="buscador" v-if="seeker">
                <JdInput
                    icon="fa-solid fa-magnifying-glass"
                    type="search"
                    :placeholder="seekString"
                    v-model="modelValue"
                    :title="seekString"
                />
            </div>
            <small v-if="modelValue">{{ datosFiltradosLength }} encontrados</small>
        </div>

        <div class="container-config">
            <JdButton
                icon="fa-solid fa-file-excel"
                tipo="2"
                title="Exportar"
                @click="$emit('download')"
                v-if="download"
            />
            <JdButton
                icon="fa-solid fa-gear"
                tipo="2"
                @click="$emit('configCols')"
                v-if="showConfigCols"
            />
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { JdInput, JdButton } from '@jhuler/components'

const props = defineProps([
    'modelValue',
    'seeker',
    'seekString',
    'datosFiltradosLength',
    'download',
    'showConfigCols',
])

const emit = defineEmits(['update:modelValue', 'download', 'configCols'])

const modelValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})
</script>
