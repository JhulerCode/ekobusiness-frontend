<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong v-if="vista.formato_id == null">Formatos PHS</strong>
            <strong v-else>{{ vista.formato_id }} {{ vista.formato_nombre }}</strong>

            <div class="buttons" v-if="vista.formato_id != null">
                <JdButton icon="fa-solid fa-arrow-left-long" text="Regresar" tipo="2"
                    @click="vista.formato_id = null" />

                <JdButton text="Nuevo" @click="nuevoFormatoValue()"
                    v-if="useAuth.verifyPermiso('vFormatosPhs:crear')" />
            </div>
        </div>

        <JdTable :name="tableName" :columns="columns" :datos="vista.formatos || []" :colAct="true"
            :reload="loadFormatos" :rowOptions="tableRowOptions" @rowOptionSelected="runMethod"
            v-if="vista.formato_id == null">
        </JdTable>

        <JdTable :columns="columns1" :datos="vista.formato_values || []" :colAct="true" :reload="ver"
            :rowOptions="tableRowOptions1" @rowOptionSelected="runMethod" v-else>
        </JdTable>
    </div>

    <mFormato v-if="useModals.show.mFormato" />
</template>

<script>
import { JdButton, JdTable } from '@jhuler/components'

import mFormato from '@/views/calidad/formatos/mFormato.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jmsg, jqst } from '@/utils/swal'

