<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Asistencias</strong>

            <div class="buttons">
                <JdButton
                    text="Crear"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vAsistencias:crear')"
                />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.asistencias || []"
            :configFiltros="openConfigFiltros"
            :reload="loadAsistencias"
            :colAct="true"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        >
        </JdTable>
    </div>

    <mAsistencia v-if="useModals.show.mAsistencia" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdButton, JdTable, mConfigFiltros, mConfigCols } from '@jhuler/components'

import mAsistencia from './mAsistencia.vue'

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

        mAsistencia,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vAsistencias',
        columns: [
            {
                id: 'colaborador',
                title: 'Colaborador',
                prop: 'colaborador1.nombres_apellidos',
                type: 'select',
                mostrar: 'nombres_apellidos',
                width: '15rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'fecha_entrada',
                title: 'Fecha de entrada',
                format: 'date',
                type: 'date',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'hora_entrada',
                title: 'Hora de entrada',
                type: 'time',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'fecha_salida',
                title: 'Fecha de salida',
                format: 'date',
                type: 'date',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'hora_salida',
                title: 'Hora de salida',
                type: 'time',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
        tableRowOptions: [
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vAsistencias:editar',
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: 'vAsistencias:eliminar',
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vAsistencias
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vAsistencias:listar') == true) this.loadAsistencias()
    },
    methods: {
        initFiltros() {
            this.columns[1].op = 'Está dentro de'
            this.columns[1].val = dayjs().startOf('month').format('YYYY-MM-DD')
            this.columns[1].val1 = dayjs().format('YYYY-MM-DD')
        },
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['colaborador1'],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadAsistencias() {
            this.setQuery()

            this.vista.asistencias = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.asistencias}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.asistencias = res.data
        },

        async nuevo() {
            if (!this.vista.colaboradores) await this.loadColaboradores()

            const send = {
                asistencia: {},
                colaboradores: this.vista.colaboradores,
            }

            this.useModals.setModal('mAsistencia', 'Nuevo asistencia', 1, send, true)
        },

        async openConfigFiltros() {
            if (!this.vista.colaboradores) await this.loadColaboradores()

            const cols = this.columns
            cols.find((a) => a.id == 'colaborador').lista = this.vista.asistencias

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadAsistencias,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.asistencias}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            if (!this.vista.colaboradores) await this.loadColaboradores()
            console.log(this.vista.colaboradores)

            const send = {
                asistencia: res.data,
                colaboradores: this.vista.colaboradores,
            }

            console.log(send)
            this.useModals.setModal('mAsistencia', 'Editar asistencia', 2, send, true)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.asistencias, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vAsistencias', 'asistencias', item)
        },

        async loadColaboradores() {
            const qry = {
                cols: ['nombres', 'apellidos', 'nombres_apellidos'],
            }

            this.vista.colaboradores = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.colaboradores}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.colaboradores = res.data
        },
    },
}
</script>

<style lang="scss" scoped></style>
