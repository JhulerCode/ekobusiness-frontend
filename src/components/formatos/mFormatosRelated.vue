<template>
    <JdModal modal="mFormatosRelated">
        <JdTable
            :columns="columns"
            :datos="modal.formatos || []"
            :colAct="false"
            @rowClick="verRow"
        />
        <pre>{{ modal.entity }}</pre>
    </JdModal>
</template>

<script>
import { useSystem } from '@/pinia/system'
import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'

export default {
    data: () => ({
        system: useSystem(),
        auth: useAuth(),
        modals: useModals(),
        modal: {},
        columns: [
            { title: 'Nombre', id: 'nombre', width: '30rem', show: true },
            { title: 'Codigo', id: 'codigo', width: '10rem', show: true },
        ],
    }),
    created() {
        this.modal = this.modals.mFormatosRelated
    },
    methods: {
        async verRow(row) {
            const qry = {
                fltr: {
                    formato_structure: { op: 'Es', val: row.id },
                },
                cols: { exclude: [] },
            }

            if (this.modal.entity == 'produccion_ordenes') {
                qry.fltr.produccion_orden = { op: 'Es', val: this.modal.produccion_orden }
            } else if (this.modal.entity == 'lotes') {
                qry.fltr.lote = { op: 'Es', val: this.modal.lote }
            }

            this.auth.setLoading(true, 'Cargando...')
            const res_values = await get(`${urls.formato_values}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res_values.code != 0) return

            await this.system.load(row.system_lists)

            const send = {
                estructura: row,
                listas: {},
                formato_value: {
                    formato_structure: row.id,
                    values: {},
                },
            }

            if (this.modal.entity == 'transacciones') {
                console.log('ASD')
                send.formato_value.transaccion = this.modal.transacciones
                send.transaccion1 = this.modal.transaccion1
            } else if (this.modal.entity == 'lotes') {
                send.formato_value.lote = this.modal.lote
                send.lote1 = this.modal.lote1
            }

            for (const sl of row.system_lists) {
                send.listas[sl] = this.system.data[sl]
            }

            this.modals.show.mFormatosRelated = false

            if (res_values.data.length > 0) {
                send.formato_value = res_values.data[0]
                this.modals.setModal('mFormatoRenderer', '', 3, send, true)
            } else {
                this.modals.setModal('mFormatoRenderer', '', 1, send, true)
            }
        },
    },
}
</script>
