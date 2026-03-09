<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left">
                <strong>Equipos</strong>

                <div class="buttons">
                    <JdButton
                        text="Nuevo"
                        title="Crear nuevo"
                        @click="nuevo()"
                        v-if="useAuth.verifyPermiso('vEquipos:crear')"
                    />
                </div>
            </div>

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="tableColumns"
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
            :columns="tableColumns"
            :datos="vista.maquinas || []"
            :colAct="true"
            :configFiltros="openConfigFiltros"
            :reload="loadMaquinas"
            :rowOptions="tableRowActions"
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
import { columns, tableRowActions } from './equipos.config.js'

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

        tableName: 'vEquipos',
        columns,
        tableRowActions,
    }),
    created() {
        this.vista = this.useVistas.vEquipos
        this.useAuth.setColumns(this.tableName, this.tableColumns)

        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vEquipos:listar') == true) this.loadMaquinas()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 2 } },
                cols: ['codigo', 'nombre'],
                ordr: [['nombre', 'ASC']],
            }

            this.useAuth.updateQuery(this.tableColumns, this.vista.qry)
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
            const item = { tipo: 2 }

            this.useModals.setModal('mMaquina', 'Nueva máquina', 1, item)
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.tableColumns

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

            this.useVistas.removeItem('vEquipos', 'maquinas', item)
        },
    },
}
</script>

<style lang="scss" scoped></style>
