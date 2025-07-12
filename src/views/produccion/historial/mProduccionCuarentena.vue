<template>
    <JdModal modal="mProduccionCuarentena" :buttons="buttons" @button-click="(action) => this[action]()">
        <p class="mrg-btm1">
            {{ modal.produccion_orden1.articulo1.nombre }}
        </p>

        <div class="container-datos"
            v-if="useAuth.verifyPermiso('vProductosCuarentena:crear', 'vProductosCuarentena:editar')">

            <JdInput label="Lote" :nec="true" v-model="nuevo.lote" />
            <JdInput label="F. vencimiento" type="Date" :nec="true" v-model="nuevo.fv" />
            <JdInput label="Cantidad" type="number" :nec="true" v-model="nuevo.cantidad" />

            <!-- <div class="fv_div">
                    <JdSelect v-model="item.fv1.anio" :lista="anios || []" mostrar="id" placeholder="año" />
                    <JdSelect v-model="item.fv1.mes" :lista="meses || []" placeholder="mes" />
                    <JdSelect v-model="item.fv1.dia" :lista="dias || []" mostrar="id" placeholder="día" />
                </div> -->

            <JdButton icon="fa-solid fa-plus" text="Agregar" tipo="2" @click="grabar"
                v-if="useAuth.verifyPermiso('vProductosCuarentena:crear') && nuevo.id == null" />

            <JdButton icon="fa-solid fa-pen-to-square" text="Actualizar" tipo="2" @click="modificar"
                v-if="useAuth.verifyPermiso('vProductosCuarentena:editar') && nuevo.id != null" />
        </div>

        <JdTable :columns="columns" :datos="modal.cuarentena_productos || []" :colAct="true" :seeker="false"
            :download="false" :reload="loadProductosCuarentena" :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod">
        </JdTable>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdButton from '@/components/inputs/JdButton.vue'
import JdInput from '@/components/inputs/JdInput.vue'
// import JdSelect from '@/components/inputs/JdSelect.vue'
import JdTable from '@/components/JdTable.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch, delet } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg, jqst } from '@/utils/swal'

import dayjs from 'dayjs'

export default {
    components: {
        JdModal,
        JdButton,
        JdInput,
        // JdSelect,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        dayjs,

        modal: {},
        nuevo: {},

        columns: [
            {
                id: 'lote',
                title: 'Lote',
                width: '8rem',
                show: true
            },
            {
                id: 'fv',
                title: 'F. vencim.',
                width: '10rem',
                show: true
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                width: '8rem',
                show: true
            },
            {
                id: 'estado',
                title: 'Estado',
                prop: 'estado1.nombre',
                format: 'estado',
                width: '8rem',
                show: true
            },
        ],
        tableRowOptions: [
            { id: 1, label: 'Editar', icon: 'fa-solid fa-pen-to-square', action: 'edit', permiso: 'vProductosCuarentena:editar', ocultar: { estado: 2 } },
            { id: 2, label: 'Eliminar', icon: 'fa-solid fa-trash-can', action: 'eliminar', permiso: 'vProductosCuarentena:eliminar', ocultar: { estado: 2 } },
        ],

        dias: [
            { id: '1' },
            { id: '2' },
            { id: '3' },
            { id: '4' },
            { id: '5' },
            { id: '6' },
            { id: '7' },
            { id: '8' },
            { id: '9' },
            { id: '10' },
            { id: '11' },
            { id: '12' },
            { id: '13' },
            { id: '14' },
            { id: '15' },
            { id: '16' },
            { id: '17' },
            { id: '18' },
            { id: '19' },
            { id: '20' },
            { id: '21' },
            { id: '22' },
            { id: '23' },
            { id: '24' },
            { id: '25' },
            { id: '26' },
            { id: '27' },
            { id: '28' },
            { id: '29' },
            { id: '30' },
            { id: '31' },
        ],
        meses: [
            { id: 1, nombre: 'Ene' },
            { id: 2, nombre: 'Feb' },
            { id: 3, nombre: 'Mar' },
            { id: 4, nombre: 'Abr' },
            { id: 5, nombre: 'May' },
            { id: 6, nombre: 'Jun' },
            { id: 7, nombre: 'Jul' },
            { id: 8, nombre: 'Ago' },
            { id: 9, nombre: 'Set' },
            { id: 10, nombre: 'Oct' },
            { id: 11, nombre: 'Nov' },
            { id: 12, nombre: 'Dic' },
        ],
        anios: []
    }),
    created() {
        this.modal = this.useModals.mProduccionCuarentena
        // this.produccion_orden = this.useModals.mProduccionCuarentena.item

        this.anios = Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() + i;
            return { id: year.toString() };
        })

        this.loadProductosCuarentena()

        this.initNuevo()
    },
    methods: {
        async loadProductosCuarentena() {
            const qry = {
                fltr: {
                    produccion_orden: { op: 'Es', val: this.modal.produccion_orden }
                },
                cols: ['lote', 'fv', 'cantidad', 'estado']
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.cuarentena_productos}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.cuarentena_productos = res.data
        },
        initNuevo() {
            this.nuevo = {
                lote: this.obtenerNumeroJuliano(),
                estado: 1
            }
        },
        obtenerNumeroJuliano(fecha = new Date()) {
            const inicioAnio = new Date(fecha.getFullYear(), 0, 0)
            const diferencia = fecha - inicioAnio
            const unDia = 1000 * 60 * 60 * 24
            const diaDelAnio = Math.floor(diferencia / unDia)

            const anio = fecha.getFullYear().toString().slice(-2)

            return `${diaDelAnio.toString().padStart(3, '0')} ${anio}`
        },

        async quitar(item) {
            const i = this.produccion_orden.pts.findIndex(a => a.id == item.id)
            this.produccion_orden.pts.splice(i, 1)
        },

        checkDatos() {
            const props = ['lote', 'fv', 'cantidad']

            if (incompleteData(this.nuevo, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        shapeDatos() {
            this.nuevo.produccion_orden = this.modal.produccion_orden
        },
        async grabar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.cuarentena_productos, this.nuevo)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.cuarentena_productos.unshift(res.data)
            this.initNuevo()
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.cuarentena_productos, this.nuevo)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const i = this.modal.cuarentena_productos.findIndex(a => a.id == res.data.id)
            this.modal.cuarentena_productos.splice(i, 1, this.nuevo)
            this.initNuevo()
        },

        runMethod(method, item) {
            this[method](item)
        },
        edit(item) {
            this.nuevo = JSON.parse(JSON.stringify(item))
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.cuarentena_productos, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.cuarentena_productos = this.modal.cuarentena_productos.filter(a => a.id != item.id)
        },
    }
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 20rem 20rem;
    gap: 0.5rem;
}

// .jd-table {
//     .fv_div {
//         display: grid;
//         grid-template-columns: 5.5rem 5rem 5rem;
//     }
// }</style>