<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left">
                <strong>Proveedores</strong>

                <JdButton
                    text="Nuevo"
                    title="Crear nuevo"
                    @click="nuevo"
                    v-if="useAuth.verifyPermiso('vProveedores:crear')"
                />
            </div>

            <div class="head-center">
                <JdBulkActions
                    v-if="cantidadSeleccionados > 0"
                    :view="vista"
                    dataKey="socios"
                    :bulkActions="tableActions"
                    @bulkActionSelected="runMethod"
                />

                <JdBuscador
                    v-else
                    :view="vista"
                    :columns="columns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadSocios"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadSocios" />

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
            :columns="columns"
            :datos="vista.socios || []"
            :colAct="true"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
            :rowSelectable="true"
            :bulkActions="tableActions"
            @bulkActionSelected="runMethod"
            ref="jdtable"
            :reload="loadSocios"
        />
    </div>

    <!-- Modales -->
    <mSocio v-if="useModals.show.mSocio" />
    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
    <mEditar v-if="useModals.show.mEditar" @updated="updatedBulk" />
</template>

<script>
// Componentes base y utilidades
import { JdButton, mConfigFiltros, mConfigCols, mEditar } from '@jhuler/components'
import JdBulkActions from '@/components/JdBulkActions.vue'
import JdBuscador from '@/components/JdBuscador.vue'
import JdTable from '@/components/JdTable/JdTable.vue'
import JdPaginacion from '@/components/JdPaginacion.vue'

// Configuración de la vista
import { COLUMNS, TABLE_ACTIONS, TABLE_ROW_OPTIONS } from './proveedores.config'

// Modales específicos
import mSocio from '@/views/logistica_entrada/proveedores/mSocio.vue'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    name: 'vProveedores',
    components: {
        JdButton,
        JdBulkActions,
        JdBuscador,
        JdTable,
        JdPaginacion,
        mConfigCols,
        mConfigFiltros,
        mEditar,
        mSocio,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},
        tableName: 'vProveedores',

        // Configuraciones traídas de proveedores.config.js
        columns: JSON.parse(JSON.stringify(COLUMNS)),
        tableActions: TABLE_ACTIONS,
        tableRowOptions: TABLE_ROW_OPTIONS,
    }),
    computed: {
        cantidadSeleccionados() {
            return (this.vista.socios || []).filter((a) => a.selected).length
        },
    },
    async created() {
        this.vista = this.useVistas.vProveedores
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
        this.vista.table_page = 1
        if (this.useAuth.verifyPermiso('vProveedores:listar')) this.loadSocios()
    },
    methods: {
        // --- Gestión de Tabla ---
        runMethod(method, item) {
            this[method](item)
        },

        // --- Carga de Datos ---
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 1 } },
                ordr: [['nombres', 'ASC']],
                page: this.vista.table_page,
            }
            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadSocios() {
            this.setQuery()
            this.vista.socios = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true
            if (res.code != 0) return
            this.vista.socios = res.data
            this.vista.table_meta = res.meta
        },

        // --- Datos de Apoyo ---
        async loadDatosSistema() {
            const qry = ['documentos_identidad', 'estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)
            if (res.code == 0) Object.assign(this.vista, res.data)
        },

        // --- Acciones de Registro ---
        nuevo() {
            const send = {
                tipo: 1,
                doc_tipo: 6,
                direcciones: [],
                contactos: [],
                bancos: [],
                documentos: [],
                activo: true,
            }
            this.useModals.setModal('mSocio', 'Nuevo proveedor', 1, send, true)
        },
        async ver(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}/uno/${item.id}`)
            this.useAuth.setLoading(false)
            if (res.code != 0) return
            const send = {
                item: res.data,
            }
            this.useModals.setModal('mSocio', 'Ver proveedor', 3, send, true)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}/uno/${item.id}`)
            this.useAuth.setLoading(false)
            if (res.code != 0) return
            const send = {
                item: res.data,
            }
            this.useModals.setModal('mSocio', 'Editar proveedor', 2, send, true)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return
            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.socios, item)
            this.useAuth.setLoading(false)
            if (res.code == 0) this.useVistas.removeItem('vProveedores', 'socios', item)
        },

        // --- Acciones Masivas ---
        async eliminarBulk() {
            const selected = this.vista.socios.filter((a) => a.selected)
            const ids = selected.map((b) => b.id)
            const resQst = await jqst(`¿Está seguro de eliminar ${ids.length} registros?`)
            if (resQst.isConfirmed == false) return
            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(`${urls.socios}/bulk`, { id: 'bulk', ids })
            this.useAuth.setLoading(false)
            if (res.code == 0) this.vista.socios = this.vista.socios.filter((a) => !a.selected)
        },
        async editarBulk() {
            await this.loadDatosSistema()
            const cols = this.columns
            for (const a of cols) {
                if (a.id == 'doc_tipo') a.lista = this.vista.documentos_identidad
                if (a.id == 'activo') a.lista = this.vista.estados
            }
            const ids = this.vista.socios.filter((a) => a.selected).map((b) => b.id)
            const send = { uri: 'socios', nuevo: {}, cols, ids }
            this.useModals.setModal('mEditar', `Editar ${ids.length} registros`, null, send, true)
        },
        updatedBulk(item) {
            for (const a of this.vista.socios) {
                if (!item.ids.includes(a.id)) continue
                a.selected = false
                a[item.prop] = item.val
                if (item.val1) a[`${item.prop}1`] = item.val1
            }
        },

        // --- Otros ---
        async openConfigFiltros() {
            await this.loadDatosSistema()
            const cols = this.columns
            for (const a of cols) {
                if (a.id == 'doc_tipo') a.lista = this.vista.documentos_identidad
                if (a.id == 'activo') a.lista = this.vista.estados
            }
            const send = { table: this.tableName, cols, reload: this.loadSocios }
            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },
    },
}
</script>
