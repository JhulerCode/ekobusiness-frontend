import { defineStore } from 'pinia'
import { urls, get } from '@/utils/crud'

export const useSystem = defineStore('system', {
    state: () => ({
        data: {},
        loaded: false,
    }),
    actions: {
        async load(keys = []) {
            // Si ya tenemos las llaves que nos piden, no volvemos a llamar (opcional)
            const missingKeys = keys.filter((k) => !this.data[k])

            if (missingKeys.length === 0 && this.loaded) return

            const res = await get(`${urls.sistema}?qry=${JSON.stringify(keys)}`)

            if (res.code === 0) {
                Object.assign(this.data, res.data)
                this.loaded = true
            }
            return res
        },
        get(key) {
            return this.data[key] || []
        },
    },
})
