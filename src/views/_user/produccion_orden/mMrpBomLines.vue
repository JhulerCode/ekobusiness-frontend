<template>
    <JdModal modal="mMrpBomLines" :buttons="buttons" @button-click="(action) => this[action]()">
        <JdTable
            :columns="columns"
            :datos="modal.mrp_bom_lines || []"
            :rowSelectable="true"
            :reload="loadMrpBomLines"
            maxHeight="30rem"
        />
    </JdModal>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'
import { jmsg } from '@/utils/swal'

export default {
    data: () => ({
        auth: useAuth(),
        modals: useModals(),

        modal: {},

        buttons: [{ text: 'Agregar articulos', action: 'sendItems', show: true }],

        columns: [
            {
                id: 'articulo',
                title: 'Artículo',
                prop: 'articulo1.nombre',
                width: '25rem',
                show: true,
                sort: true,
            },
        ],
    }),
    created() {
        this.modal = this.modals.mMrpBomLines
        this.loadMrpBomLines()
    },
    methods: {
        async loadMrpBomLines() {
            this.modal.mrp_bom_lines = []

            const qry = {
                fltr: {
                    mrp_bom: { op: 'Es', val: this.modal.mrp_bom },
                    tipo: { op: 'Es', val: 'fabricar' },
                },
                cols: ['articulo', 'cantidad', 'orden'],
                incl: ['articulo1'],
                ordr: [['orden', 'ASC']],
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.mrp_bom_lines}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)

            if (res.code != 0) return

            this.modal.mrp_bom_lines = res.data
        },
        sendItems() {
            const items = this.modal.mrp_bom_lines.filter((a) => a.selected == true)

            if (items.length == 0) return jmsg('warning', 'Selecciona al menos un artículo')

            this.$emit('sendItems', items)

            for (const a of this.modal.mrp_bom_lines) {
                a.selected = false
            }

            this.modals.show.mMrpBomLines = false
        },
    },
}
</script>
