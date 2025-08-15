<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Caja chica</strong>

            <div class="buttons">
                <JdButton text="Nuevo" title="Crear nuevo" @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vCajaAperturas:aperturarCaja')" />
            </div>
        </div>

        <JdTable :name="tableName" :columns="columns" :datos="vista.caja_aperturas || []" :colAct="true"
            :configFiltros="openConfigFiltros" :reload="loadCajaAperturas" :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod">
        </JdTable>
    </div>

    <mCajaApertura v-if="useModals.show.mCajaApertura" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import JdButton from '@/components/inputs/JdButton.vue'
import JdTable from '@/components/JdTable.vue'

import mConfigCols from '@/components/mConfigCols.vue'
import mConfigFiltros from '@/components/mConfigFiltros.vue'

import mCajaApertura from './mCajaApertura.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'
import dayjs from 'dayjs'

export default {
    components: {
        JdButton,
        JdTable,

        mConfigCols,
        mConfigFiltros,

        mCajaApertura,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vCajaAperturas',
        columns: [
            {
                id: 'fecha_apertura',
                title: 'Fecha apertura',
                type: 'date',
                format: 'date',
                width: '12rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'monto_apertura',
                title: 'Monto apertura',
                type: 'number',
                format: 'decimal',
                width: '12rem',
                show: true,
                seek: false,
                sort: false
            },
            {
                id: 'fecha_cierre',
                title: 'Fecha cierre',
                type: 'date',
                format: 'date',
                width: '12rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'monto_cierre',
                title: 'Monto cierre',
                type: 'number',
                format: 'decimal',
                width: '12rem',
                show: true,
                seek: false,
                sort: false
            },
            {
                id: 'estado',
                title: 'Estado',
                type: 'select',
                prop: 'estado1.nombre',
                format: 'estado',
                width: '10rem',
                show: true,
                seek: false,
                sort: false
            },
        ],
        tableRowOptions: [
            { id: 1, label: 'Ver', icon: 'fa-solid fa-up-right-from-square', action: 'ver', permiso: 'vCajaAperturas:ver' },
            { id: 2, label: 'Cerrar caja', icon: 'fa-solid fa-check-double', action: 'cerrarCaja', permiso: 'vCajaAperturas:cerrarCaja', ocultar: { estado: 2 } },
            { id: 3, label: 'Eliminar', icon: 'fa-solid fa-trash-can', action: 'eliminar', permiso: 'vCajaAperturas:eliminar', ocultar: { estado: 2 } },
            { id: 4, label: 'Movimientos', icon: 'fa-solid fa-right-left', action: 'agregarMovimientos', permiso: 'vCajaMovimientos:listar', ocultar: { estado: 2 } },
        ],
    }),
    created() {
        this.vista = this.useVistas.vCajaAperturas
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vCajaAperturas:listar') == true) this.loadCajaAperturas()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadCajaAperturas() {
            this.setQuery()

            this.vista.caja_aperturas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.caja_aperturas}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.caja_aperturas = res.data
        },

        nuevo() {
            const item = { fecha_apertura: dayjs().format('YYYY-MM-DD'), estado: 1 }

            this.useModals.setModal('mCajaApertura', 'Caja', 1, item)
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.columns
            cols.find(a => a.id == 'estado').lista = this.vista.caja_apertura_estados

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadCajaAperturas
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async ver(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.caja_aperturas}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mCajaApertura', 'Caja', 3, res.data)
        },
        async agregarMovimientos(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.caja_aperturas}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mCajaApertura', 'Caja', 4, res.data)
        },
        async cerrarCaja(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.caja_aperturas}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mCajaApertura', 'Caja', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.caja_aperturas, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vCajaAperturas', 'caja_aperturas', item)
        },

        async loadDatosSistema() {
            const qry = ['caja_apertura_estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },

}
</script>

<style lang="scss" scoped></style>
