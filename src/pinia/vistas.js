import { defineStore } from 'pinia'

export const useVistas = defineStore('vistas', {
    actions: {
        initVars() {
            for (const key of Object.keys(this.$state)) {
                delete this.$state[key]
            }
        },

        initVista(name, type = 'list') {
            if (this[name]) return

            if (type === 'list') {
                this[name] = {
                    name,
                    tableData: [],
                    table_meta: { total: 0 },
                    table_page: 1,
                    qry: {},
                    type,
                }
            } else if (type === 'detail') {
                this[name] = {
                    name,
                    data: {},
                    loaded: false,
                    mode: 'view',
                    pestana: 1,
                    type,
                }
            }
        },
        updateVista(name, config = {}) {
            Object.assign(this[name], config)
        },

        // --- Gestión de Items ---
        addItem(viewName, array, item, where = 'last') {
            const tableData = this[viewName]?.[array] || this[viewName]?.tableData
            if (!tableData) return
            where == 'last' ? tableData.push(item) : tableData.unshift(item)
        },
        removeItem(viewName, array, item) {
            const tableData = this[viewName]?.[array] || this[viewName]?.tableData
            if (!tableData) return
            const i = tableData.findIndex((a) => a.id == item.id)
            if (i !== -1) tableData.splice(i, 1)
        },
        updateItem(viewName, array, item, partial = false) {
            const tableData = this[viewName]?.tableData || this[viewName]?.[array]
            if (!tableData) return

            const i = tableData.findIndex((a) => a.id == item.id)
            if (i !== -1) {
                if (partial) {
                    Object.assign(tableData[i], item)
                } else {
                    tableData.splice(i, 1, item)
                }
            }
        },
    },
})
