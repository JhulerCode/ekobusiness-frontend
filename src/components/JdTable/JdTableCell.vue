<template>
    <div v-if="column.slot" class="cell-slot">
        <slot :name="column.slot" :item="item"></slot>
    </div>

    <!-- Input Mode -->
    <template v-else-if="column.input">
        <JdInput
            v-if="['text', 'number', 'email', 'date', 'time'].includes(column.type)"
            v-model="item[column.id]"
            :type="column.type"
            :disabled="disabled"
            :toRight="column.type === 'number'"
            @change="column.onchange ? $emit('onChange', column.onchange, item) : null"
            @input="column.oninput ? $emit('onInput', column.oninput, item) : null"
        />

        <JdSelect
            v-else-if="column.type === 'select' && !column.select"
            v-model="item[column.id]"
            :disabled="disabled"
            :lista="column.list"
            :mostrar="column.mostrar"
            @elegir="column.onchange ? $emit('onChange', column.onchange, item) : null"
        />

        <JdSelect
            v-else-if="column.select"
            v-model="item[column.id]"
            v-bind="column.select"
            :disabled="item.table_columns?.[`${column.id}_disabled`] || disabled"
            @elegir="column.select.elegir ? column.select.elegir($event, item, column) : null"
            @reload="() => column.select.reload(item, column)"
        />

        <JdSelectQuery
            v-else-if="column.select_query"
            v-model="item[column.id]"
            v-bind="column.select_query"
            :search="(txt) => column.select_query.search(txt, item, column)"
            :selectedObject="item[column.select_query.selectedObjectProp || column.id + '1']"
            :disabled="item.table_columns?.[`${column.id}_disabled`] || disabled"
            @elegir="
                column.select_query.elegir ? column.select_query.elegir($event, item, column) : null
            "
        />

        <JdCheckBox
            v-else-if="column.type === 'check'"
            v-model="item[column.id]"
            :disabled="disabled"
            @change="column.onchange ? $emit('onChange', column.onchange, item) : null"
        />

        <JdTextArea
            v-else-if="column.type === 'longtext'"
            v-model="item[column.id]"
            :disabled="disabled"
        />
    </template>

    <!-- Format Mode -->
    <template v-else-if="column.format">
        <div
            v-if="['yesno', 'estado'].includes(column.format)"
            class="estado"
            :class="`chip-${valueColor}`"
        >
            {{ value }}
        </div>

        <template v-else-if="['number', 'decimal'].includes(column.format)">
            {{ redondear(value, column.format === 'number' ? 0 : 2) }}
        </template>

        <div
            v-else-if="column.format === 'color'"
            class="color-box"
            :style="{ background: value }"
        ></div>

        <div v-else-if="column.format === 'currency' && value" class="currency-box">
            <span>{{ column.moneda }}</span>
            <span>{{ redondear(value) }}</span>
        </div>

        <div v-else-if="column.format === 'img' && value" class="img-box">
            <img :src="`${column.host}/${value}`" :alt="value" />
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
defineEmits(['onChange', 'onInput'])

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
</script>

<style lang="scss" scoped>
.estado {
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
