<template>
    <JdModal modal="mAjusteStock" :buttons="buttons" @button-click="(action) => this[action]()">
        <p class="mrg-btm1">
            {{ modal.articulo.nombre }}
        </p>

        <div class="container-agregar">
            <!-- <JdInput type="date" label="Fecha" :nec="true" v-model="modal.transaccion.fecha" :disabled="true" /> -->
            <JdSelect label="Tipo" :nec="true" v-model="modal.transaccion.tipo"
                :lista="modal.transaccion_tipos?.filter(a => a.id == 6 || a.id == 7) || []" />

            <JdTable :columns="columnsLotes" :datos="modal.lotes || []" :seeker="false" :colNro="false"
                :rowSelectable="true" :rsUno="true" :reload="loadLotes" maxHeight="15rem">
            </JdTable>

            <JdInput type="number" label="Cantidad" :nec="true" v-model="nuevo.cantidad" class="mrg-top1" />
        </div>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdInput from '@/components/inputs/JdInput.vue'
import JdSelect from '@/components/inputs/JdSelect.vue'
import JdTable from '@/components/JdTable.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post } from '@/utils/crud'
import { redondear } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

import dayjs from 'dayjs'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        redondear,

        modal: {},
        nuevo: { is_receta: true },

        columnsLotes: [
            {
                id: 'lote',
                title: 'Lote',
                width: '7rem',
                show: true,
            },
            {
                id: 'stock',
                title: 'Stock',
                format: 'decimal',
                toRight: true,
                width: '6rem',
                show: true,
            },
            {
                id: 'pu_real',
                title: 'Precio u.',
                toRight: true,
                width: '6rem',
                show: true,
            },
            {
                id: 'fv',
                title: 'F. Vencim.',
                format: 'date',
                width: '7rem',
                show: true,
            },
        ],

        buttons: [
            { text: 'Grabar', action: 'grabar', show: true },
        ],
    }),
    created() {
        this.modal = this.useModals.mAjusteStock
        this.modal.transaccion.fecha = dayjs().format('YYYY-MM-DD')
        this.loadDatosSistema()
        this.loadLotes()
    },
    methods: {
        async loadLotes() {
            this.modal.lotes = []

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}/lotes/${this.modal.articulo.id}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.modal.lotes = res.data
        },
        selectLote(item) {
            for (const a of this.lotes) a.selected = false

            item.selected = true
        },

        checkDatos() {
            if (this.modal.transaccion.tipo == null) {
                jmsg('warning', 'Selecciona el tipo de ajuste')
                return true
            }

            if (this.nuevo.cantidad == null) {
                jmsg('warning', 'Ingrese la cantidad')
                return true
            }

            this.modal.lote = this.modal.lotes.find(a => a.selected == true)
            if (this.modal.lote == undefined) {
                jmsg('warning', 'Selecciona el lote')
                return true
            }

            if (this.modal.transaccion.tipo == 7) {
                if (this.modal.lote.stock < this.nuevo.cantidad) {
                    jmsg('warning', 'Stock insuficiente')
                    return true
                }
            }

            return false
        },
        shapeDatos() {
            this.modal.transaccion.transaccion_items = [{
                articulo: this.modal.articulo.id,
                cantidad: this.nuevo.cantidad,
                lote_padre: this.modal.lote.id,
            }]
        },
        async grabar1() {
            if (this.checkDatos()) return
            this.shapeDatos()

            console.log(this.modal.transaccion)
        },
        async grabar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(`${urls.kardex}/ajuste`, this.modal.transaccion)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.show.mAjusteStock = false
        },

        async loadDatosSistema() {
            const qry = ['transaccion_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },
    }
}
</script>

<style lang="scss" scoped>
.container-agregar {
    display: grid;
    grid-template-columns: 30rem;
    gap: 0.5rem;
    // margin-bottom: 2rem;
    // align-items: start;

    // .left {
    //     display: grid;
    //     // grid-template-columns: 20rem;
    //     gap: 0.5rem;
    //     height: fit-content;
    // }
}
</style>
