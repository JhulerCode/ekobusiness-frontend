<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left" style="flex-wrap: nowrap">
                <strong style="white-space: nowrap">Lista de materiales</strong>

                <JdButtonsOverflow :buttons="headerActions" @runMethod="runMethod" />
            </div>

            <div class="head-center">
                <JdBuscador
                    :view="vista"
                    :columns="tableColumns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadMrpBoms"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadMrpBoms" />

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
            :name="tableName"
            :columns="tableColumns"
            :datos="vista.mrp_boms || []"
            :colAct="true"
            :rowOptions="tableRowActions"
            @rowOptionSelected="runMethod"
            ref="jdtable"
            :reload="loadMrpBoms"
        />
    </div>

    <mMrpBom v-if="useModals.show.mMrpBom" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdButton, mConfigCols, mConfigFiltros } from '@jhuler/components'
import JdBuscador from '@/components/JdBuscador.vue'
import JdTable from '@/components/JdTable/JdTable.vue'
import JdPaginacion from '@/components/JdPaginacion.vue'

import mMrpBom from './mMrpBom.vue'
import JdButtonsOverflow from '@/components/JdButtonsOverflow.vue'

import { TABLE_COLUMNS, TABLE_ROW_ACTIONS, HEADER_ACTIONS } from './mrp_bom.config.js'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    name: 'vMrpBom',
    components: {
        JdButton,
        JdBuscador,
        JdTable,
        JdPaginacion,

        mConfigCols,
        mConfigFiltros,

        mMrpBom,
        JdButtonsOverflow,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        vista: {},

        tableName: 'vMrpBom',
        headerActions: HEADER_ACTIONS,
        tableColumns: JSON.parse(JSON.stringify(TABLE_COLUMNS)),
        tableRowActions: TABLE_ROW_ACTIONS,
    }),
    created() {
        this.vista = this.useVistas.vMrpBom
        this.useAuth.setColumns(this.tableName, this.tableColumns)

        if (this.vista.loaded) return
        this.vista.table_page = 1
        if (this.useAuth.verifyPermiso('vMrpBom:listar') == true) this.loadMrpBoms()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['articulo1'],
                ordr: [['articulo1', 'nombre', 'ASC']],
                page: this.vista.table_page,
            }

            this.useAuth.updateQuery(this.tableColumns, this.vista.qry)
            this.vista.qry.cols.push('tipo1')
        },
        async loadMrpBoms() {
            this.setQuery()

            this.vista.mrp_boms = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.mrp_boms}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.mrp_boms = res.data
            this.vista.table_meta = res.meta
        },

        nuevo() {
            const send = {
                mrp_bom: {
                    mrp_bom_socios: [],
                    mrp_bom_lines: [],
                },
            }

            this.useModals.setModal('mMrpBom', 'Nueva lista de materiales', 1, send, true)
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.tableColumns
            for (const a of cols) {
                if (a.id == 'tipo') a.lista = this.vista.mrp_bom_tipos
            }

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadMrpBoms,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            const qry = {
                incl: ['articulo1'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.mrp_boms}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const qry1 = {
                fltr: {
                    mrp_bom: { op: 'Es', val: item.id },
                },
                cols: ['articulo', 'cantidad', 'orden'],
                incl: ['articulo1'],
                ordr: [['orden', 'ASC']],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res1 = await get(`${urls.mrp_bom_lines}?qry=${JSON.stringify(qry1)}`)
            this.useAuth.setLoading(false)

            if (res1.code != 0) return

            const qry2 = {
                fltr: {
                    mrp_bom: { op: 'Es', val: item.id },
                },
                cols: ['socio'],
                incl: ['socio1'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res2 = await get(`${urls.mrp_bom_socios}?qry=${JSON.stringify(qry2)}`)
            this.useAuth.setLoading(false)

            if (res2.code != 0) return

            const send = {
                mrp_bom: {
                    ...res.data,
                    mrp_bom_lines: res1.data,
                    mrp_bom_socios: res2.data,
                },
                articulos_fabricables: [{ ...res.data.articulo1 }],
            }

            for (const a of send.mrp_bom.mrp_bom_lines) {
                a.table_columns = {
                    articulo_lista: [{ ...a.articulo1 }],
                }
            }

            for (const a of send.mrp_bom.mrp_bom_socios) {
                a.table_columns = {
                    socio_lista: [{ ...a.socio1 }],
                }
            }

            this.useModals.setModal('mMrpBom', 'Editar lista de materiales', 2, send, true)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.mrp_boms, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vMrpBom', 'mrp_boms', item)
        },
        async clonar(item) {
            const qry = {
                incl: ['articulo1'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.mrp_boms}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const qry1 = {
                fltr: {
                    mrp_bom: { op: 'Es', val: item.id },
                },
                cols: { exclude: [] },
                incl: ['articulo1'],
                ordr: [['orden', 'ASC']],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res1 = await get(`${urls.mrp_bom_lines}?qry=${JSON.stringify(qry1)}`)
            this.useAuth.setLoading(false)

            if (res1.code != 0) return

            const qry2 = {
                fltr: {
                    mrp_bom: { op: 'Es', val: item.id },
                },
                cols: ['socio'],
                incl: ['socio1'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res2 = await get(`${urls.mrp_bom_socios}?qry=${JSON.stringify(qry2)}`)
            this.useAuth.setLoading(false)

            if (res2.code != 0) return

            const send = {
                mrp_bom: {
                    ...res.data,
                    mrp_bom_lines: res1.data,
                    mrp_bom_socios: res2.data,
                    id: null,
                },
                articulos_fabricables: [{ ...res.data.articulo1 }],
            }

            for (const a of send.mrp_bom.mrp_bom_lines) {
                a.table_columns = {
                    articulo_lista: [{ ...a.articulo1 }],
                }
            }

            for (const a of send.mrp_bom.mrp_bom_socios) {
                a.table_columns = {
                    socio_lista: [{ ...a.socio1 }],
                }
            }

            this.useModals.setModal('mMrpBom', 'Nueva lista de materiales', 1, send, true)
        },

        async loadDatosSistema() {
            const qry = ['mrp_bom_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>
