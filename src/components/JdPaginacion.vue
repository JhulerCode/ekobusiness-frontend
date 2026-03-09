<template>
    <div class="jd-paginacion" v-if="view && view.table_meta">
        <p class="pagination-info">{{ paginationRange }} / {{ view.table_meta.total_records }}</p>
        <JdButton
            icon="fa-solid fa-chevron-left"
            tipo="2"
            @click="changePage(-1)"
            :disabled="isFirstPage"
        />
        <JdButton
            icon="fa-solid fa-chevron-right"
            tipo="2"
            @click="changePage(1)"
            :disabled="isLastPage"
        />
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { JdButton } from '@jhuler/components'

const props = defineProps({
    view: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['reload'])

const isFirstPage = computed(() => {
    return Number(props.view.table_page || 1) <= 1
})

const isLastPage = computed(() => {
    const meta = props.view.table_meta
    if (!meta) return true
    return Number(props.view.table_page || 1) >= Number(meta.last_page || 1)
})

const paginationRange = computed(() => {
    const meta = props.view.table_meta
    if (!meta) return ''

    const page = Number(props.view.table_page || 1)
    const start = (page - 1) * meta.per_page + 1
    const end = meta.last_page == page ? meta.total_records : page * meta.per_page

    return `${start}-${end}`
})

const changePage = (delta) => {
    const currentPage = Number(props.view.table_page || 1)
    const lastPage = Number(props.view.table_meta?.last_page || 1)
    const newPage = currentPage + delta

    if (newPage < 1 || newPage > lastPage) return

    props.view.table_page = newPage
    emit('reload')
}
</script>

<style lang="scss" scoped>
.jd-paginacion {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.25rem;

    .pagination-info {
        font-size: 0.85rem;
        color: var(--text-color2);
        margin: 0 0.5rem;
        white-space: nowrap;
    }
}
</style>
