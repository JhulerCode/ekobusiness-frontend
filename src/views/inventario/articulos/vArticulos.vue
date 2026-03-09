<template>
    <div class="vista vista-fill">
        <div class="head">
            <div class="head-left" style="flex-wrap: nowrap">
                <strong style="white-space: nowrap">Artículos</strong>

                <JdButtonsOverflow :buttons="headerActions" @runMethod="runMethod" />

                <input
                    ref="excel"
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    hidden
                    @change="importar"
                />
            </div>

            <div class="head-center">
                <JdBulkActions
                    v-if="cantidadSeleccionados > 0"
                    :view="vista"
                    dataKey="articulos"
                    :tableBulkActions="tableBulkActions"
                    @bulkActionSelected="runMethod"
                />

                <JdBuscador
                    v-else
                    :view="vista"
                    :columns="tableColumns"
                    :tableName="tableName"
                    @open-filters="openConfigFiltros"
                    @reload="loadArticulos"
                />
            </div>

            <div class="head-right">
                <JdPaginacion :view="vista" @reload="loadArticulos" />

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
            :datos="vista.articulos || []"
            :colAct="true"
            :rowOptions="tableRowActions"
            @rowOptionSelected="runMethod"
            :rowSelectable="true"
            :tableBulkActions="tableBulkActions"
            @bulkActionSelected="runMethod"
            ref="jdtable"
            :reload="loadArticulos"
        />
    </div>

    <!-- Modales -->
    <mImportarArticulos v-if="useModals.show.mImportarArticulos" />
    <mArticulo v-if="useModals.show.mArticulo" />
    <mKardex v-if="useModals.show.mKardex" />
    <mLotes v-if="useModals.show.mLotes" />
    <mAjusteStock v-if="useModals.show.mAjusteStock" />
    <mUploadFiles v-if="useModals.show.mUploadFiles" />
    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
    <mEditar v-if="useModals.show.mEditar" @updated="updatedBulk" />
</template>

<script>
// Componentes base y utilidades
import { JdButton, mConfigFiltros, mConfigCols, mEditar } from '@jhuler/components'
import JdButtonsOverflow from '@/components/JdButtonsOverflow.vue'
import JdBuscador from '@/components/JdBuscador.vue'
import JdBulkActions from '@/components/JdBulkActions.vue'
import JdPaginacion from '@/components/JdPaginacion.vue'
import JdTable from '@/components/JdTable/JdTable.vue'

// Configuración de la vista
import {
    HEADER_ACTIONS,
    TABLE_COLUMNS,
    TABLE_BULK_ACTIONS,
    TABLE_ROW_ACTIONS,
} from './articulos.config.js'

// Modales específicos
import mImportarArticulos from '@/views/inventario/articulos/mImportarArticulos.vue'
import mArticulo from '@/views/inventario/articulos/mArticulo.vue'
import mKardex from '@/views/inventario/articulos/mKardex.vue'
import mLotes from '@/views/inventario/articulos/mLotes.vue'
import mAjusteStock from '@/views/inventario/articulos/mAjusteStock.vue'
import mUploadFiles from '@/components/mUploadFiles.vue'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get, delet } from '@/utils/crud'
import { tryOficialExcel } from '@/utils/mine'
import { jqst, jmsg } from '@/utils/swal'
import dayjs from 'dayjs'

