<template>
    <VistaLayout :vista="vista">
        <template #header-left>
            <input ref="excel" type="file" accept=".xlsx, .xls, .csv" hidden @change="importar" />
        </template>

        <JdTable
            :name="vista.name"
            :columns="vista.tableColumns"
            :datos="vista.tableData || []"
            :rowSelectable="true"
            :rowOptions="vista.tableRowActions"
            @rowOptionSelected="vista.runMethod"
        />
    </VistaLayout>

    <!-- Modales -->
    <mImportarArticulos v-if="modals.show.mImportarArticulos" />
    <mArticulo v-if="modals.show.mArticulo" />
    <mKardex v-if="modals.show.mKardex" />
    <mLotes v-if="modals.show.mLotes" />
    <mAjusteStock v-if="modals.show.mAjusteStock" />
    <mUploadFiles v-if="modals.show.mUploadFiles" />
</template>

<script>
// Modales específicos
import mImportarArticulos from '@/views/inventario/articulos/mImportarArticulos.vue'
import mArticulo from '@/views/inventario/articulos/mArticulo.vue'
import mKardex from '@/views/inventario/articulos/mKardex.vue'
import mLotes from '@/views/inventario/articulos/mLotes.vue'
import mAjusteStock from '@/views/inventario/articulos/mAjusteStock.vue'
import mUploadFiles from '@/components/mUploadFiles.vue'

// Configuración de la vista
import VIEW_CONFIG from './articulos.config.js'

// Pinia y Utils
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'
import { tryOficialExcel } from '@/utils/mine'
import { jmsg } from '@/utils/swal'
import dayjs from 'dayjs'

export default {
    name: 'vArticulos',
    components: {
        mImportarArticulos,
        mArticulo,
        mKardex,
        mLotes,
        mAjusteStock,
        mUploadFiles,
    },
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        modals: () => useModals(),
        vista() {
            return this.vistas[VIEW_CONFIG.name]
        },
    },
    created() {
        // 1. Inicialización de la vista
        this.vistas.initVista(VIEW_CONFIG.name, {
            ...JSON.parse(JSON.stringify(VIEW_CONFIG)),
            apiUrl: urls[VIEW_CONFIG.apiPath],
            runMethod: this.runMethod,
        })
        this.auth.setColumns(this.vista.name, this.vista.tableColumns)

        // 2. Carga inicial
        if (!this.vista.loaded && this.auth.verifyPermiso(`${VIEW_CONFIG.name}:listar`)) {
            this.vista.loadTableData()
        }
    },
    unmounted() {
        if (this.vista) this.vista.runMethod = null
    },
    methods: {
        runMethod(method, item) {
            this.vistas.runMethod(this, method, item)
        },
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['linea1', 'categoria1'],
                sqls: [],
                ordr: [['nombre', 'ASC']],
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
            this.vista.qry.cols.push('fotos')
            if (this.vista.tableColumns[3].show == true) {
                this.vista.qry.sqls.push('articulo_stock')
            }
        },

        // Header actions
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
            this.modals.setModal('mArticulo', 'Nuevo artículo', 1, send, true)
        },
        abrirExcel() {
            this.$refs.excel.click()
        },

        // Table row actions
        async editar(item) {
            const qry = {
                incl: ['categoria1', 'linea1', 'articulo_suppliers', 'combo_componentes'],
            }

            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res.code != 0) return
            const send = {
                articulo: { ...res.data },
                pestana: 1,
                articulo_categorias: [{ ...res.data.categoria1 }],
                articulo_lineas: [{ ...res.data.linea1 }],
            }
            this.modals.setModal('mArticulo', 'Editar artículo', 2, send, true)
        },
        async clonar(item) {
            const qry = {
                incl: ['categoria1', 'linea1', 'articulo_suppliers', 'combo_componentes'],
            }
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${this.vista.apiUrl}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.auth.setLoading(false)
            if (res.code != 0) return
            const send = {
                articulo: { ...res.data, id: null },
                pestana: 1,
                articulo_categorias: [{ ...res.data.categoria1 }],
                articulo_lineas: [{ ...res.data.linea1 }],
            }
            this.modals.setModal('mArticulo', 'Nuevo artículo', 1, send, true)
        },
        verKardex(item) {
            const send = { articulo: { id: item.id, nombre: item.nombre, unidad: item.unidad } }
            this.modals.setModal('mKardex', 'Kardex de artículo', null, send, true)
        },
        verLotes(item) {
            const send = { articulo: { id: item.id, nombre: item.nombre, unidad: item.unidad } }
            this.modals.setModal('mLotes', 'Lotes del artículo', null, send, true)
        },
        ajusteStock(item) {
            const send = {
                transaccion: { fecha: dayjs().format('YYYY-MM-DD'), articulo: item.id },
                articulo1: { igv_afectacion: item.igv_afectacion, has_fv: item.has_fv },
                articulos: [{ id: item.id, nombre: item.nombre }],
                articulo_tipo: 1,
                is_nuevo_lote: false,
            }
            this.modals.setModal('mAjusteStock', 'Ajuste de stock', null, send, true)
        },
        openUploadFiles(item) {
            const send = {
                item: { id: item.id, nombre: item.nombre, archivos: item.fotos || [] },
                accept: 'image/*',
                cantidad: 10,
                url: `${this.vista.apiUrl}/fotos`,
                vista: this.vista.name,
                tabla: 'tableData',
                prop: 'fotos',
            }
            this.modals.setModal('mUploadFiles', 'Actualizar fotos', 2, send, true)
        },

        // @actions
        async importar(event) {
            this.auth.setLoading(true, 'Cargando archivo...')
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
                    this.auth.setLoading(false)
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
                    a.type = a.type1?.id
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
                this.auth.setLoading(false)
                this.modals.setModal(
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
