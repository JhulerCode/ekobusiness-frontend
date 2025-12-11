<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Inspecciones de clientes</strong>

            <div class="buttons">
                <JdButton
                    text="Nuevo"
                    title="Crear nuevo"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vInspecciones:crear')"
                />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.inspecciones || []"
            :colAct="true"
            :configFiltros="openConfigFiltros"
            :reload="loadInspecciones"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        >
        </JdTable>
    </div>

    <mInspeccion v-if="useModals.show.mInspeccion" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdButton, JdTable, mConfigFiltros } from '@jhuler/components'

import mInspeccion from './mInspeccion.vue'

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

        mConfigFiltros,

        mInspeccion,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vInspecciones',
        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                type: 'date',
                format: 'date',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'socio',
                title: 'Cliente',
                prop: 'socio1.nombres',
                type: 'select',
                mostrar: 'nombres_apellidos',
                width: '20rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'puntuacion',
                title: 'Puntuación',
                type: 'number',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'puntuacion_maxima',
                title: 'Puntuación máxima',
                type: 'number',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            // {
            //     id: 'documento',
            //     title: 'Documento',
            //     type: 'text',
            //     width: '10rem',
            //     show: true,
            //     seek: true,
            //     sort: false
            // },
        ],
        tableRowOptions: [
            {
                label: 'Ver',
                icon: 'fa-regular fa-folder-open',
                action: 'ver',
                permiso: 'vInspecciones:ver',
            },
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vInspecciones:editar',
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: 'vInspecciones:eliminar',
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vInspecciones
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vInspecciones:listar') == true) this.loadInspecciones()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['socio1'],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadInspecciones() {
            this.setQuery()

            this.vista.inspecciones = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.inspecciones}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.inspecciones = res.data
        },

        nuevo() {
            const item = {
                fecha: dayjs().format('YYYY-MM-DD'),
                correcciones: [],
            }

            this.useModals.setModal('mInspeccion', 'Nueva inspección', 1, item)
        },

        async openConfigFiltros() {
            // await this.loadDatosSistema()
            await this.loadSocios()

            const cols = this.columns
            cols.find((a) => a.id == 'socio').lista = this.vista.socios

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadInspecciones,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async ver(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.inspecciones}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                item: res.data,
                socios: [{ ...res.data.socio1 }],
            }

            this.useModals.setModal('mInspeccion', 'Ver inspección', 3, send, true)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.inspecciones}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mInspeccion', 'Editar inspección', 2, res.data)
        },
        // uploadFile(item) {
        //     const send = {
        //         item: {
        //             id: item.id,
        //             file: item.documento,
        //             url: 'documentos',
        //             route: '/uploadDoc',
        //         },
        //         varios: 1
        //     }

        //     this.useModals.setModal('mUploadFiles', 'Subir documento', null, send, true)
        // },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.inspecciones, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vInspecciones', 'inspecciones', item)
        },

        async loadSocios() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: 2 }, activo: { op: 'Es', val: true } },
                cols: ['nombres', 'apellidos', 'nombres_apellidos'],
                ordr: [
                    ['nombres', 'ASC'],
                    ['apellidos', 'ASC'],
                ],
            }

            this.vista.socios = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.vista.socios = res.data
        },
        // async loadDatosSistema() {
        //     const qry = ['documentos_estados']
        //     const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

        //     if (res.code != 0) return

        //     Object.assign(this.vista, res.data)
        // },
    },
}
</script>

<style lang="scss" scoped></style>
