<template>
    <VistaLayout
        :config="VIEW_CONFIG"
        :setQuery="setQuery"
        :rowSelectable="true"
        @runMethod="runMethod"
    >
        <template #header-left>
            <input ref="excel" type="file" accept=".xlsx, .xls, .csv" hidden @change="importar" />
        </template>
    </VistaLayout>

    <mImportarArticulos v-if="modals?.show?.mImportarArticulos" />
    <mLotes v-if="modals?.show?.mLotes" />
</template>

<script>
import mImportarArticulos from './mImportarArticulos.vue'
import mLotes from './mLotes.vue'

import VIEW_CONFIG from './articulos.config.js'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { useSystem } from '@/pinia/system'
// import { get } from '@/utils/crud'
import { tryOficialExcel } from '@/utils/mine'
import { jmsg } from '@/utils/swal'
// import dayjs from 'dayjs'

export default {
    components: {
        mImportarArticulos,
        mLotes,
    },
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        modals: () => useModals(),
        useSystem: () => useSystem(),
        vista() {
            return this.vistas[this.$route.name]
        },
    },
    data: () => ({
        VIEW_CONFIG,
    }),
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        setQuery() {
            if (!this.vista) return
            this.vista.qry = {
                fltr: {},
                incl: ['linea1', 'categoria1'],
                sqls: [],
                ordr: [['nombre', 'ASC']],
                page: this.vista.table_page,
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
            // this.vista.qry.cols.push('fotos')
            const col_articulo_stock = this.vista.tableColumns.find((c) => c.id == 'articulo_stock')
            if (col_articulo_stock.show == true) this.vista.qry.sqls.push('articulo_stock')

            const col_stock_nivel = this.vista.tableColumns.find((c) => c.id == 'stock_nivel')
            if (col_stock_nivel.show == true) {
                this.vista.qry.sqls.push('articulo_stock')
                this.vista.qry.cols.push('stock_minimo', 'stock_nivel')
            }
        },

        //--- Header actions ---//
        nuevo() {
            this.$router.push({
                name: this.vista.detailViewName,
                params: { [this.vista.detailPath]: 'nuevo' },
            })
        },
        abrirExcel() {
            this.$refs.excel.click()
        },

        //--- Row actions ---//
        verKardex(item) {
            if (!this.vistas.vArticulo) this.vistas.initVista('vArticulo', 'detail')
            this.vistas.vArticulo.titleKey = 'nombre'
            this.vistas.vArticulo.data = { id: item.id, nombre: item.nombre }
            this.$router.push(`/consola/inventario/articulos/${item.id}/kardex`)
        },
        verLotes(item) {
            const send = { articulo: { id: item.id, nombre: item.nombre, unidad: item.unidad } }
            this.modals.setModal('mLotes', 'Lotes del artículo', null, send, true)
        },

        // --- @actions ---
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

                await this.useSystem.load(['articulo_tipos', 'igv_afectaciones'])

                const articulo_tiposMap = this.useSystem.data.articulo_tipos.reduce(
                    (obj, a) => ((obj[a.nombre] = a), obj),
                    {},
                )
                const igv_afectacionesMap = this.useSystem.data.igv_afectaciones.reduce(
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
