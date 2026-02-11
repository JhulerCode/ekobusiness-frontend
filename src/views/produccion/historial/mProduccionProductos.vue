<template>
    <JdModal modal="mProduccionProductos">
        <p class="mrg-btm1">
            <small>Producto:</small> {{ modal.produccion_orden.articulo1.nombre }}
            <small>Cant. planificada:</small> {{ modal.produccion_orden.cantidad }}
        </p>

        <div class="container-datos" v-if="modal.produccion_orden.estado == 1">
            <JdInput
                label="Lote"
                :nec="true"
                v-model="modal.transaccion_item.lote"
                :disabled="!produccion_orden"
            />

            <JdInput
                label="F. vencimiento"
                type="Date"
                :nec="modal.produccion_orden.articulo1.has_fv"
                v-model="modal.transaccion_item.fv"
                style="grid-column: 1/2"
            />

            <JdInput
                label="Cantidad"
                type="number"
                :nec="true"
                v-model="modal.transaccion_item.cantidad"
                style="grid-column: 1/2"
            />

            <JdButton
                text="Grabar"
                tipo="2"
                @click="grabar"
                v-if="modal.transaccion_item.id == null"
                style="grid-column: 1/2"
            />

            <JdButton
                icon="fa-solid fa-pen-to-square"
                text="Actualizar"
                tipo="2"
                @click="modificar"
                v-if="modal.transaccion_item.id != null"
            />
        </div>

        <JdTable
            :columns="columns"
            :datos="modal.produccion_productos || []"
            :colAct="modal.tableColAct"
            :seeker="false"
            :download="false"
            :reload="loadProduccionProductos"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        >
        </JdTable>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdButton, JdTable } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch, delet } from '@/utils/crud'
import { incompleteData, obtenerNumeroJuliano } from '@/utils/mine'
import { jmsg, jqst } from '@/utils/swal'

import dayjs from 'dayjs'

export default {
    components: {
        JdModal,
        JdButton,
        JdInput,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        dayjs,

        modal: {},

        columns: [
            {
                id: 'lote',
                title: 'Lote',
                width: '8rem',
                show: true,
            },
            {
                id: 'fv',
                title: 'F. vencim.',
                format: 'date',
                width: '10rem',
                show: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                format: 'number',
                width: '8rem',
                show: true,
            },
            {
                id: 'producto_estado',
                title: 'Estado',
                prop: 'producto_estado1.nombre',
                format: 'estado',
                width: '8rem',
                show: true,
            },
        ],
        tableRowOptions: [
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'edit',
                ocultar: { producto_estado: 2 },
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                ocultar: { producto_estado: 2 },
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mProduccionProductos

        this.modal.tableColAct = this.modal.produccion_orden.estado == 1 ? true : false

        this.initTransaccion()
        this.loadProduccionProductos()
    },
    methods: {
        initTransaccion() {
            this.modal.transaccion_item = {
                tipo: 4,
                fecha: this.modal.produccion_orden.fecha,
                produccion_orden: this.modal.produccion_orden.id,
                maquina: this.modal.produccion_orden.maquina,

                articulo: this.modal.produccion_orden.articulo,
                lote: this.modal.lote_manual
                    ? this.setJulianoSunka(this.modal.produccion_orden.fecha)
                    : this.setLote(),

                pu: 1, // FALTA CALCULAR EL COSTO UNITARIO
                igv_afectacion: 10, // FALTA QUE LO OBTENGA DEL PRODUCTO
                igv_porcentaje: 18, // FALTA QUE TRAIGA DE LA EMPRESA
                moneda: 1,
                tipo_cambio: 1,
            }
        },

        async loadProduccionProductos() {
            this.modal.produccion_productos = []

            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: 4 },
                    produccion_orden: { op: 'Es', val: this.modal.produccion_orden.id },
                },
                cols: ['lote', 'fv', 'cantidad', 'is_lote_padre', 'producto_estado'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.produccion_productos = res.data
        },

        setJulianoSunka(fechatexto) {
            const fecha = fechatexto ? new Date(fechatexto) : new Date()
            const inicioAnio = new Date(fecha.getFullYear(), 0, 0)
            const diferencia = fecha - inicioAnio
            const unDia = 1000 * 60 * 60 * 24
            const diaDelAnio = Math.floor(diferencia / unDia) + 1

            const anio = fecha.getFullYear().toString().slice(-2)

            return `${diaDelAnio.toString().padStart(3, '0')} ${anio}`
        },
        setLote() {
            return `${obtenerNumeroJuliano(this.modal.transaccion_item.fecha)}-${Math.floor(Math.random() * 90 + 10)}`
        },

        checkDatos() {
            const props = ['lote', 'cantidad']

            if (this.modal.produccion_orden.articulo1.has_fv) {
                props.push('fv')
            }

            if (incompleteData(this.modal.transaccion_item, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async grabar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.kardex, this.modal.transaccion_item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.produccion_productos.unshift(res.data)
            this.initTransaccion()
            this.$emit('productosCargados', this.sumarProductos())
        },
        async modificar() {
            if (this.checkDatos()) return

            const send = {
                id: this.modal.transaccion_item.id,
                articulo: this.modal.produccion_orden.articulo,
                lote: this.modal.transaccion_item.lote,
                fv: this.modal.transaccion_item.fv,
                cantidad: this.modal.transaccion_item.cantidad,
            }

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.kardex, send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const i = this.modal.produccion_productos.findIndex((a) => a.id == send.id)
            this.modal.produccion_productos.splice(i, 1, this.modal.transaccion_item)
            this.initTransaccion()
            this.$emit('productosCargados', this.sumarProductos())
        },

        runMethod(method, item) {
            this[method](item)
        },
        edit(item) {
            this.modal.transaccion_item = JSON.parse(JSON.stringify(item))
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.kardex, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const i = this.modal.produccion_productos.findIndex((a) => a.id == item.id)
            this.modal.produccion_productos.splice(i, 1)
            this.$emit('productosCargados', this.sumarProductos())
        },
        sumarProductos() {
            let total = 0
            for (const a of this.modal.produccion_productos) {
                total += a.cantidad
            }

            return {
                id: this.modal.produccion_orden.id,
                productos_terminados: total,
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: repeat(2, 20rem);
    gap: 0.5rem;
}
</style>
