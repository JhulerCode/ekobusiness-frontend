import { defineStore } from 'pinia'

export const useVistas = defineStore('vistas', {
    actions: {
        initVars() {
            for (const key of Object.keys(this.$state)) {
                delete this.$state[key]
            }
        },

        // --- Inicializa o "hidrata" una vista con su configuración ---
        initVista(name, config = {}, type = 'list') {
            if (this[name] === undefined) {
                if (type === 'list') {
                    this[name] = {
                        tableData: [],
                        table_meta: { total: 0 },
                        table_page: 1,
                        loaded: false,
                        qry: {},
                        type,
                    }
                } else if (type === 'detail') {
                    this[name] = {
                        data: {},
                        loaded: false,
                        mode: 'view',
                        type,
                    }
                }
            }

            // Fusionamos la configuración (columnas, acciones, etc.)
            Object.assign(this[name], config)

            this[name].addItem = (item, where) => this.addItem(name, 'tableData', item, where)
            this[name].removeItem = (item) => this.removeItem(name, 'tableData', item)
            this[name].updateItem = (item, partial = false) =>
                this.updateItem(name, 'tableData', item, partial)
        },

        // --- Gestión de Items ---
        addItem(goto, array, item, where = 'last') {
            const tableData = this[goto]?.[array] || this[goto]?.tableData
            if (!tableData) return
            where == 'last' ? tableData.push(item) : tableData.unshift(item)
        },
        removeItem(goto, array, item) {
            const tableData = this[goto]?.[array] || this[goto]?.tableData
            if (!tableData) return
            const i = tableData.findIndex((a) => a.id == item.id)
            if (i !== -1) tableData.splice(i, 1)
        },
        updateItem(goto, array, item, partial = false) {
            const tableData = this[goto]?.[array] || this[goto]?.tableData
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
