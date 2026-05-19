<template>
    <JdModal modal="mFormatosRelated">
        <JdTable
            :columns="columns"
            :datos="modal.formatos || []"
            :colAct="false"
            @rowClick="verRow"
        />
        <!-- <pre>{{ modal.entity }}</pre> -->
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

            if (row.entity) {
                qry.fltr[row.entity] = { op: 'Es', val: this.modal[row.entity] }
            }

            this.auth.setLoading(true, 'Cargando...')
            const res_values = await get(`${urls.formato_values}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res_values.code != 0) return

            // Buscamos dinámicamente qué listas de Pinia necesitamos cargar
            const systemLists = []
            const findKeys = (blocks) => {
                if (!blocks) return
                blocks.forEach((b) => {
                    if (b.props?.optionsKey) systemLists.push(b.props.optionsKey)
                    if (b.children) findKeys(b.children)
                })
            }
            findKeys(row.structure?.children || [])

            if (systemLists.length > 0) {
                await this.system.load(systemLists)
            }

            const send = {
                estructura: row,
                listas: {},
                formato_value: {
                    formato_structure: row.id,
                    values: {},
                },
            }

            // Mapeamos los datos de la entidad principal para mFormatoValue
            if (row.entity) {
                send[row.entity] = this.modal[row.entity]
                send[row.entity + '1'] = this.modal[row.entity + '1']

                // También lo metemos en formato_value para persistencia
                send.formato_value[row.entity] = this.modal[row.entity]
            }

            for (const sl of systemLists) {
                send.listas[sl] = this.system.data[sl]
            }

            this.modals.show.mFormatosRelated = false

            if (res_values.data.length > 0) {
                send.formato_value = res_values.data[0]
                this.modals.setModal('mFormatoValue', '', 3, send, true)
            } else {
                this.modals.setModal('mFormatoValue', '', 1, send, true)
            }
        },
    },
}
</script>
