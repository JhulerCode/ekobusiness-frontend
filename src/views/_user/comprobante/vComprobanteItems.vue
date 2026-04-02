<template>
    <div class="comprobante-items">
        <div class="actions mb-3" v-if="vista.mode != 'view'">
            <JdButton
                icon="fa-solid fa-sync"
                text="Cargar Recepciones"
                tipo="3"
                @click="fetchPendingTrans"
                :disabled="!socioId"
            />
        </div>

        <JdTable
            :columns="columns"
            :datos="pendingTrans"
            :rowOptions="rowActions"
            rowOptionsMode="buttons"
            @rowOptionSelected="runMethod"
            :inputsDisabled="vista.mode == 'view'"
        />

        <div v-if="selectedIds.length > 0" class="mt-3">
            <JdButton icon="fa-solid fa-link" text="Vincular Selección" @click="vincular" />
        </div>
    </div>
</template>

<script>
import { useVistas } from '@/pinia/vistas'
import { get, patch } from '@/utils/crud'
import { jmsg } from '@/utils/swal'

export default {
    props: ['comprobanteId', 'socioId'],
    data: () => ({
        vistas: useVistas(),
        pendingTrans: [],
        selectedIds: [],
    }),
    computed: {
        vista() {
            return this.vistas[this.$route.name]
        },
        columns() {
            return [
                { id: 'select', title: '', type: 'checkbox', width: '3rem', show: true },
                { id: 'guia', title: 'Guía', width: '15rem', show: true },
                { id: 'fecha', title: 'Fecha', width: '10rem', show: true },
            ]
        },
        rowActions() {
            return []
        },
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        async fetchPendingTrans() {
            if (!this.socioId) return
            const res = await get(`/api/comprobantes/pending/${this.socioId}`)
            if (res.code === 0) this.pendingTrans = res.data
        },
        async vincular() {
            if (this.selectedIds.length === 0) return
            const res = await patch(`/api/comprobantes/${this.comprobanteId}/vincular`, {
                transaccionIds: this.selectedIds,
            })
            if (res.code === 0) {
                jmsg('success', 'Vinculado correctamente')
                this.fetchPendingTrans()
                this.selectedIds = []
            }
        },
    },
}
</script>
