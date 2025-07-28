<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Registros sanitarios</strong>

            <div class="buttons">
                <JdButton text="Nuevo" title="Crear nuevo" @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vRegistrosSanitarios:crear')" />
            </div>
        </div>

        <JdTable :name="tableName" :columns="columns" :datos="vista.documentos || []" :colAct="true"
            :configFiltros="openConfigFiltros" :reload="loadDocumentos" :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod">
        </JdTable>
    </div>

    <mDocumento v-if="useModals.show.mDocumento" />
    <!-- <mUploadFiles v-if="useModals.show.mUploadFiles" @uploaded="handelUploadFiles" @deleted="handelDeleteFiles" /> -->
    <mUploadFiles v-if="useModals.show.mUploadFiles" />

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import JdButton from '@/components/inputs/JdButton.vue'
import JdTable from '@/components/JdTable.vue'

import mConfigFiltros from '@/components/mConfigFiltros.vue'

import mDocumento from '@/views/operaciones/documentos/mDocumento.vue'
import mUploadFiles from '@/components/mUploadFiles.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet, getFile } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    components: {
        JdButton,
        JdTable,

        mConfigFiltros,

        mDocumento,
        mUploadFiles
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vRegistrosSanitarios',
        columns: [
            {
                id: 'denominacion_legal',
                title: 'Denominación legal',
                type: 'text',
                width: '20rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'denominacion_comercial',
                title: 'Denominación comercial',
                type: 'text',
                width: '20rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'registro_sanitario',
                title: 'Registro sanitario',
                type: 'date',
                width: '12rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'fecha_emision',
                title: 'Fecha de emisión',
                type: 'date',
                format: 'date',
                width: '12rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'fecha_vencimiento',
                title: 'Fecha de vencimiento',
                type: 'date',
                format: 'date',
                width: '12rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'recordar_dias',
                title: 'Recordatorio',
                type: 'number',
                width: '8rem',
                show: true,
                seek: true,
                sort: true
            },
            {
                id: 'estado',
                title: 'Estado',
                prop: 'estado1.nombre',
                type: 'select',
                format: 'estado',
                width: '10rem',
                show: true,
                seek: true,
                sort: true
            },
        ],
        tableRowOptions: [
            { label: 'Editar', icon: 'fa-solid fa-pen-to-square', action: 'editar', permiso: 'vRegistrosSanitarios:editar' },
            { label: 'Ver pdf', icon: 'fa-regular fa-file-pdf', action: 'verFile', permiso: 'vRegistrosSanitarios:editar', ocultar: { file_name: null } },
            { label: 'Eliminar', icon: 'fa-solid fa-trash-can', action: 'eliminar', permiso: 'vRegistrosSanitarios:eliminar' },
        ]
    }),
    created() {
        this.vista = this.useVistas.vRegistrosSanitarios
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vRegistrosSanitarios:listar') == true) this.loadDocumentos()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 2 } },
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadDocumentos() {
            this.setQuery()

            this.vista.documentos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.documentos}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.documentos = res.data
        },

        nuevo() {
            const item = { tipo: 2 }

            this.useModals.setModal('mDocumento', 'Nuevo registro sanitario', 1, item)
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.columns
            cols.find(a => a.id == 'estado').lista = this.vista.documentos_estados

            const send = {
                table: this.tableName,
                cols: cols.filter(a => a.id !== 'estado'),
                reload: this.loadDocumentos
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.documentos}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mDocumento', 'Editar registro sanitario', 2, res.data)
        },
        verFile(item) {
            getFile(`${urls.documentos}/uploads/${item.file_name}`)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.documentos, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vRegistrosSanitarios', 'documentos', item)
        },

        async loadDatosSistema() {
            const qry = ['documentos_estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>