export default {
    components: {
        JdButton,
        JdTable,

        mFormato,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vFormatosPhs',
        columns: [
            {
                id: 'id',
                title: 'Código',
                width: '10rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'nombre',
                title: 'Nombre',
                width: '30rem',
                show: true,
                seek: true,
                sort: true
            },
        ],
        tableRowOptions: [
            { id: 1, label: 'Ver', icon: 'fa-regular fa-folder-open', action: 'ver', permiso: 'vFormatosPhs:listar' },
        ],

        columns1: [],
        tableRowOptions1: [
            { label: 'Ver', icon: 'fa-regular fa-folder-open', action: 'verFormatoValue', permiso: 'vFormatosPhs:ver' },
            { label: 'Editar', icon: 'fa-solid fa-pen-to-square', action: 'editarFormatoValue', permiso: 'vFormatosPhs:editar' },
            { label: 'Eliminar', icon: 'fa-solid fa-trash-can', action: 'eliminarFormatoValue', permiso: 'vFormatosPhs:eliminar' },
        ],
    }),
    created() {
        this.vista = this.useVistas.vFormatosPhs
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        this.loadFormatos()
    },
    beforeUnmount() {
        this.vista.formato_id = null
        this.vista.formato_nombre = null
    },
    methods: {
        async loadFormatos() {
            const qry = ['PHS']

            this.vista.formatos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.formatos}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.formatos = res.data
        },

        runMethod(action, item) {
            this[action](item)
        },
        async ver(item) {
            const formato_id = this.vista.formato_id == null ? item.id : this.vista.formato_id

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.formatos}/uno/${formato_id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.columns1 = res.data.columns

            this.vista.formato_id = res.data.id
            this.vista.formato_nombre = res.data.nombre

            const res1 = await this.loadFormatoValues()

            if (res1.code != 0) return

            this.vista.formato_values = res1.data
        },



        ///// ----- FORMATO VALUES ----- /////
        async loadFormatoValues() {
            const qry = {
                fltr: { codigo: { op: 'Es', val: this.vista.formato_id } },
                cols: [],
            }

            const hasTransaccionItem = this.columns1.some(a => a.relacion == 'transaccion_items')
            if (hasTransaccionItem) qry.cols.push('transaccion_item')

            const hasProduccionOrden = this.columns1.some(a => a.relacion == 'produccion_ordenes')
            if (hasProduccionOrden) qry.cols.push('produccion_orden')

            const hasMaquina = this.columns1.some(a => a.relacion == 'maquinas')
            if (hasMaquina) qry.cols.push('maquina')

            const hasTransaccion = this.columns1.some(a => a.relacion == 'transacciones')
            if (hasTransaccion) qry.cols.push('transaccion')

            const hasArticulo = this.columns1.some(a => a.relacion == 'articulos')
            if (hasArticulo) qry.cols.push('articulo')

            const hasColaborador = this.columns1.some(a => a.relacion == 'colaboradores')
            if (hasColaborador) qry.cols.push('colaborador')

            this.useAuth.setLoading(true, 'Cargando...')
            const res1 = await get(`${urls.formato_values}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            return res1
        },
        async nuevoFormatoValue() {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.formatos}/uno/${this.vista.formato_id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                formato: {
                    codigo: res.data.id,
                    tipo: res.data.tipo,
                    columns: res.data.columns,
                    instructivo: res.data.instructivo
                }
            }

            const hasMaquina = res.data.columns.find(a => a.relacion == 'maquinas')
            if (hasMaquina) {
                await this.loadMaquinas(hasMaquina.relacion_tipo)
                hasMaquina.lista = this.vista.maquinas
            }

            const hasArticulo = res.data.columns.find(a => a.relacion == 'articulos')
            if (hasArticulo) {
                await this.loadArticulos(hasArticulo.relacion_tipo)
                hasArticulo.lista = this.vista.articulos
            }

            const hasColaborador = res.data.columns.find(a => a.relacion == 'colaboradores')
            if (hasColaborador) {
                await this.loadColaboradores()
                hasColaborador.lista = this.vista.colaboradores
            }

            this.useModals.setModal('mFormato', this.vista.formato_id, 1, send, true)
        },

        async loadOneFormatoValue(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.formatos}/uno/${this.vista.formato_id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useAuth.setLoading(true, 'Cargando...')
            const res1 = await get(`${urls.formato_values}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res1.code != 0) return

            if (res1.data == null) return jmsg('error', 'No se encontraron datos')

            for (const a of res.data.columns) {
                a.value = res1.data[a.id]
            }

            const send = {
                transaccion_item: res1.data.produccion_orden,
                transaccion_item1: res1.data.transaccion_item1,

                produccion_orden: res1.data.produccion_orden,
                produccion_orden1: res1.data.produccion_orden1,

                transaccion: res1.data.transaccion,
                transaccion1: res1.data.transaccion1,

                formato: {
                    id: item.id,
                    codigo: res.data.id,
                    columns: res.data.columns,
                    instructivo: res.data.instructivo
                }
            }

            const hasMaquina = res.data.columns.find(a => a.relacion == 'maquinas')
            if (hasMaquina) {
                await this.loadMaquinas(hasMaquina.relacion_tipo)
                hasMaquina.lista = this.vista.maquinas
            }

            const hasArticulo = res.data.columns.find(a => a.relacion == 'articulos')
            if (hasArticulo) {
                await this.loadArticulos(hasArticulo.relacion_tipo)
                hasArticulo.lista = this.vista.articulos
            }

            const hasColaborador = res.data.columns.find(a => a.relacion == 'colaboradores')
            if (hasColaborador) {
                await this.loadColaboradores()
                hasColaborador.lista = this.vista.colaboradores
            }

            return send
        },
        async verFormatoValue(item) {
            const send = await this.loadOneFormatoValue(item)

            if (send == null) return

            this.useModals.setModal('mFormato', this.vista.formato_id, 3, send, true)
        },
        async editarFormatoValue(item) {
            const send = await this.loadOneFormatoValue(item)

            if (send == null) return

            this.useModals.setModal('mFormato', this.vista.formato_id, 2, send, true)
        },
        async eliminarFormatoValue(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.formato_values, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vFormatosPhs', 'formato_values', item)
        },

        async loadMaquinas(tipo) {
            const qry = {
                fltr: { tipo: { op: 'Es', val: tipo } },
                cols: ['codigo', 'nombre', 'produccion_tipo', 'velocidad', 'limpieza_tiempo'],
                ordr: [['nombre', 'ASC']],
            }

            this.vista.maquinas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.maquinas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.maquinas = res.data
        },
        async loadArticulos(tipo) {
            const qry = {
                fltr: { tipo: { op: 'Es', val: tipo } },
                cols: ['nombre', 'unidad'],
                ordr: [['nombre', 'ASC']],
            }

            this.vista.articulos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.articulos = res.data
        },
        async loadColaboradores() {
            const qry = {
                fltr: {},
                cols: ['nombres', 'apellidos', 'nombres_apellidos'],
                ordr: [['nombres', 'ASC']],
            }

            this.vista.colaboradores = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.colaboradores}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.colaboradores = res.data
        }
    },
}
</script>

<style lang="scss" scoped></style>
