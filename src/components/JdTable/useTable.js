import { computed, ref, watch } from 'vue'

export function useTable(props, emit) {
    const draggedRowIndex = ref(null)
    const optionsCaseItem = ref({})
    const selectedActionsVisible = ref(false)
    const focusedIndex = ref(-1)

    // Computed
    const seekProperties = computed(() => {
        return props.columns.filter((a) => a.seek).map((b) => b.prop || b.id)
    })

    const datosFiltrados = computed(() => {
        if (!props.buscador) return props.datos
        const searchTermLowerCase = props.buscador.toLowerCase()
        return props.datos.filter((a) => {
            return seekProperties.value.some((b) => {
                const propertyValue = getNestedProp(a, b)
                return propertyValue.toString().toLowerCase().includes(searchTermLowerCase)
            })
        })
    })

    const allSelected = computed({
        get: () => props.datos.length > 0 && props.datos.every((a) => a.selected),
        set: (val) => {
            props.datos.forEach((a) => (a.selected = val))
        },
    })

    watch(datosFiltrados, () => {
        focusedIndex.value = -1
        props.datos.forEach((a) => (a.focused = false))
    })

    // Methods
    function getNestedProp(obj, prop) {
        if (!prop) return ''
        const result = prop.split('.').reduce((acc, part) => acc?.[part], obj)
        return result === undefined || result === null ? '' : result
    }

    function sortData(column, orden) {
        const { id, prop } = column

        const col = props.columns.find((a) => a.id == id)
        if (orden) {
            col.sortDirection = orden
        } else {
            col.sortDirection = col.sortDirection == 'asc' ? 'desc' : 'asc'
        }

        props.columns.forEach((a) => {
            if (a.id != id) a.sortDirection = null
        })

        props.datos.sort((a, b) => {
            const valA = getNestedProp(a, prop || id)
            const valB = getNestedProp(b, prop || id)
            if (col.sortDirection === 'asc') {
                return valA > valB ? 1 : -1
            } else {
                return valA < valB ? 1 : -1
            }
        })
    }

    function setFocus(newIndex) {
        if (!props.rowFocusable) return
        if (focusedIndex.value >= 0 && focusedIndex.value < datosFiltrados.value.length) {
            datosFiltrados.value[focusedIndex.value].focused = false
        }
        focusedIndex.value = newIndex
        if (focusedIndex.value >= 0 && focusedIndex.value < datosFiltrados.value.length) {
            datosFiltrados.value[focusedIndex.value].focused = true
        }
    }

    function selectRow(item, index) {
        if (index !== undefined) {
            setFocus(index)
        }
        if (!props.rowSelectable) return
        if (props.rsUno) {
            props.datos.forEach((a) => {
                if (a.id != item.id) a.selected = false
            })
            item.selected = true
            emit('rowSelected', item)
        }
    }

    function focusUp() {
        if (focusedIndex.value > 0) {
            setFocus(focusedIndex.value - 1)
        } else if (focusedIndex.value === -1 && datosFiltrados.value.length > 0) {
            setFocus(datosFiltrados.value.length - 1)
        }
    }

    function focusDown() {
        if (focusedIndex.value < datosFiltrados.value.length - 1) {
            setFocus(focusedIndex.value + 1)
        } else if (focusedIndex.value === -1 && datosFiltrados.value.length > 0) {
            setFocus(0)
        }
    }

    function selectFocusedRow() {
        if (focusedIndex.value >= 0 && focusedIndex.value < datosFiltrados.value.length) {
            const item = datosFiltrados.value[focusedIndex.value]
            emit('rowDblclick', item)
        }
    }

    return {
        draggedRowIndex,
        optionsCaseItem,
        selectedActionsVisible,
        datosFiltrados,
        allSelected,
        focusedIndex,
        getNestedProp,
        sortData,
        selectRow,
        focusUp,
        focusDown,
        selectFocusedRow,
    }
}
