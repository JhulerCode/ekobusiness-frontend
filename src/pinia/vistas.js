import { defineStore } from "pinia"

export const useVistas = defineStore('vistas', {
    state: () => ({
        show: {},
        pestanas: [],
    }),
    actions: {
        initVars() {
            this.show = {}
            this.pestanas = []
        },

        async showVista(goto, label) {
            for (let a in this.show) this.show[a] = false
            this.addPestana(goto, label)

            if (this[goto] == undefined) {
                this[goto] = {
                    loaded: false,
                    filtros: {}
                }
            }
            else {
                if (label != undefined) {
                    const i = this.pestanas.findIndex(a => a.goto == goto)
                    this.pestanas[i].label = label
                }
            }

            this.show[goto] = true
        },
        addPestana(goto, label) {
            if (goto == 'vHome') return

            if (this.pestanas.some(a => a.goto === goto)) return

            this.pestanas.push({ label, goto })
        },
        closePestana(goto, redirect) {
            const i = this.pestanas.findIndex(a => a.goto == goto)

            if (redirect !== undefined) {
                this.show[redirect] = true
            }
            else if (this.pestanas.length == 1) {
                this.show.vHome = true
            }
            else {
                if (this.show[goto] == true) {
                    const asd = i == 0 ? this.pestanas[i + 1].goto : this.pestanas[i - 1].goto
                    this.show[asd] = true
                }
            }

            this.pestanas.splice(i, 1)
            this.show[goto] = false
            delete this[goto]
        },

        addItem(goto, array, item) {
            if (!this[goto]) return
            if (!this[goto][array]) return

            this[goto][array].push(item)
        },
        removeItem(goto, array, item) {
            if (!this[goto]) return
            if (!this[goto][array]) return

            const i = this[goto][array].findIndex(a => a.id == item.id)
            this[goto][array].splice(i, 1)
        },
        updateItem(goto, array, item) {
            if (!this[goto]) return
            if (!this[goto][array]) return

            const i = this[goto][array].findIndex(a => a.id == item.id)
            this[goto][array].splice(i, 1, item)
        }
    },
})
