<template>
    <JdModal modal="mFormatosRelated">
        <JdTable
            :columns="columns"
            :datos="modal.formatos || []"
            :colAct="false"
            @rowClick="verRow"
        />
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
            console.log(row)

            const qry = {
                fltr: {
                    formato_structure: { op: 'Es', val: row.id },
                    produccion_orden: { op: 'Es', val: this.modal.produccion_orden },
                },
            }

            this.auth.setLoading(true, 'Cargando...')
            const res_values = await get(`${urls.formato_values}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res_values.code != 0) return

            await this.system.load(['conformidad_estados'])

            const send = {
                estructura: row,
                listas: {
                    conformidad_estados: this.system.data.conformidad_estados,
                },
                produccion_orden: this.modal.produccion_orden,
                transaccion1: {},
            }

            this.modals.show.mFormatosRelated = false

            if (res_values.data.length > 0) {
                send.values = res_values.data[0].values
                this.modals.setModal('mFormatoRenderer', '', 3, send, true)
            } else {
                send.values = {}
                this.modals.setModal('mFormatoRenderer', '', 1, send, true)
            }
        },
    },
}
</script>
