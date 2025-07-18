import { defineStore } from "pinia"
import { urls, get, post } from '@/utils/crud.js'
import { deepCopy } from '@/utils/mine'
import { useVistas } from '@/pinia/vistas.js'
import { useModals } from '@/pinia/modals.js'

export const useAuth = defineStore('auth', {
    state: () => ({
        token: null,
        usuario: {},

        menu: [
            {
                label: 'Logística de entrada', icon: 'fa-solid fa-cart-shopping', children: [
                    { label: 'Proveedores', goto: 'vProveedores' },
                    { label: 'Categorías de artículos', goto: 'vArticuloCategorias' },
                    { label: 'Artículos', goto: 'vArticulos' },
                    { label: 'Listas de precios', goto: 'vPrecioListas' },
                    { label: 'Pedidos de compra', goto: 'vCompraPedidos' },
                    { label: 'Compras', goto: 'vCompras' },
                    { label: 'Compras detalle', goto: 'vCompraItems' },
                ]
            },
            {
                label: 'Logística de salida', icon: 'fa-solid fa-truck', children: [
                    { label: 'Clientes', goto: 'vClientes' },
                    { label: 'Categorías de productos', goto: 'vProductoCategorias' },
                    { label: 'Productos terminados', goto: 'vProductosTerminados' },
                    { label: 'Ingreso de productos', goto: 'vPtsIngresos' },
                    { label: 'Pedidos de venta', goto: 'vVentaPedidos' },
                    { label: 'Ventas', goto: 'vVentas' },
                    { label: 'Inventario', goto: 'vInventarioProductos' },
                ]
            },
            {
                label: 'Producción', icon: 'fa-solid fa-oil-well', children: [
                    { label: 'Programa filtrantes', goto: 'vProgramaFiltrantes' },
                    { label: 'Programa granel', goto: 'vProgramaGranel' },
                    { label: 'Programa luxury', goto: 'vProgramaLuxury' },
                    { label: 'Órdenes de producción', goto: 'vProduccionHistorial' },
                    { label: 'Productos en cuarentena', goto: 'vProductosCuarentena' },
                ]
            },
            {
                label: 'Calidad', icon: 'fa-solid fa-magnifying-glass', children: [
                    { label: 'Formatos BPM', goto: 'vFormatosBpm' },
                    { label: 'Formatos PHS', goto: 'vFormatosPhs' },
                    { label: 'Formatos HACCP', goto: 'vFormatosHaccp' },
                    { label: 'Registros sanitarios', goto: 'vRegistrosSanitarios' },
                    { label: 'Inspecciones de clientes', goto: 'vInspecciones' },
                ]
            },
            {
                label: 'Operaciones', icon: 'fa-solid fa-gears', children: [
                    { label: 'Documentos clave', goto: 'vDocumentos' },
                    { label: 'Caja chica', goto: 'vCajaAperturas' },
                    { label: 'Monedas', goto: 'vMonedas' },
                    { label: 'Máquinas', goto: 'vMaquinas' },
                    { label: 'Equipos', goto: 'vEquipos' },
                    { label: 'Colaboradores', goto: 'vColaboradores' },
                    { label: 'Usuarios conectados', goto: 'vSessions' },
                    { label: 'Activity logs', goto: 'vActivityLogs' },
                ]
            }
        ],
        listaPermisos: [
            {
                id: 'logistica_entrada', label: 'Logistica de entrada', vistas: [
                    {
                        id: 'vProveedores', label: 'Proveedores', permisos: [
                            { id: 'vProveedores:listar', label: 'Listar' },
                            { id: 'vProveedores:crear', label: 'Crear' },
                            { id: 'vProveedores:ver', label: 'Ver' },
                            { id: 'vProveedores:editar', label: 'Editar' },
                            { id: 'vProveedores:eliminar', label: 'Eliminar' },

                            { id: 'vProveedores:editarBulk', label: 'Editar masivo' },
                            { id: 'vProveedores:eliminarBulk', label: 'Eliminar masivo' },
                        ]
                    },
                    {
                        id: 'vArticuloCategorias', label: 'Categorías de artículos', permisos: [
                            { id: 'vArticuloCategorias:listar', label: 'Listar' },
                            { id: 'vArticuloCategorias:crear', label: 'Crear' },
                            { id: 'vArticuloCategorias:editar', label: 'Editar' },
                            { id: 'vArticuloCategorias:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vArticulos', label: 'Artículos', permisos: [
                            { id: 'vArticulos:listar', label: 'Listar' },
                            { id: 'vArticulos:crear', label: 'Crear' },
                            { id: 'vArticulos:editar', label: 'Editar' },
                            { id: 'vArticulos:eliminar', label: 'Eliminar' },

                            { id: 'vArticulos:clonar', label: 'Clonar' },
                            { id: 'vArticulos:kardex', label: 'Ver kardex' },
                            { id: 'vArticulos:ajusteStock', label: 'Ajuste stock' },

                            { id: 'vArticulos:importar', label: 'Importar' },
                            { id: 'vArticulos:editarBulk', label: 'Editar masivo' },
                            { id: 'vArticulos:eliminarBulk', label: 'Eliminar masivo' },
                        ]
                    },
                    {
                        id: 'vPrecioListas', label: 'Listas de precios', permisos: [
                            { id: 'vPrecioListas:listar', label: 'Listar' },
                            { id: 'vPrecioListas:crear', label: 'Crear' },
                            { id: 'vPrecioListas:editar', label: 'Editar' },
                            { id: 'vPrecioListas:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vPrecioListaItems', label: 'Items de lista de precios', permisos: [
                            { id: 'vPrecioListaItems:listar', label: 'Listar' },
                            { id: 'vPrecioListaItems:crear', label: 'Crear' },
                            { id: 'vPrecioListaItems:editar', label: 'Editar' },
                            { id: 'vPrecioListaItems:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vCompraPedidos', label: 'Pedidos de compra', permisos: [
                            { id: 'vCompraPedidos:listar', label: 'Listar' },
                            { id: 'vCompraPedidos:crear', label: 'Crear' },
                            { id: 'vCompraPedidos:ver', label: 'Ver' },
                            { id: 'vCompraPedidos:editar', label: 'Editar' },

                            { id: 'vCompraPedidos:anular', label: 'Anular' },
                            { id: 'vCompraPedidos:generarPdf', label: 'Generar PDF' },
                            { id: 'vCompraPedidos:ingresarMercaderia', label: 'Ingresar mercadería' },
                        ]
                    },
                    {
                        id: 'vCompras', label: 'Compras', permisos: [
                            { id: 'vCompras:listar', label: 'Listar' },
                            { id: 'vCompras:crear', label: 'Crear' },
                            { id: 'vCompras:ver', label: 'Ver' },

                            { id: 'vCompras:anular', label: 'Anular' },
                        ]
                    },
                    {
                        id: 'vCompraItems', label: 'Compra detalle', permisos: [
                            { id: 'vCompraItems:listar', label: 'Listar' },
                            { id: 'vCompraItems:inspeccion', label: 'Inspeccionar' },
                        ]
                    }
                ]
            },
            {
                id: 'logistica_salida', label: 'Logistica de salida', vistas: [
                    {
                        id: 'vClientes', label: 'Clientes', permisos: [
                            { id: 'vClientes:listar', label: 'Listar' },
                            { id: 'vClientes:crear', label: 'Crear' },
                            { id: 'vClientes:ver', label: 'Ver' },
                            { id: 'vClientes:editar', label: 'Editar' },
                            { id: 'vClientes:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vProductoCategorias', label: 'Categorías de productos', permisos: [
                            { id: 'vProductoCategorias:listar', label: 'Listar' },
                            { id: 'vProductoCategorias:crear', label: 'Crear' },
                            { id: 'vProductoCategorias:editar', label: 'Editar' },
                            { id: 'vProductoCategorias:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vProductosTerminados', label: 'Productos', permisos: [
                            { id: 'vProductosTerminados:listar', label: 'Listar' },
                            { id: 'vProductosTerminados:crear', label: 'Crear' },
                            { id: 'vProductosTerminados:editar', label: 'Editar' },
                            { id: 'vProductosTerminados:eliminar', label: 'Eliminar' },

                            { id: 'vProductosTerminados:clonar', label: 'Clonar' },
                            { id: 'vProductosTerminados:kardex', label: 'Ver kardex' },
                            { id: 'vProductosTerminados:ajusteStock', label: 'Ajuste stock' },

                            { id: 'vProductosTerminados:crearCombo', label: 'Crear combo' },
                            { id: 'vProductosTerminados:importar', label: 'Importar' },
                            { id: 'vProductosTerminados:editarBulk', label: 'Editar masivo' },
                            { id: 'vProductosTerminados:eliminarBulk', label: 'Eliminar masivo' },
                        ]
                    },
                    {
                        id: 'vReceta', label: 'Receta', permisos: [
                            { id: 'vReceta:listar', label: 'Listar' },
                            { id: 'vReceta:crear', label: 'Crear' },
                            { id: 'vReceta:editar', label: 'Editar' },
                            { id: 'vReceta:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vPtsIngresos', label: 'Ingreso de productos', permisos: [
                            { id: 'vPtsIngresos:listar', label: 'Listar' },
                            { id: 'vPtsIngresos:verCuarentena', label: 'Ver cuarentena' },
                            { id: 'vPtsIngresos:ingresarPts', label: 'Ingresar productos terminados' },
                        ]
                    },
                    {
                        id: 'vVentaPedidos', label: 'Pedidos de venta', permisos: [
                            { id: 'vVentaPedidos:listar', label: 'Listar' },
                            { id: 'vVentaPedidos:crear', label: 'Crear' },
                            { id: 'vVentaPedidos:ver', label: 'Ver' },
                            { id: 'vVentaPedidos:editar', label: 'Editar' },

                            { id: 'vVentaPedidos:anular', label: 'Anular' },
                            { id: 'vVentaPedidos:entregarMercaderia', label: 'Entregar mercadería' },
                            { id: 'vVentaPedidos:verProductosPedidos', label: 'Ver productos pedidos' },
                        ]
                    },
                    {
                        id: 'vVentas', label: 'Ventas', permisos: [
                            { id: 'vVentas:listar', label: 'Listar' },
                            { id: 'vVentas:crear', label: 'Crear' },
                            { id: 'vVentas:ver', label: 'Ver' },
                            { id: 'vVentas:anular', label: 'Anular' },
                            { id: 'vVentas:controlDespacho', label: 'Control despacho' },
                        ]
                    },
                ]
            },
            {
                id: 'produccion', label: 'Producción', vistas: [
                    {
                        id: 'vProgramaFiltrantes', label: 'Programa de filtrantes', permisos: [
                            { id: 'vProgramaFiltrantes:listar', label: 'Listar' },
                            { id: 'vProgramaFiltrantes:crear', label: 'Crear' },
                            { id: 'vProgramaFiltrantes:ver', label: 'Ver' },
                            { id: 'vProgramaFiltrantes:editar', label: 'Editar' },
                            { id: 'vProgramaFiltrantes:eliminar', label: 'Eliminar' },

                            { id: 'vProgramaFiltrantes:salidaInsumos', label: 'Salida de insumos' },
                            { id: 'vProgramaFiltrantes:productosCuarentena', label: 'Productos en cuarentena' },
                            { id: 'vProgramaFiltrantes:verProductosPedidos', label: 'Ver productos pedidos' },
                        ]
                    },
                    {
                        id: 'vProgramaGranel', label: 'Programa de granel', permisos: [
                            { id: 'vProgramaGranel:listar', label: 'Listar' },
                            { id: 'vProgramaGranel:crear', label: 'Crear' },
                            { id: 'vProgramaGranel:ver', label: 'Ver' },
                            { id: 'vProgramaGranel:editar', label: 'Editar' },
                            { id: 'vProgramaGranel:eliminar', label: 'Eliminar' },

                            { id: 'vProgramaGranel:salidaInsumos', label: 'Salida de insumos' },
                            { id: 'vProgramaGranel:productosCuarentena', label: 'Productos en cuarentena' },
                            { id: 'vProgramaGranel:verProductosPedidos', label: 'Ver productos pedidos' },
                        ]
                    },
                    {
                        id: 'vProgramaLuxury', label: 'Programa de luxury', permisos: [
                            { id: 'vProgramaLuxury:listar', label: 'Listar' },
                            { id: 'vProgramaLuxury:crear', label: 'Crear' },
                            { id: 'vProgramaLuxury:ver', label: 'Ver' },
                            { id: 'vProgramaLuxury:editar', label: 'Editar' },
                            { id: 'vProgramaLuxury:eliminar', label: 'Eliminar' },

                            { id: 'vProgramaLuxury:salidaInsumos', label: 'Salida de insumos' },
                            { id: 'vProgramaLuxury:productosCuarentena', label: 'Productos en cuarentena' },
                            { id: 'vProgramaLuxury:verProductosPedidos', label: 'Ver productos pedidos' },
                        ]
                    },
                    {
                        id: 'vProduccionHistorial', label: 'Órdenes de producción', permisos: [
                            { id: 'vProduccionHistorial:listar', label: 'Listar' },
                            { id: 'vProduccionHistorial:ver', label: 'Ver' },

                            { id: 'vProduccionHistorial:salidaInsumos', label: 'Salida de insumos' },
                            { id: 'vProduccionHistorial:controlPesos', label: 'Control de pesos' },
                            { id: 'vProduccionHistorial:controlPpc', label: 'Control del PPC' },
                            { id: 'vProduccionHistorial:productosCuarentena', label: 'Productos en cuarentena' },
                            { id: 'vProduccionHistorial:productosTerminados', label: 'Productos terminados' },
                        ]
                    },
                    {
                        id: 'vProductosCuarentena', label: 'Productos en cuarentena', permisos: [
                            { id: 'vProductosCuarentena:listar', label: 'Listar' },
                            { id: 'vProductosCuarentena:crear', label: 'Crear' },
                            { id: 'vProductosCuarentena:editar', label: 'Editar' },
                            { id: 'vProductosCuarentena:eliminar', label: 'Eliminar' },
                            { id: 'vProductosCuarentena:liberar_lote', label: 'Liberar lote' },
                        ]
                    }
                ]
            },
            {
                id: 'calidad', label: 'Calidad', vistas: [
                    {
                        id: 'vFormatosBpm', label: 'Formatos BPM', permisos: [
                            { id: 'vFormatosBpm:listar', label: 'Listar' },
                            { id: 'vFormatosBpm:crear', label: 'Crear' },
                            { id: 'vFormatosBpm:ver', label: 'Ver' },
                            { id: 'vFormatosBpm:editar', label: 'Editar' },
                            { id: 'vFormatosBpm:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vFormatosPhs', label: 'Formatos PHS', permisos: [
                            { id: 'vFormatosPhs:listar', label: 'Listar' },
                            { id: 'vFormatosPhs:crear', label: 'Crear' },
                            { id: 'vFormatosPhs:ver', label: 'Ver' },
                            { id: 'vFormatosPhs:editar', label: 'Editar' },
                            { id: 'vFormatosPhs:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vFormatosHaccp', label: 'Formatos HACCP', permisos: [
                            { id: 'vFormatosHaccp:listar', label: 'Listar' },
                            { id: 'vFormatosHaccp:crear', label: 'Crear' },
                            { id: 'vFormatosHaccp:ver', label: 'Ver' },
                            { id: 'vFormatosHaccp:editar', label: 'Editar' },
                            { id: 'vFormatosHaccp:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vRegistrosSanitarios', label: 'Registros sanitarios', permisos: [
                            { id: 'vRegistrosSanitarios:listar', label: 'Listar' },
                            { id: 'vRegistrosSanitarios:crear', label: 'Crear' },
                            { id: 'vRegistrosSanitarios:editar', label: 'Editar' },
                            { id: 'vRegistrosSanitarios:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vInspecciones', label: 'Inspecciones', permisos: [
                            { id: 'vInspecciones:listar', label: 'Listar' },
                            { id: 'vInspecciones:crear', label: 'Crear' },
                            { id: 'vInspecciones:ver', label: 'Ver' },
                            { id: 'vInspecciones:editar', label: 'Editar' },
                            { id: 'vInspecciones:eliminar', label: 'Eliminar' },
                        ]
                    },
                ]
            },
            {
                id: 'operaciones', label: 'Operaciones', vistas: [
                    {
                        id: 'vDocumentos', label: 'Documentos', permisos: [
                            { id: 'vDocumentos:listar', label: 'Listar' },
                            { id: 'vDocumentos:crear', label: 'Crear' },
                            { id: 'vDocumentos:editar', label: 'Editar' },
                            { id: 'vDocumentos:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vCajaAperturas', label: 'Caja', permisos: [
                            { id: 'vCajaAperturas:listar', label: 'Listar' },
                            { id: 'vCajaAperturas:aperturarCaja', label: 'Aperturar caja' },
                            { id: 'vCajaAperturas:ver', label: 'Ver' },
                            { id: 'vCajaAperturas:cerrarCaja', label: 'Cerrar caja' },
                            { id: 'vCajaAperturas:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vCajaMovimientos', label: 'Movimientos de caja', permisos: [
                            { id: 'vCajaMovimientos:listar', label: 'Listar' },
                            { id: 'vCajaMovimientos:crear', label: 'Crear' },
                            { id: 'vCajaMovimientos:editar', label: 'Editar' },
                            { id: 'vCajaMovimientos:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vMonedas', label: 'Monedas', permisos: [
                            { id: 'vMonedas:listar', label: 'Listar' },
                            { id: 'vMonedas:crear', label: 'Crear' },
                            { id: 'vMonedas:editar', label: 'Editar' },
                            { id: 'vMonedas:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vTipoCambios', label: 'Tipos de cambio', permisos: [
                            { id: 'vTipoCambios:listar', label: 'Listar' },
                            { id: 'vTipoCambios:crear', label: 'Crear' },
                            { id: 'vTipoCambios:editar', label: 'Editar' },
                            { id: 'vTipoCambios:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vMaquinas', label: 'Máquinas', permisos: [
                            { id: 'vMaquinas:listar', label: 'Listar' },
                            { id: 'vMaquinas:crear', label: 'Crear' },
                            { id: 'vMaquinas:editar', label: 'Editar' },
                            { id: 'vMaquinas:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vEquipos', label: 'Equipos', permisos: [
                            { id: 'vEquipos:listar', label: 'Listar' },
                            { id: 'vEquipos:crear', label: 'Crear' },
                            { id: 'vEquipos:editar', label: 'Editar' },
                            { id: 'vEquipos:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vColaboradores', label: 'Colaboradores', permisos: [
                            { id: 'vColaboradores:listar', label: 'Listar' },
                            { id: 'vColaboradores:crear', label: 'Crear' },
                            { id: 'vColaboradores:ver', label: 'Ver' },
                            { id: 'vColaboradores:editar', label: 'Editar' },
                            { id: 'vColaboradores:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vSessions', label: 'Usuarios conectados', permisos: [
                            { id: 'vSessions:listar', label: 'Listar' },
                        ]
                    },
                    {
                        id: 'vActivityLogs', label: 'Activity logs', permisos: [
                            { id: 'vActivityLogs:listar', label: 'Listar' },
                        ]
                    },
                ]
            },
        ],

        showNavbar: true,
        loading: { show: false, text: '' },

        isDarkMode: null,
        tables: {},
        avances: {},
    }),
    actions: {
        initVars() {
            this.token = null
            this.permisos = []
            this.usuario = {}
        },

        //----- LOGIN ----- //
        async login() {
            if (this.token == null) return false

            this.setLoading(true, 'Cargando cuenta...')
            const result = await get(`${urls.colaboradores}/login`)
            this.setLoading(false)

            if (result.code != 0) return false

            this.usuario = deepCopy(result.data)
            this.permisos = this.usuario.permisos

            this.setTheme(this.usuario.theme)
            this.setPrimaryColor(this.usuario.color)

            return true
        },
        async logout(vueRouter) {
            this.setLoading(true, 'Cerrando sesion...')
            const result = await post(`${urls.signin}/logout`, { id: this.usuario.colaborador }, false)
            this.setLoading(false)

            if (result.code != 0) return

            if (vueRouter) vueRouter.replace({ name: 'SignIn' })

            this.initVars()
            useVistas().initVars()
            useModals().initVars()
        },
        verifyPermiso(...permisos) {
            // return this.usuario?.permisos?.includes(permiso)
            return permisos.some(p => this.usuario?.permisos?.includes(p))
        },

        //----- TABLES ----- //
        updateQuery(columns, qry) {
            columns.filter(a => a.op).forEach(b => {
                qry.fltr[b.id] = { op: b.op, val: b.val, val1: b.val1 }
            })

            qry.cols = columns.filter(a => a.show).map(b => b.id)
        },
        saveTableColumns(tableName, columns) {
            if (!tableName) return

            this.tables[tableName] = columns.map((col) => {
                return {
                    id: col.id,
                    width: col.width,
                    show: col.show,
                    seek: col.seek,
                    sort: col.sort,
                    op: col.op,
                    val: col.val,
                    val1: col.val1,
                    orden: col.orden,
                    sortDirection: col.sortDirection
                }
            })
        },
        setColumns(tableName, columns) {
            //----- RECUPERA LAS COLUMNAS GUARDADAS ----- //
            if (this.tables[tableName]) {
                for (const a of columns) {
                    Object.assign(a, this.tables[tableName].find(b => b.id === a.id))
                }
            }
        },

        //----- PREFERENCIAS ----- //
        setTheme(theme) {
            if (!theme) return

            this.usuario.theme = theme
            this.isDarkMode = theme == '2'

            if (theme == '1') {
                document.body.classList.remove('dark-mode')
            }
            else {
                document.body.classList.add('dark-mode')
            }
        },
        setPrimaryColor(color) {
            if (!color) return

            this.usuario.color = color
            document.documentElement.style.setProperty('--primary-color', color)
            document.documentElement.style.setProperty('--primary-color-dark', this.obscurecerColor(color))
        },
        obscurecerColor(color, porcentaje = 10) {
            const r = parseInt(color.substring(1, 3), 16);
            const g = parseInt(color.substring(3, 5), 16);
            const b = parseInt(color.substring(5, 7), 16);

            const rObscurecido = Math.max(0, Math.floor(r - (r * porcentaje / 100)));
            const gObscurecido = Math.max(0, Math.floor(g - (g * porcentaje / 100)));
            const bObscurecido = Math.max(0, Math.floor(b - (b * porcentaje / 100)));

            return `#${rObscurecido.toString(16).padStart(2, '0')}${gObscurecido.toString(16).padStart(2, '0')}${bObscurecido.toString(16).padStart(2, '0')}`;
        },

        setLoading(show, text) {
            if (text === undefined) text = ''

            this.loading = { show, text }
        },
    },
    persist: {
        storage: localStorage,
        paths: ['token', 'isDarkMode', 'tables', 'avances']
    }
})
