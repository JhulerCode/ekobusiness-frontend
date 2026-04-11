<template>
    <div v-if="column.slot" class="cell-slot">
        <slot :name="column.slot" :item="item"></slot>
    </div>

    <!-- Input Mode -->
    <template v-else-if="column.input">
        <JdInput
            v-if="['text', 'number', 'email', 'date', 'time'].includes(column.type)"
            :type="column.type"
            v-model="modelValue"
            :disabled="setDisabled(item, column)"
            :align="column.align"
            @change="onChange(item, column)"
            @input="onInput(item, column)"
        />

        <JdTextArea
            v-else-if="column.type === 'longtext'"
            v-model="modelValue"
            :disabled="setDisabled(item, column)"
        />

        <JdSelectQuery
            v-else-if="column.type == 'select_query'"
            v-model="modelValue"
            :disabled="setDisabled(item, column)"
            :mostrar="setMostrar(item, column)"
            :selectedObject="item[column.input.selectedObjectProp]"
            :search="(txt) => column.input.search(txt, item, column)"
            @elegir="elegirOption($event, item, column)"
        />

        <JdSelect
            v-else-if="column.type == 'select'"
            v-model="modelValue"
            :disabled="setDisabled(item, column)"
            :lista="column.input.lista"
            :loaded="true"
            :mostrar="setMostrar(item, column)"
            @reload="() => column.input.reload(item, column)"
            @elegir="elegirOption($event, item, column)"
        />

        <JdCheckBox
            v-else-if="column.type === 'check'"
            v-model="modelValue"
            :disabled="setDisabled(item, column)"
            @change="onChange(item, column)"
        />
    </template>

    <!-- Format Mode -->
    <template v-else-if="column.format">
        <template v-if="column.type == 'number'">
            {{ redondear(value, 0) }}
        </template>

        <template v-else-if="column.type == 'decimal'">
            {{ redondear(value, column.format.decimalPlaces) }}
        </template>

        <div v-else-if="column.format == 'estado'" class="chip" :class="`chip-${valueColor}`">
            {{ value }}
        </div>

        <div
            v-else-if="column.type == 'color'"
            class="color-box"
            :style="{ background: value }"
        ></div>

        <div v-else-if="column.type == 'currency' && value" class="currency-box">
            <span>{{ column.format.moneda }}</span>
            <span>{{ redondear(value) }}</span>
        </div>

        <div v-else-if="column.type == 'image' && value" class="img-box">
            <img :src="value" :alt="column.format.alt" />
        </div>
    </template>

    <!-- Plain Mode -->
    <template v-else>
        {{ value }}
    </template>
</template>

<script setup>
import { computed } from 'vue'
import { redondear } from '@/utils/mine'

const props = defineProps(['column', 'item', 'disabled'])

const modelValue = computed({
    get: () => {
        const prop = props.column.id
        if (!prop) return ''
        return prop.split('.').reduce((acc, part) => acc?.[part], props.item)
    },
    set: (val) => {
        const prop = props.column.id
        if (!prop) return
        const parts = prop.split('.')
        const lastPart = parts.pop()
        const target = parts.reduce((acc, part) => acc?.[part], props.item)
        if (target) target[lastPart] = val
    },
})

const value = computed(() => {
    const prop = props.column.prop || props.column.id
    if (!prop) return ''
    return prop.split('.').reduce((acc, part) => acc?.[part], props.item) || ''
})

const valueColor = computed(() => {
    const prop = props.column.color
    if (!prop) return ''
    return prop.split('.').reduce((acc, part) => acc?.[part], props.item) || ''
})

//--- input props ---//
function setDisabled(fila, column) {
    if (props.disabled) return true
    if (!column.input.disabled) return undefined
    if (typeof column.input.disabled === 'function') {
        return column.input.disabled(fila, column)
    }
    return column.input.disabled
}

function setMostrar(fila, column) {
    if (!column.input.mostrar) return undefined
    if (typeof column.input.mostrar === 'function') {
        return column.input.mostrar(fila, column)
    }
    return column.input.mostrar
}

//--- input actions ---//
function onChange(fila, column) {
    if (!column.input.onChange) return
    column.input.onChange(fila)
}

function onInput(fila, column) {
    if (!column.input.onInput) return
    column.input.onInput(fila)
}

function elegirOption(event, fila, column) {
    if (!column.input.elegir) return
    column.input.elegir(event, fila, column)
}
</script>

<style lang="scss" scoped>
.chip {
    padding: 0.1rem 0.5rem;
    width: fit-content;
    border-radius: 0.3rem;
    font-size: 0.8rem;
}
.chip-rojo {
    border: solid 1px var(--rojo);
}
.chip-verde {
    border: solid 1px var(--verde);
}
.chip-amarillo {
    border: solid 1px var(--amarillo);
}

.color-box {
    width: 2rem;
    height: 1rem;
}
.currency-box {
    display: flex;
    justify-content: space-between;
}
.img-box {
    width: 100%;
    height: 3rem;
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}
</style>
