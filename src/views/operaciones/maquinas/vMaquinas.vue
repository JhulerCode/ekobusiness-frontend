<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left">
                <strong>Maquinas</strong>

                <div class="buttons">
                    <JdButton
                        text="Nuevo"
                        title="Crear nuevo"
                        @click="nuevo()"
                        v-if="useAuth.verifyPermiso('vMaquinas:crear')"
                    />
                </div>
            </div>

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="columns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadMaquinas"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadMaquinas" />

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
            :datos="vista.maquinas || []"
            :colAct="true"
            :configFiltros="openConfigFiltros"
            :reload="loadMaquinas"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        />
    </div>

    <mMaquina v-if="useModals.show.mMaquina" />

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdButton, mConfigFiltros } from '@jhuler/components'
import JdTable from '@/components/JdTable/JdTable.vue'
import JdBuscador from '@/components/JdBuscador.vue'
import JdPaginacion from '@/components/JdPaginacion.vue'
import { columns, tableRowOptions } from './maquinas.config.js'

import mMaquina from '@/views/operaciones/maquinas/mMaquina.vue'

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

        mConfigFiltros,

        mMaquina,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vMaquinas',
        columns,
        tableRowOptions,
    }),
    created() {
        this.vista = this.useVistas.vMaquinas
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vMaquinas:listar') == true) this.loadMaquinas()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 1 } },
                cols: ['codigo', 'nombre', 'linea', 'velocidad', 'limpieza_tiempo'],
                ordr: [['nombre', 'ASC']],
                incl: ['linea1'],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadMaquinas() {
            this.setQuery()

            this.vista.maquinas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.maquinas}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.maquinas = res.data
        },

        nuevo() {
            const item = { tipo: 1 }

            this.useModals.setModal('mMaquina', 'Nueva máquina', 1, item)
        },

        async openConfigFiltros() {
            const cols = this.columns
            for (const a of cols) {
                if (a.id == 'linea') a.reload = this.loadLineas
            }

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadMaquinas,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.maquinas}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mMaquina', 'Editar documento', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.maquinas, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vMaquinas', 'maquinas', item)
        },

        async loadLineas() {
            const qry = {
                fltr: {},
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
            }

            this.vista.articulo_lineas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_lineas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.articulo_lineas = res.data
            return res.data
        },
    },
}
</script>

<style lang="scss" scoped></style>
