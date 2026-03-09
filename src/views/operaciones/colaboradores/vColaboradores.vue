<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left">
                <strong>Colaboradores</strong>

                <div class="buttons">
                    <JdButton
                        text="Nuevo"
                        title="Crear nuevo"
                        @click="nuevo()"
                        v-if="useAuth.verifyPermiso('vColaboradores:crear')"
                    />
                </div>
            </div>

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="columns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadColaboradores"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadColaboradores" />

                <JdButton
                    icon="fa-solid fa-file-excel"
                    tipo="2"
                    title="Exportar"
                    @click="$refs['jdtable'].downloadData()"
                />

                <JdButton
                    icon="fa-solid fa-gear"
                    tipo="2"
                    title="Columnas"
                    @click="$refs['jdtable'].openConfigCols()"
                />
            </div>
        </div>

        <JdTable
            ref="jdtable"
            :name="tableName"
            :columns="columns"
            :datos="vista.colaboradores || []"
            :colAct="true"
            :configFiltros="openConfigFiltros"
            :configCols="true"
            :reload="loadColaboradores"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        />
    </div>

    <mColaborador v-if="useModals.show.mColaborador" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdButton, mConfigFiltros, mConfigCols } from '@jhuler/components'
import JdTable from '@/components/JdTable/JdTable.vue'
import JdBuscador from '@/components/JdBuscador.vue'
import JdPaginacion from '@/components/JdPaginacion.vue'
import { columns, tableRowOptions } from './colaboradores.config.js'

import mColaborador from './mColaborador.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    components: {
        JdButton,
        JdTable,
        JdBuscador,
        JdPaginacion,

        mConfigCols,
        mConfigFiltros,

        mColaborador,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vColaboradores',
        columns,
        tableRowOptions,
    }),
    created() {
        this.vista = this.useVistas.vColaboradores
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vColaboradores:listar') == true) this.loadColaboradores()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
                ordr: [['nombres', 'ASC']],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadColaboradores() {
            this.setQuery()

            this.vista.colaboradores = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.colaboradores}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.colaboradores = res.data
        },

        nuevo() {
            const item = { activo: true, has_signin: false }

            this.useModals.setModal('mColaborador', 'Nuevo colaborador', 1, item)
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.columns
            for (const a of cols) {
                if (a.id == 'sexo') a.lista = this.vista.generos
                if (a.id == 'doc_tipo') a.lista = this.vista.documentos_identidad
                if (a.id == 'activo') a.lista = this.vista.estados
            }

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadColaboradores,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async ver(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.colaboradores}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mColaborador', 'Ver colaborador', 3, res.data)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.colaboradores}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mColaborador', 'Editar colaborador', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.colaboradores, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vColaboradores', 'colaboradores', item)
        },

        async loadDatosSistema() {
            const qry = ['generos', 'documentos_identidad', 'estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>