export default {
    name: 'vArticulos',
    components: {
        JdButton,
        JdBulkActions,
        JdBuscador,
        JdTable,
        JdPaginacion,
        JdButtonsOverflow,
        mConfigCols,
        mConfigFiltros,
        mEditar,
        mImportarArticulos,
        mArticulo,
        mKardex,
        mLotes,
        mAjusteStock,
        mUploadFiles,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},
        tableName: 'articulos',

        // Configuraciones traídas de articulos.config.js
        headerActions: HEADER_ACTIONS,
        tableColumns: JSON.parse(JSON.stringify(TABLE_COLUMNS)),
        tableBulkActions: TABLE_BULK_ACTIONS,
        tableRowActions: TABLE_ROW_ACTIONS,
    }),
    computed: {
        cantidadSeleccionados() {
            return (this.vista.articulos || []).filter((a) => a.selected).length
        },
    },
    async created() {
        this.vista = this.useVistas.vArticulos
        this.useAuth.setColumns(this.tableName, this.tableColumns)

        if (this.vista.loaded) return
        this.vista.table_page = 1
        if (this.useAuth.verifyPermiso('vArticulos:listar')) this.loadArticulos()
    },
    methods: {
        // --- Gestión de Tabla ---
        runMethod(method, item) {
            this[method](item)
        },
        abrirExcel() {
            this.$refs.excel.click()
        },

        // --- Carga de Datos ---
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['categoria1'],
                sqls: [],
                ordr: [['nombre', 'ASC']],
                page: this.vista.table_page,
            }
            this.useAuth.updateQuery(this.tableColumns, this.vista.qry)
            this.vista.qry.cols.push('fotos')
            if (this.tableColumns[3].show == true) {
                this.vista.qry.sqls.push('articulo_stock')
            }
        },
        async loadArticulos() {
            this.setQuery()
            this.vista.articulos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true
            if (res.code != 0) return
            this.vista.articulos = res.data
            this.vista.table_meta = res.meta
        },

        // --- Datos de Apoyo ---
        async loadLineas() {
            const qry = { fltr: {}, cols: ['nombre'], ordr: [['nombre', 'ASC']] }
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_lineas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            if (res.code != 0) return
            return (this.vista.articulo_lineas = res.data)
        },
        async loadCategorias() {
            const qry = {
                cols: ['nombre'],
                fltr: { activo: { op: 'Es', val: true } },
                ordr: [['nombre', 'ASC']],
            }
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_categorias}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            if (res.code != 0) return
            return (this.vista.articulo_categorias = res.data)
        },
        async loadDatosSistema() {
            const qry = ['igv_afectaciones', 'unidades', 'estados', 'articulo_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)
            if (res.code == 0) Object.assign(this.vista, res.data)
        },

        // --- Acciones de Registro ---
        nuevo() {
            const send = {
                articulo: {
                    type: 'consumable',
                    activo: true,
                    articulo_suppliers: [],
                    combo_componentes: [],
                    ingredientes: [],
                    beneficios: [],
                    tipo: 1,
                    igv_afectacion: 10,
                    has_fv: false,
                },
                pestana: 1,
            }
            this.useModals.setModal('mArticulo', 'Nuevo artículo', 1, send, true)
        },
        async editar(item) {
            const qry = {
                incl: ['categoria1', 'linea1', 'articulo_suppliers', 'combo_componentes'],
            }
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulos}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            if (res.code != 0) return
            const send = {
                articulo: { ...res.data },
                pestana: 1,
                articulo_categorias: [{ ...res.data.categoria1 }],
                articulo_lineas: [{ ...res.data.linea1 }],
            }
            this.useModals.setModal('mArticulo', 'Editar artículo', 2, send, true)
        },
        async clonar(item) {
            const qry = {
                incl: ['categoria1', 'linea1', 'articulo_suppliers', 'combo_componentes'],
            }
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulos}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            if (res.code != 0) return
            const send = {
                articulo: { ...res.data, id: null },
                pestana: 1,
                articulo_categorias: [{ ...res.data.categoria1 }],
                articulo_lineas: [{ ...res.data.linea1 }],
            }
            this.useModals.setModal('mArticulo', 'Nuevo artículo', 1, send, true)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return
            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.articulos, item)
            this.useAuth.setLoading(false)
            if (res.code == 0) this.useVistas.removeItem('vArticulos', 'articulos', item)
        },
        async verKardex(item) {
            const send = { articulo: { id: item.id, nombre: item.nombre, unidad: item.unidad } }
            this.useModals.setModal('mKardex', 'Kardex de artículo', null, send, true)
        },
        verLotes(item) {
            const send = { articulo: { id: item.id, nombre: item.nombre, unidad: item.unidad } }
            this.useModals.setModal('mLotes', 'Lotes del artículo', null, send, true)
        },
        async ajusteStock(item) {
            const send = {
                transaccion: { fecha: dayjs().format('YYYY-MM-DD'), articulo: item.id },
                articulo1: { igv_afectacion: item.igv_afectacion, has_fv: item.has_fv },
                articulos: [{ id: item.id, nombre: item.nombre }],
                articulo_tipo: 1,
                is_nuevo_lote: false,
            }
            this.useModals.setModal('mAjusteStock', 'Ajuste de stock', null, send, true)
        },
        openUploadFiles(item) {
            const send = {
                item: { id: item.id, nombre: item.nombre, archivos: item.fotos || [] },
                accept: 'image/*',
                cantidad: 10,
                url: `${urls.articulos}/fotos`,
                vista: 'vArticulos',
                tabla: 'articulos',
                prop: 'fotos',
            }
            this.useModals.setModal('mUploadFiles', 'Actualizar fotos', 2, send, true)
        },

        // --- Acciones Masivas ---
        async eliminarBulk() {
            const selected = this.vista.articulos.filter((a) => a.selected)
            const ids = selected.map((b) => b.id)
            const resQst = await jqst(`¿Está seguro de eliminar ${ids.length} registros?`)
            if (resQst.isConfirmed == false) return
            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(`${urls.articulos}/bulk`, { id: 'bulk', ids })
            this.useAuth.setLoading(false)
            if (res.code == 0)
                this.vista.articulos = this.vista.articulos.filter((a) => !a.selected)
        },
        async editarBulk() {
            await this.loadDatosSistema()
            const cols = this.tableColumns
            for (const a of cols) {
                if (a.id == 'unidad') a.lista = this.vista.unidades
                if (
                    [
                        'has_fv',
                        'activo',
                        'is_ecommerce',
                        'purchase_ok',
                        'sale_ok',
                        'produce_ok',
                    ].includes(a.id)
                )
                    a.lista = this.vista.estados
                if (a.id == 'igv_afectacion') a.lista = this.vista.igv_afectaciones
                if (a.id == 'categoria') a.reload = this.loadCategorias
            }
            const ids = this.vista.articulos.filter((a) => a.selected).map((b) => b.id)
            const send = { uri: 'articulos', nuevo: {}, cols, ids }
            this.useModals.setModal('mEditar', `Editar ${ids.length} registros`, null, send, true)
        },
        updatedBulk(item) {
            for (const a of this.vista.articulos) {
                if (!item.ids.includes(a.id)) continue
                a.selected = false
                a[item.prop] = item.val
                if (item.val1) a[`${item.prop}1`] = item.val1
            }
        },

        // --- Otros ---
        async openConfigFiltros() {
            await this.loadDatosSistema()
            const cols = this.tableColumns
            for (const a of cols) {
                if (a.id == 'unidad') a.lista = this.vista.unidades
                if (
                    [
                        'has_fv',
                        'activo',
                        'is_ecommerce',
                        'purchase_ok',
                        'sale_ok',
                        'produce_ok',
                    ].includes(a.id)
                )
                    a.lista = this.vista.estados
                if (a.id == 'igv_afectacion') a.lista = this.vista.igv_afectaciones
                if (a.id == 'categoria') a.reload = this.loadCategorias
                if (a.id == 'linea') a.reload = this.loadLineas
            }
            const send = { table: this.tableName, cols, reload: this.loadArticulos }
            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },
        async importar(event) {
            this.useAuth.setLoading(true, 'Cargando archivo...')
            const file = event.target.files[0]
            const reader = new FileReader()
            reader.onload = async () => {
                const headers = [
                    'Nombre',
                    'EAN',
                    'Tipo',
                    'Se compra',
                    'Se vende',
                    'Tributo',
                    'Unidad',
                    'Categoria',
                    'Marca',
                    'Tiene fv',
                ]
                const res = await tryOficialExcel(this.$refs.excel, file, reader, headers)
                if (res.code != 0) {
                    this.useAuth.setLoading(false)
                    return jmsg('error', res.msg)
                }
                await this.loadDatosSistema()
                const articulo_tiposMap = this.vista.articulo_tipos.reduce(
                    (obj, a) => ((obj[a.nombre] = a), obj),
                    {},
                )
                const igv_afectacionesMap = this.vista.igv_afectaciones.reduce(
                    (obj, a) => ((obj[a.id] = a), obj),
                    {},
                )
                await this.loadCategorias()
                const categoriasMap = this.vista.articulo_categorias.reduce(
                    (obj, a) => ((obj[a.nombre] = a), obj),
                    {},
                )

                for (const a of res.data) {
                    a.id = a.ID
                    a.nombre = a.Nombre
                    a.codigo_barra = a.EAN
                    a.type1 = articulo_tiposMap[a.Tipo]
                    a.type = a.type1.id
                    a.purchase_ok = a['Se compra'] == 'Sí'
                    a.sale_ok = a['Se vende'] == 'Sí'
                    a.igv_afectacion1 = igv_afectacionesMap[a.Tributo]
                    a.igv_afectacion = a.igv_afectacion1?.id
                    a.unidad = a.Unidad
                    a.categoria1 = categoriasMap[a.Categoria]
                    a.categoria = a.categoria1?.id
                    a.marca = a.Marca
                    a.has_fv = a['Tiene fv'] == 'Sí'
                }
                this.useAuth.setLoading(false)
                this.useModals.setModal(
                    'mImportarArticulos',
                    'Importar artículos',
                    null,
                    { articulos: res.data },
                    true,
                )
            }
            reader.readAsArrayBuffer(file)
        },
    },
}
</script>
