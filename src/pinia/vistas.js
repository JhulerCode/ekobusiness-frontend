import { defineStore } from 'pinia'
import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { urls, get, delet } from '@/utils/crud'
import { downloadExcel } from '@/utils/mine'
import { jmsg, jqst } from '@/utils/swal'

export const useVistas = defineStore('vistas', {
    actions: {
        initVars() {
            for (const key of Object.keys(this.$state)) {
                delete this.$state[key]
            }
        },

        // --- Inicializa o "hidrata" una vista con su configuración ---
        initVista(name, config = {}, type = 'list') {
            if (this[name] === undefined) {
                if (type === 'list') {
                    this[name] = {
                        tableData: [],
                        table_meta: { total: 0 },
                        table_page: 1,
                        loaded: false,
                        qry: {},
                        type,
                    }
                } else if (type === 'detail') {
                    this[name] = {
                        data: {},
                        loaded: false,
                        mode: 'view',
                        type,
                    }
                }
            }

            // Fusionamos la configuración (columnas, acciones, etc.)
            Object.assign(this[name], config)

            this[name].loadTableData = (init_page) => this.loadTableData(name, init_page)
            this[name].downloadActualTablePage = () => this.downloadActualTablePage(name)
            this[name].openConfigCols = () => this.openConfigCols(name)
            this[name].openConfigFiltros = () => this.openConfigFiltros(name)

            this[name].editarBulk = () => this.editarBulk(name)
            this[name].updatedBulk = (item) => this.updatedBulk(name, item)
            this[name].eliminarBulk = () => this.eliminarBulk(name)

            this[name].eliminar = (item) => this.eliminar(name, item)

            this[name].addItem = (item, where) => this.addItem(name, 'tableData', item, where)
            this[name].removeItem = (item) => this.removeItem(name, 'tableData', item)
            this[name].updateItem = (item, partial = false) => this.updateItem(name, 'tableData', item, partial)
        },
        runMethod(context, method, item) {
            const parts = method.split('.')

            for (let i = 0; i < parts.length; i++) {
                context = context[parts[i]]
                if (!context) break
            }

            if (typeof context === 'function') {
                context(item)
            } else {
                console.error(`Método no encontrado: ${method}`)
            }
        },

        // --- Acciones de Cerebro Centralizadas ---
        async loadTableData(name, init_page) {
            const auth = useAuth()
            const vista = this[name]
            if (init_page) vista.table_page = 1

            vista.runMethod('setQuery')

            vista.tableData = []
            auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls[vista.apiPath]}?qry=${JSON.stringify(vista.qry)}`)
            auth.setLoading(false)

            vista.loaded = true
            if (res.code === 0) {
                vista.tableData = res.data
                vista.table_meta = res.meta
            }
            return res
        },
        downloadActualTablePage(name) {
            const vista = this[name]
            downloadExcel(
                vista.tableColumns.filter((a) => a.show),
                vista.tableData || [],
            )
        },
        openConfigCols(name) {
            const modals = useModals()
            const vista = this[name]
            const send = {
                table: vista.name,
                cols: vista.tableColumns,
                reload: vista.loadTableData,
            }
            modals.setModal('mConfigCols', 'Configurar columnas', null, send, true)
        },
        openConfigFiltros(name) {
            const modals = useModals()
            const vista = this[name]
            const send = {
                table: vista.name,
                cols: vista.tableColumns,
                reload: vista.loadTableData,
            }
            modals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        // --- Table bulk actions ---
        async editarBulk(name) {
            const modals = useModals()
            const vista = this[name]

            const selected = vista.tableData.filter((a) => a.selected)
            if (selected.length == 0) return jmsg('warning', 'Seleccione al menos un artículo')

            const ids = selected.map((b) => b.id)
            const send = {
                uri: vista.apiPath,
                nuevo: { prop: null, val: null },
                cols: vista.tableColumns,
                ids: ids,
            }
            modals.setModal('mEditar', `Editar ${ids.length} registros`, null, send, true)
        },
        updatedBulk(name, item) {
            const vista = this[name]

            for (const a of vista.tableData) {
                if (!item.ids.includes(a.id)) continue
                a.selected = false
                a[item.prop] = item.val
                if (item.val1) a[`${item.prop}1`] = item.val1
            }
        },
        async eliminarBulk(name) {
            const auth = useAuth()
            const vista = this[name]
            const selected = vista.tableData.filter((a) => a.selected)
            const ids = selected.map((b) => b.id)

            const resQst = await jqst(`¿Está seguro de eliminar ${ids.length} registros?`)
            if (resQst.isConfirmed == false) return

            auth.setLoading(true, 'Eliminando...')
            const res = await delet(`${urls[vista.apiPath]}/bulk`, { id: 'bulk', ids })
            auth.setLoading(false)

            if (res.code == 0) {
                vista.tableData = vista.tableData.filter((a) => !a.selected)
            }
        },

        // --- Table row actions ---
        async eliminar(name, item) {
            const auth = useAuth()
            const vista = this[name]

            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            auth.setLoading(true, 'Eliminando...')
            const res = await delet(vista.apiUrl, item)
            auth.setLoading(false)

            if (res.code == 0) vista.removeItem(item)
        },

        // --- Gestión de Items ---
        addItem(goto, array, item, where = 'last') {
            const tableData = this[goto]?.[array] || this[goto]?.tableData
            if (!tableData) return
            where == 'last' ? tableData.push(item) : tableData.unshift(item)
        },
        removeItem(goto, array, item) {
            const tableData = this[goto]?.[array] || this[goto]?.tableData
            if (!tableData) return
            const i = tableData.findIndex((a) => a.id == item.id)
            if (i !== -1) tableData.splice(i, 1)
        },
        updateItem(goto, array, item, partial = false) {
            const tableData = this[goto]?.[array] || this[goto]?.tableData
            if (!tableData) return
            const i = tableData.findIndex((a) => a.id == item.id)
            if (i !== -1) {
                if (partial) {
                    Object.assign(tableData[i], item)
                } else {
                    tableData.splice(i, 1, item)
                }
            }
        },
    },
})
