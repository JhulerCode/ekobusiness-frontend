<template>
    <JdModal modal="mFormato" :buttons="buttons" @button-click="(action) => this[action]()">
        <!-- <div class="cols2">
            <div class="relacionados"> -->
        <div class="container-datos">
            <template v-if="modal.transaccion_item1">
                <JdInput label="Fecha" v-model="modal.transaccion_item1.transaccion1.fecha" :disabled="true" />
                <JdInput label="Guía" v-model="modal.transaccion_item1.transaccion1.guia" :disabled="true" />
                <JdInput :label="modal.transaccion_item1.transaccion1.tipo == 1 ? 'Proveedor' : 'Cliente'"
                    v-model="modal.transaccion_item1.transaccion1.socio1.nombres_apellidos" :disabled="true" />
                <JdInput label="Artículo" v-model="modal.transaccion_item1.articulo1.nombre" :disabled="true" />
                <JdInput label="Cantidad" v-model="modal.transaccion_item1.cantidad" :disabled="true" />
                <JdInput label="Lote" v-model="modal.transaccion_item1.lote" :disabled="true" />
                <JdInput label="Fecha vencimiento" type="date" v-model="modal.transaccion_item1.fv" :disabled="true" />
            </template>

            <template v-if="modal.produccion_orden1">
                <JdInput label="Fecha" v-model="modal.produccion_orden1.fecha" :disabled="true" />
                <JdInput label="Máquina" v-model="modal.produccion_orden1.maquina1.nombre" :disabled="true"
                    v-if="modal.produccion_orden1.maquina1" />
                <JdInput label="Artículo" v-model="modal.produccion_orden1.articulo1.nombre" :disabled="true" />
            </template>

            <template v-if="modal.transaccion1">
                <JdInput label="Fecha" v-model="modal.transaccion1.fecha" :disabled="true" />
                <JdInput label="Guía de remisión" v-model="modal.transaccion1.guia" :disabled="true" />
                <JdInput label="Destino" v-model="modal.transaccion1.socio1.nombres_apellidos" :disabled="true" />
            </template>

            <template v-if="modal.cuarentena_producto1">
                <JdInput label="Fecha" v-model="modal.cuarentena_producto1.produccion_orden1.fecha" :disabled="true" />
                <JdInput label="Producto" v-model="modal.cuarentena_producto1.produccion_orden1.articulo1.nombre" :disabled="true" />
                <JdInput label="Lote" v-model="modal.cuarentena_producto1.lote" :disabled="true" />
                <JdInput label="Fv" v-model="modal.cuarentena_producto1.fv" :disabled="true" />
                <JdInput label="Cantidad" v-model="modal.cuarentena_producto1.cantidad" :disabled="true" />
            </template>

            <template v-for="a in modal.formato.columns" :key="a.id">
                <template v-if="a.show_form != false">
                    <JdInput :label="a.title" v-model="a.value" v-if="a.type == 'text'" :disabled="modal.mode == 3" />

                    <JdInput :label="a.title" type="number" v-model="a.value" v-if="a.type == 'number'"
                        :disabled="modal.mode == 3" />

                    <JdInput :label="a.title" type="date" v-model="a.value" v-if="a.type === 'date'"
                        :disabled="modal.mode == 3" />

                    <JdInput :label="a.title" type="time" v-model="a.value" v-if="a.type === 'time'"
                        :disabled="modal.mode == 3" />

                    <JdSelect :label="a.title" :lista="a.lista || []" :mostrar="a.mostrar || 'nombre'" v-model="a.value"
                        v-if="a.type == 'select'" :disabled="modal.mode == 3" />

                    <!-- <JdSelectQuery :label="a.title" :lista="a.lista || []" :mostrar="a.mostrar || 'nombre'"
                        v-model="a.value" v-if="a.type == 'ref'" :disabled="modal.mode == 3" /> -->

                    <JdCheckBox :label="a.title" v-model="a.value" v-if="a.type == 'check'"
                        :disabled="modal.mode == 3" />

                    <JdTextArea :label="a.title" v-model="a.value" v-if="a.type == 'longtext'"
                        :disabled="modal.mode == 3" />

                    <p v-if="a.type == 'section'" class="section">
                        {{ a.title }}
                    </p>
                </template>
            </template>

            <template v-if="modal.formato.instructivo">
                <p class="section">Instructivo</p>
                <ul class="instructivo">
                    <li v-for="(a, i) in modal.formato.instructivo" :key="i">
                        {{ a }}
                    </li>
                </ul>
            </template>
        </div>
        <!-- </div>
        </div> -->
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSelect, JdCheckBox, JdTextArea } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post, patch } from '@/utils/crud'
// import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
        // JdSelectQuery,
        JdCheckBox,
        JdTextArea,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: null,

        buttons: [
            { text: 'Actualizar', action: 'modificar' },
            { text: 'Grabar', action: 'grabar' },
        ],
    }),
    created() {
        this.modal = this.useModals.mFormato

        this.showButtons()
    },
    methods: {
        showButtons() {
            if (this.modal.mode == 1) {
                this.buttons[1].show = true
            }
            else {
                this.buttons[0].show = true
            }
        },

        shapeDatos() {
            this.modal.send = {
                id: this.modal.formato.id,
                codigo: this.modal.formato.codigo,
                values: this.modal.formato.columns.map(a => ({
                    id: a.id,
                    value: a.value,
                    relacion: a.relacion,
                    show_form: a.show_form
                })),
                transaccion_item: this.modal.transaccion_item,
                produccion_orden: this.modal.produccion_orden,
                transaccion: this.modal.transaccion,
                cuarentena_producto: this.modal.cuarentena_producto,
            }

            // ----- ASIGNAR AL VALUE DEL COLUMN QUE LO TRAE DE OTRO LADO ----- //
            const transaccion_item = this.modal.send.values.find(a => a.relacion == 'transaccion_items')
            if (transaccion_item) transaccion_item.value = this.modal.transaccion_item

            const produccion_orden = this.modal.send.values.find(a => a.relacion == 'produccion_ordenes')
            if (produccion_orden) produccion_orden.value = this.modal.produccion_orden

            const transaccion = this.modal.send.values.find(a => a.relacion == 'transacciones')
            if (transaccion) transaccion.value = this.modal.transaccion

            const cuarentena_producto = this.modal.send.values.find(a => a.relacion == 'cuarentena_productos')
            if (cuarentena_producto) cuarentena_producto.value = this.modal.cuarentena_producto


            // ----- ASIGNAR A LOS QUE SE RELACIONAN DESDE AQUÍ ----- //
            const maquina = this.modal.send.values.find(a => a.relacion == 'maquinas')
            if (maquina) this.modal.send.maquina = maquina.value

            const articulo = this.modal.send.values.find(a => a.relacion == 'articulos')
            if (articulo) this.modal.send.articulo = articulo.value

            const colaborador = this.modal.send.values.find(a => a.relacion == 'colaboradores')
            if (colaborador) this.modal.send.colaborador = colaborador.value
        },
        async grabar() {
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.formato_values, this.modal.send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.$emit('created', res.data)
            const vista = this.modal.formato.tipo == 'BPM' ? 'vFormatosBpm' : this.modal.formato.tipo == 'PHS' ? 'vFormatosPhs' : 'vFormatosHaccp'
            this.useVistas.addItem(vista, 'formato_values', res.data)
            this.useModals.show.mFormato = false
        },
        async modificar() {
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.formato_values, this.modal.send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.$emit('updated', res.data)
            const vista = this.modal.formato.tipo == 'BPM' ? 'vFormatosBpm' : this.modal.formato.tipo == 'PHS' ? 'vFormatosPhs' : 'vFormatosHaccp'
            this.useVistas.updateItem(vista, 'formato_values', res.data)
            this.useModals.show.mFormato = false
        },
    },
}
</script>

<style lang="scss" scoped>
.cols2 {
    display: flex;
    gap: 2rem;
    // flex-wrap: wrap;
    overflow-x: auto;
}

.relacionados {
    display: grid;
    grid-template-columns: 30rem;
    gap: 0.5rem;
    height: fit-content;
}

.container-datos {
    display: grid;
    grid-template-columns: 30rem;
    gap: 0.5rem;
    // max-height: calc(100dvh - 15rem);
    // overflow-y: auto;
    // overflow-x: hidden;

    .section {
        font-size: 1.2rem;
        margin-top: 1rem;
    }

    .instructivo {
        * {
            font-size: 0.9rem;
        }
    }
}

@media (max-width: 540px) {
    .cols2 {
        flex-direction: column;
    }

    .relacionados,
    .container-datos {
        grid-template-columns: minmax(100%, 33.5rem) !important;
    }
}
</style>
