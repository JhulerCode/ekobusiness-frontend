import { defineStore } from 'pinia'

export const useModals = defineStore('modals', {
    state: () => ({
        show: {},
    }),
    actions: {
        initVars() {
            this.show = {}
            for (const key of Object.keys(this.$state)) {
                delete this.$state[key]
            }
        },
        setModal(modal, title, mode, variables, many = false) {
            this[modal] = {}
            this[modal].title = title
            this[modal].mode = mode

            if (variables !== null) {
                if (many == true) {
                    Object.assign(this[modal], variables)
                } else {
                    this[modal].item = variables
                }
            }

            this.show[modal] = true
        },
    },
})
