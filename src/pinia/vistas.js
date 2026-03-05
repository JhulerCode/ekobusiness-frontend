import { defineStore } from 'pinia'

export const useVistas = defineStore('vistas', {
    actions: {
        initVars() {
            // Limpia todos los datos cacheados de las vistas (al cerrar sesión)
            for (const key of Object.keys(this.$state)) {
                delete this.$state[key]
            }
        },
        initVista(name) {
            if (this[name] === undefined) {
                this[name] = { loaded: false }
            }
        },

        addItem(goto, array, item, where = 'last') {
            if (!this[goto]) return
            if (!this[goto][array]) return

            if (where == 'last') {
                this[goto][array].push(item)
            } else {
                this[goto][array].unshift(item)
            }
        },
        removeItem(goto, array, item) {
            if (!this[goto]) return
            if (!this[goto][array]) return

            const i = this[goto][array].findIndex((a) => a.id == item.id)
            if (i !== -1) this[goto][array].splice(i, 1)
        },
        updateItem(goto, array, item) {
            if (!this[goto]) return
            if (!this[goto][array]) return

            const i = this[goto][array].findIndex((a) => a.id == item.id)
            if (i !== -1) this[goto][array].splice(i, 1, item)
        },
    },
})
