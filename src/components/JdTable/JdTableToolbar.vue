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
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { JdInput } from '@jhuler/components'

const props = defineProps(['modelValue', 'seeker', 'seekString', 'datosFiltradosLength'])

const emit = defineEmits(['update:modelValue'])

const modelValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})
</script>
