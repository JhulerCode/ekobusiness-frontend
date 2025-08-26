<template>
    <JdModal modal="mAjusteStock" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-agregar">
            <JdInput
                type="date"
                label="Fecha"
                :nec="true"
                v-model="modal.transaccion.fecha"
                :disabled="true"
                style="grid-column: 1/3"
            />

            <JdSelect
                label="Tipo"
                :nec="true"
                v-model="modal.transaccion.tipo"
                :lista="modal.transaccion_tipos?.filter((a) => a.id == 6 || a.id == 7) || []"
                style="grid-column: 1/3"
                @elegir="modal.is_nuevo_lote = false"
            />

            <JdCheckBox
                label="Nuevo lote"
                v-model="modal.is_nuevo_lote"
                v-if="modal.transaccion.tipo == 6"
            />

            <JdSelectQuery
                label="Artículo"
                :nec="true"
                v-model="modal.transaccion.articulo"
                :spin="modal.spinArticulos"
                :lista="modal.articulos"
                @search="searchArticulos"
                @elegir="setArticulo"
                style="grid-column: 1/4"
            />

            <JdSelect
                label="Lote"
                :nec="true"
                v-model="modal.transaccion.lote_padre"
                :lista="modal.lotes || []"
                mostrar="lote_fv_stock"
                :loaded="modal.lotesLoaded"
                @reload="loadLotes"
                style="grid-column: 1/4"
                v-if="modal.is_nuevo_lote == false"
            />

            <template v-else>
                <JdInput
                    label="Lote"
                    :nec="true"
                    v-model="modal.transaccion.lote"
                    style="grid-column: 1/3"
                />

                <JdInput
                    label="F. venc."
                    :nec="true"
                    type="date"
                    v-model="modal.transaccion.fv"
                    style="grid-column: 3/5"
                    v-if="modal.articulo1.has_fv"
                />

                <JdSelect
                    label="Moneda"
                    :nec="true"
                    v-model="modal.transaccion.moneda"
                    :lista="modal.monedas || []"
                    :loaded="modal.monedasLoaded"
                    @reload="loadMonedas"
                    style="grid-column: 1/3"
                />

                <JdInput
                    type="number"
                    label="Valor unitario"
                    :nec="true"
                    v-model="modal.transaccion.pu"
                    style="grid-column: 3/5"
                />
            </template>

            <JdInput
                type="number"
                label="Cantidad"
                :nec="true"
                v-model="modal.transaccion.cantidad"
                style="grid-column: 1/3"
            />

            <JdTextArea
                label="Observación"
                :nec="true"
                v-model="modal.transaccion.observacion"
                style="grid-column: 1/5"
            />
        </div>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdInput from '@/components/inputs/JdInput.vue'
import JdSelect from '@/components/inputs/JdSelect.vue'
import JdSelectQuery from '@/components/inputs/JdSelectQuery.vue'
import JdCheckBox from '@/components/inputs/JdCheckBox.vue'
import JdTextArea from '@/components/inputs/JdTextArea.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post } from '@/utils/crud'
import { redondear, incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

import dayjs from 'dayjs'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdSelectQuery,
        JdCheckBox,
        JdTextArea,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        redondear,

        modal: {},
        nuevo: { is_receta: true },

        buttons: [{ text: 'Grabar', action: 'grabar', show: true }],
    }),
    created() {
        this.modal = this.useModals.mAjusteStock

        this.loadDatosSistema()
        this.loadMonedas()
        this.loadLotes()
    },
    methods: {
        initTransaccion() {
            this.modal.transaccion = {
                fecha: dayjs().format('YYYY-MM-DD'),
            }

            this.modal.lotes = []
            this.modal.lotesLoaded = false
        },
        async searchArticulos(txtBuscar) {
            if (!txtBuscar) {
                this.modal.articulos.length = 0
                return
            }

            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: this.modal.articulo_tipo },
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['unidad', 'igv_afectacion', 'has_fv'],
            }

            this.modal.spinArticulos = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.modal.spinArticulos = false

            if (res.code !== 0) return

            this.modal.articulos = JSON.parse(JSON.stringify(res.data))
        },
        setArticulo(item) {
            this.modal.articulo1 = item

            this.loadLotes()
        },
        async loadLotes() {
            this.modal.lotes = []
            this.modal.transaccion.lote_padre = null
            this.modal.lotesLoaded = false

            if (this.modal.transaccion.articulo == null) return

            this.useAuth.setLoading(true, 'Cargando...')
            this.modal.lotesLoaded = false
            const res = await get(`${urls.kardex}/lotes/${this.modal.transaccion.articulo}`)
            this.modal.lotesLoaded = true
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.modal.lotes = JSON.parse(JSON.stringify(res.data))
        },
        selectLote(item) {
            for (const a of this.lotes) a.selected = false

            item.selected = true
        },

        checkDatos() {
            const props = ['fecha', 'tipo', 'articulo', 'cantidad', 'observacion']

            if (this.modal.is_nuevo_lote) {
                props.push('moneda', 'pu', 'lote')

                if (this.modal.articulo1.has_fv) props.push('fv')
            } else {
                props.push('lote_padre')
            }

            if (incompleteData(this.modal.transaccion, props)) {
                jmsg('warning', 'Completa los campos requeridos')
                return true
            }

            return false
        },
        shapeDatos() {
            if (this.modal.is_nuevo_lote) {
                this.modal.transaccion.igv_afectacion = this.modal.articulo1.igv_afectacion
                this.modal.transaccion.igv_porcentaje = this.modal.empresa.igv_porcentaje
                this.modal.transaccion.tipo_cambio = this.modal.transaccion.moneda == 1 ? 1 : 3.5

                this.modal.transaccion.is_lote_padre = true
                this.modal.transaccion.stock = this.modal.transaccion.cantidad
                delete this.modal.transaccion.lote_padre
            } else {
                delete this.modal.transaccion.pu
                delete this.modal.transaccion.igv_afectacion
                delete this.modal.transaccion.igv_porcentaje
                delete this.modal.transaccion.moneda
                delete this.modal.transaccion.tipo_cambio

                delete this.modal.transaccion.lote
                delete this.modal.transaccion.fv

                delete this.modal.transaccion.is_lote_padre
                delete this.modal.transaccion.stock
            }
        },
        // async grabar1() {
        //     if (this.checkDatos()) return
        //     this.shapeDatos()

        //     console.log(this.modal.transaccion)
        // },
        async grabar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.kardex, this.modal.transaccion)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.initTransaccion()
            // this.useModals.show.mAjusteStock = false
        },

        async loadDatosSistema() {
            const qry = ['transaccion_tipos', 'empresa']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },
        async loadMonedas() {
            const qry = {
                fltr: {},
                cols: ['id', 'nombre', 'simbolo', 'estandar'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            this.modal.monedasLoaded = false
            const res = await get(`${urls.monedas}?qry=${JSON.stringify(qry)}`)
            this.modal.monedasLoaded = true
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.monedas = res.data
        },
    },
}
</script>

<style lang="scss" scoped>
.container-agregar {
    display: grid;
    grid-template-columns: repeat(4, 8rem);
    gap: 0.5rem;
}
</style>
