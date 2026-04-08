<template>
    <JdModal modal="mAjusteStock" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-agregar">
            <JdInput
                type="date"
                label="Fecha"
                :nec="true"
                v-model="modal.transaccion.fecha"
                :disabled="false"
                style="grid-column: 1/3"
            />

            <JdSelect
                label="Tipo"
                :nec="true"
                v-model="modal.transaccion.tipo"
                :lista="
                    useSystem.data.kardex_operaciones?.filter((a) => a.id == 6 || a.id == 7) || []
                "
                style="grid-column: 1/3"
                @elegir="modal.transaccion.is_nuevo_lote = false"
            />

            <JdCheckBox
                label="Nuevo lote"
                v-model="modal.transaccion.is_nuevo_lote"
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
                :disabled="true"
            />

            <JdSelectQuery
                label="Lote"
                :nec="true"
                v-model="modal.transaccion.lote_id"
                mostrar="codigo_fv_stock"
                :search="loadLotes"
                @elegir="selectLote"
                style="grid-column: 1/4"
                v-if="modal.transaccion.is_nuevo_lote == false"
            />

            <template v-else>
                <JdInput
                    label="Lote"
                    :nec="true"
                    v-model="modal.transaccion.lote1.codigo"
                    style="grid-column: 1/3"
                />

                <JdInput
                    label="F. venc."
                    :nec="true"
                    type="date"
                    v-model="modal.transaccion.lote1.fv"
                    style="grid-column: 3/5"
                    v-if="modal.articulo1.has_fv"
                />

                <JdSelectQuery
                    label="Moneda"
                    :nec="true"
                    v-model="modal.transaccion.lote1.moneda"
                    :search="loadMonedas"
                    style="grid-column: 1/3"
                />

                <JdInput
                    type="number"
                    label="Tipo de cambio"
                    :nec="true"
                    v-model="modal.transaccion.lote1.tipo_cambio"
                    style="grid-column: 3/5"
                    v-if="
                        modal.transaccion.lote1.moneda &&
                        modal.transaccion.lote1.moneda != useAuth.empresa.moneda
                    "
                />

                <JdInput
                    type="number"
                    label="Valor unitario"
                    :nec="true"
                    v-model="modal.transaccion.lote1.vu"
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
import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useSystem } from '@/pinia/system'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post } from '@/utils/crud'
import { redondear, incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        useSystem: useSystem(),
        redondear,

        modal: {},
        nuevo: { is_receta: true },

        buttons: [{ text: 'Grabar', action: 'grabar', show: true }],
    }),
    created() {
        this.modal = this.useModals.mAjusteStock

        this.useSystem.load(['kardex_operaciones'])
    },
    methods: {
        checkDatos() {
            const props = ['fecha', 'tipo', 'articulo', 'cantidad', 'observacion']

            if (this.modal.transaccion.is_nuevo_lote) {
                props.push('lote1.moneda', 'lote1.vu', 'lote1.codigo')

                if (this.modal.articulo1.has_fv) props.push('lote1.fv')

                if (this.modal.transaccion.lote1.moneda != this.useAuth.empresa.moneda) {
                    props.push('lote1.tipo_cambio')
                }
            } else {
                props.push('lote_id')
            }

            if (incompleteData(this.modal.transaccion, props)) {
                jmsg('warning', 'Completa los campos requeridos')
                return true
            }

            if (this.modal.transaccion.tipo == 7) {
                if (this.modal.transaccion.cantidad > this.modal.transaccion.lote1.lote_stock) {
                    jmsg('warning', 'Cantidad mayor al stock')
                    return true
                }
            }

            return false
        },
        shapeDatos() {
            if (this.modal.transaccion.is_nuevo_lote) {
                if (this.modal.transaccion.lote1.moneda == this.useAuth.empresa.moneda) {
                    this.modal.transaccion.lote1.tipo_cambio = 1
                }
                this.modal.transaccion.lote1.igv_afectacion = this.modal.articulo1.igv_afectacion
                this.modal.transaccion.lote1.igv_porcentaje = this.useAuth.empresa.igv_porcentaje

                this.modal.transaccion.lote1.articulo = this.modal.transaccion.articulo
            }
        },
        async grabar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.kardex, this.modal.transaccion)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            // this.initTransaccion()
            this.useModals.show.mAjusteStock = false
        },

        //--- methods ---//
        setArticulo(item) {
            this.modal.articulo1 = item
        },
        selectLote(item) {
            this.modal.transaccion.lote1 = item
        },

        //--- auxiliar data ---//
        async searchArticulos(txt) {
            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: this.modal.articulo_tipo },
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombre', 'unidad', 'igv_afectacion', 'has_fv'],
                ordr: [['nombre', 'ASC']],
            }

            if (txt) {
                qry.fltr.nombre = { op: 'Contiene', val: txt }
            }

            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)

            if (res.code !== 0) return

            return res.data
        },
        async loadMonedas(txt) {
            const qry = {
                fltr: {},
                cols: ['id', 'nombre', 'simbolo', 'estandar'],
                ordr: [
                    ['estandar', 'DESC'],
                    ['nombre', 'ASC'],
                ],
                limt: 25,
            }

            if (txt) {
                qry.fltr.nombre = { op: 'Contiene', val: txt }
            }

            const res = await get(`${urls.monedas}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            return res.data
        },
        async loadLotes(txt) {
            const qry = {
                incl: ['kardexes_for_sqls'],
                cols: ['codigo', 'fv', 'codigo_fv_stock'],
                sqls: ['lote_stock'],
                fltr: {
                    articulo: { op: 'Es', val: this.modal.transaccion.articulo },
                },
                grop: ['id'],
                ordr: [
                    ['createdAt', 'DESC'],
                    ['codigo', 'DESC'],
                    ['fv', 'DESC'],
                ],
            }

            if (txt) {
                qry.fltr.codigo = { op: 'Contiene', val: txt }
            }

            const res = await get(`${urls.lotes}?qry=${JSON.stringify(qry)}`)

            if (res.code !== 0) return

            return res.data
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
