<template>
    <JdModal modal="mMrpBom" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="datos-generales">
            <JdSelectQuery
                label="Artículo"
                :nec="true"
                v-model="modal.mrp_bom.articulo"
                :spin="modal.spin_articulos_fabricables"
                :lista="modal.articulos_fabricables"
                @search="loadArticulosFabricables"
                style="grid-column: 1/5"
            />

            <JdSelect
                label="Tipo"
                :nec="true"
                v-model="modal.mrp_bom.tipo"
                :lista="modal.mrp_bom_tipos"
                style="grid-column: 1/3"
            />
        </div>

        <mMrpBomSocios v-if="modal.mrp_bom.tipo == 'subcontratar'" class="mrg-top2" />

        <mMrpBomLines class="mrg-top2" />
    </JdModal>
</template>

<script>
import { JdModal, JdSelect, JdSelectQuery } from '@jhuler/components'
import mMrpBomSocios from './mMrpBomSocios.vue'
import mMrpBomLines from './mMrpBomLines.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch } from '@/utils/crud'
import { jmsg } from '@/utils/swal'
import { incompleteData } from '@/utils/mine'

export default {
    components: {
        JdModal,
        JdSelect,
        JdSelectQuery,
        mMrpBomSocios,
        mMrpBomLines,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},

        buttons: [
            { text: 'Grabar', action: 'crear' },
            { text: 'Actualizar', action: 'modificar' },
        ],
    }),
    created() {
        this.modal = this.useModals.mMrpBom
        this.showButtons()
        this.loadDatosSistema()
    },
    methods: {
        showButtons() {
            if (this.modal.mode == 1) {
                this.buttons[0].show = true
            } else if (this.modal.mode == 2) {
                this.buttons[1].show = true
            }
        },

        async loadDatosSistema() {
            const qry = ['mrp_bom_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },
        async loadArticulosFabricables(txtBuscar) {
            if (!txtBuscar) {
                this.modal.articulos_fabricables.length = 0
                return
            }

            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                    type: { op: 'Es', val: 'consumable' },
                    produce_ok: { op: 'Es', val: true },
                },
                cols: ['nombre', 'unidad'],
                ordr: [['nombre', 'ASC']],
            }

            this.modal.spin_articulos_fabricables = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.modal.spin_articulos_fabricables = false

            if (res.code !== 0) return

            this.modal.articulos_fabricables = JSON.parse(JSON.stringify(res.data))
        },

        checkDatos() {
            const props = ['articulo', 'tipo']

            if (incompleteData(this.modal.mrp_bom, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            if (this.modal.mrp_bom.mrp_bom_lines.length == 0) {
                jmsg('warning', 'Agregue al menos un componente')
                return true
            }

            for (const a of this.modal.mrp_bom.mrp_bom_lines) {
                if (incompleteData(a, ['articulo', 'cantidad'])) {
                    jmsg('warning', 'Ingrese los datos necesarios de cada componente')
                    return true
                }
            }

            if (this.modal.mrp_bom.tipo == 'subcontratar') {
                if (this.modal.mrp_bom.mrp_bom_socios.length == 0) {
                    jmsg('warning', 'Agregue al menos un subcontratista')
                    return true
                }
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Agregando...')
            const res = await post(urls.mrp_boms, this.modal.mrp_bom)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.useVistas.addItem('vMrpBom', 'mrp_boms', res.data)
            this.useModals.show.mMrpBom = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Modificando...')
            const res = await patch(urls.mrp_boms, this.modal.mrp_bom)
            this.useAuth.setLoading(false)

            if (res.code != 0) return false

            this.useVistas.updateItem('mMrpBom', 'mrp_boms', res.data)
            this.useModals.show.mMrpBom = false
        },
    },
}
</script>

<style lang="scss" scoped>
.datos-generales {
    display: grid;
    grid-template-columns: repeat(4, 10rem);
    gap: 0.5rem;
    margin-bottom: 1rem;
}
</style>
