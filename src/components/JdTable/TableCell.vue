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
            @elegir="column.select.elegir ? (val) => column.select.elegir(val, item, column) : null"
            @reload="() => column.select.reload(item, column)"
        />

        <JdSelectQuery
            v-else-if="column.select_query"
            v-model="item[column.id]"
            v-bind="column.select_query"
            :spin="item.table_columns?.[`${column.id}_spin`]"
            :lista="item.table_columns?.[`${column.id}_lista`]"
            :disabled="item.table_columns?.[`${column.id}_disabled`] || disabled"
            @search="(txt) => column.select_query.search(txt, item, column)"
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
        <div v-if="['yesno', 'estado'].includes(column.format)" class="estado" :class="formatClass">
            {{ value }}
        </div>

        <template v-else-if="['date', 'datetime'].includes(column.format)">
            {{ formatDate(value, column.format) }}
        </template>

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

    <!-- Plain View -->
    <template v-else>
        {{ value }}
    </template>
</template>

<script setup>
import { computed } from 'vue'
import { JdInput, JdCheckBox, JdSelect, JdTextArea, JdSelectQuery } from '@jhuler/components'
import { redondear } from '@/utils/mine'
import { useAuth } from '@/pinia/auth'
import dayjs from 'dayjs'

const props = defineProps(['column', 'item', 'disabled'])
const emit = defineEmits(['onChange', 'onInput'])
const auth = useAuth()

const value = computed(() => {
    const prop = props.column.prop || props.column.id
    if (!prop) return ''
    return prop.split('.').reduce((acc, part) => acc?.[part], props.item) || ''
})

const formatClass = computed(() => {
    if (props.column.format === 'yesno') return value.value ? 'si' : 'no'
    if (props.column.format === 'estado') {
        const v = value.value
        return v < 1 ? 'anulado' : v < 2 ? 'abierto' : 'cerrado'
    }
    return ''
})

const formatDate = (val, format) => {
    if (!val) return ''
    const baseFormat = auth.usuario?.format_date || 'YYYY-MM-DD'
    const finalFormat = format === 'datetime' ? `${baseFormat} HH:mm:ss` : baseFormat
    return dayjs(val).format(finalFormat)
}
</script>

<style lang="scss" scoped>
.estado {
    padding: 0.1rem 0.5rem;
    width: fit-content;
    border-radius: 0.3rem;
    font-size: 0.8rem;
}
.si {
    border: solid 1px var(--verde);
}
.no {
    border: solid 1px var(--rojo);
}
.anulado {
    border: solid 1px var(--rojo);
}
.abierto {
    border: solid 1px var(--amarillo);
}
.cerrado {
    border: solid 1px var(--verde);
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
