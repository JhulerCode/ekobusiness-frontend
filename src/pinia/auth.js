import { defineStore } from "pinia"
import { urls, get, post, patch } from '@/utils/crud.js'
import { deepCopy } from '@/utils/mine'
import { useVistas } from '@/pinia/vistas.js'
import { useModals } from '@/pinia/modals.js'

export const useAuth = defineStore('auth', {
    state: () => ({
        token: null,
        usuario: {},
        app_version: '1.8.5',

        menu: [
            {
                id: 'logistica_entrada', label: 'Logística de entrada', icon: 'fa-solid fa-cart-shopping', children: [
                    {
                        label: 'Proveedores', goto: 'vProveedores', permisos: [
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
                        label: 'Categorías de artículos', goto: 'vArticuloCategorias', permisos: [
                            { id: 'vArticuloCategorias:listar', label: 'Listar' },
                            { id: 'vArticuloCategorias:crear', label: 'Crear' },
                            { id: 'vArticuloCategorias:editar', label: 'Editar' },
                            { id: 'vArticuloCategorias:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        label: 'Artículos', goto: 'vArticulos', permisos: [
                            { id: 'vArticulos:listar', label: 'Listar' },
                            { id: 'vArticulos:crear', label: 'Crear' },
                            { id: 'vArticulos:editar', label: 'Editar' },
                            { id: 'vArticulos:eliminar', label: 'Eliminar' },

                            { id: 'vArticulos:clonar', label: 'Clonar' },
                            { id: 'vArticulos:kardex', label: 'Ver kardex' },
                            { id: 'vArticulos:lotes', label: 'Ver Lotes' },
                            { id: 'vArticulos:kardexDelete', label: 'Eliminar movimiento kardex' },
                            { id: 'vArticulos:ajusteStock', label: 'Ajuste stock' },

                            { id: 'vArticulos:importar', label: 'Importar' },
                            { id: 'vArticulos:editarBulk', label: 'Editar masivo' },
                            { id: 'vArticulos:eliminarBulk', label: 'Eliminar masivo' },
                        ]
                    },
                    {
                        label: 'Listas de precios', goto: 'vPrecioListas', permisos: [
                            { id: 'vPrecioListas:listar', label: 'Listar' },
                            { id: 'vPrecioListas:crear', label: 'Crear' },
                            { id: 'vPrecioListas:editar', label: 'Editar' },
                            { id: 'vPrecioListas:eliminar', label: 'Eliminar' },

                            { id: 'vPrecioListaItems:listar', label: 'Listar precios' },
                            { id: 'vPrecioListaItems:crear', label: 'Crear precio' },
                            { id: 'vPrecioListaItems:editar', label: 'Editar precio' },
                            { id: 'vPrecioListaItems:eliminar', label: 'Eliminar precio' },
                        ]
                    },
                    {
                        label: 'Pedidos de compra', goto: 'vCompraPedidos', permisos: [
                            { id: 'vCompraPedidos:listar', label: 'Listar' },
                            { id: 'vCompraPedidos:crear', label: 'Crear' },
                            { id: 'vCompraPedidos:ver', label: 'Ver' },
                            { id: 'vCompraPedidos:editar', label: 'Editar' },
                            { id: 'vCompraPedidos:eliminar', label: 'Eliminar' },

                            { id: 'vCompraPedidos:terminar', label: 'Terminar' },
                            { id: 'vCompraPedidos:generarPdf', label: 'Generar PDF' },
                            { id: 'vCompraPedidos:recalcularEntregados', label: 'Recalcular entregados' },
                            { id: 'vCompraPedidos:entregarMercaderia', label: 'Entregar mercadería' },
                            { id: 'vCompraPedidos:ingresarMercaderia', label: 'Ingresar mercadería' },
                        ]
                    },
                    {
                        label: 'Pedidos de compra detalle', goto: 'vCompraPedidoItems', permisos: [
                            { id: 'vCompraPedidoItems:listar', label: 'Listar' },
                        ]
                    },
                    {
                        label: 'Compras', goto: 'vCompras', permisos: [
                            { id: 'vCompras:listar', label: 'Listar' },
                            { id: 'vCompras:crear', label: 'Crear' },
                            { id: 'vCompras:ver', label: 'Ver' },
                            { id: 'vCompras:editar', label: 'Editar' },
                        ]
                    },
                    {
                        label: 'Compras detalle', goto: 'vCompraItems', permisos: [
                            { id: 'vCompraItems:listar', label: 'Listar' },
                            { id: 'vCompraItems:inspeccion', label: 'Inspeccionar' },
                        ]
                    },
                    {
                        label: 'Inventario', goto: 'vInventarioArticulos', permisos: [
                            { id: 'vInventarioArticulos:listar', label: 'Listar' },
                        ]
                    },
                ]
            },
            {
                id: 'logistica_salida', label: 'Logística de salida', icon: 'fa-solid fa-truck', children: [
                    {
                        label: 'Clientes', goto: 'vClientes', permisos: [
                            { id: 'vClientes:listar', label: 'Listar' },
                            { id: 'vClientes:crear', label: 'Crear' },
                            { id: 'vClientes:ver', label: 'Ver' },
                            { id: 'vClientes:editar', label: 'Editar' },
                            { id: 'vClientes:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        label: 'Líneas de productos', goto: 'vProductoLineas', permisos: [
                            { id: 'vProductoLineas:listar', label: 'Listar' },
                            { id: 'vProductoLineas:crear', label: 'Crear' },
                            { id: 'vProductoLineas:editar', label: 'Editar' },
                            { id: 'vProductoLineas:eliminar', label: 'Eliminar' },
                            { id: 'vProductoLineas:actualizarFotos', label: 'Actualizar fotos' },
                        ]
                    },
                    {
                        label: 'Categorías de productos', goto: 'vProductoCategorias', permisos: [
                            { id: 'vProductoCategorias:listar', label: 'Listar' },
                            { id: 'vProductoCategorias:crear', label: 'Crear' },
                            { id: 'vProductoCategorias:editar', label: 'Editar' },
                            { id: 'vProductoCategorias:eliminar', label: 'Eliminar' },
                            { id: 'vProductoCategorias:actualizarFotos', label: 'Actualizar fotos' },
                        ]
                    },
                    {
                        label: 'Productos', goto: 'vProductosTerminados', permisos: [
                            { id: 'vProductosTerminados:listar', label: 'Listar' },
                            { id: 'vProductosTerminados:crear', label: 'Crear' },
                            { id: 'vProductosTerminados:editar', label: 'Editar' },
                            { id: 'vProductosTerminados:eliminar', label: 'Eliminar' },

                            { id: 'vProductos:actualizarFotos', label: 'Actualizar fotos' },
                            { id: 'vProductosTerminados:clonar', label: 'Clonar' },
                            { id: 'vProductosTerminados:kardex', label: 'Ver kardex' },
                            { id: 'vProductosTerminados:lotes', label: 'Ver Lotes' },
                            { id: 'vProductosTerminados:ajusteStock', label: 'Ajuste stock' },

                            { id: 'vProductosTerminados:crearCombo', label: 'Crear combo' },
                            { id: 'vProductosTerminados:importar', label: 'Importar' },
                            { id: 'vProductosTerminados:editarBulk', label: 'Editar masivo' },
                            { id: 'vProductosTerminados:eliminarBulk', label: 'Eliminar masivo' },

                            { id: 'vReceta:listar', label: 'Listar receta' },
                            { id: 'vReceta:crear', label: 'Crear receta' },
                            { id: 'vReceta:editar', label: 'Editar receta' },
                            { id: 'vReceta:eliminar', label: 'Eliminar receta' },
                        ]
                    },
                    {
                        label: 'Ingreso de productos', goto: 'vPtsIngresos', permisos: [
                            { id: 'vPtsIngresos:listar', label: 'Listar' },
                            { id: 'vPtsIngresos:verCuarentena', label: 'Ver cuarentena' },
                            { id: 'vPtsIngresos:ingresarPts', label: 'Ingresar productos terminados' },
                        ]
                    },
                    {
                        label: 'Pedidos de venta', goto: 'vVentaPedidos', permisos: [
                            { id: 'vVentaPedidos:listar', label: 'Listar' },
                            { id: 'vVentaPedidos:crear', label: 'Crear' },
                            { id: 'vVentaPedidos:ver', label: 'Ver' },
                            { id: 'vVentaPedidos:editar', label: 'Editar' },
                            { id: 'vVentaPedidos:eliminar', label: 'Eliminar' },

                            { id: 'vVentaPedidos:generarPdf', label: 'Generar PDF' },
                            { id: 'vVentaPedidos:confirmarPago', label: 'Confirmar pago' },
                            { id: 'vVentaPedidos:confirmarListo', label: 'Marcar como listo' },
                            { id: 'vVentaPedidos:confirmarEntrega', label: 'Confirmar entrega' },
                            { id: 'vVentaPedidos:entregarMercaderia', label: 'Entregar mercadería' },

                            { id: 'vVentaPedidos:verProductosPedidos', label: 'Ver productos pedidos' },
                        ]
                    },
                    {
                        label: 'Pedidos de venta detalle', goto: 'vVentaPedidoItems', permisos: [
                            { id: 'vVentaPedidoItems:listar', label: 'Listar' },
                        ]
                    },
                    {
                        label: 'Ventas', goto: 'vVentas', permisos: [
                            { id: 'vVentas:listar', label: 'Listar' },
                            { id: 'vVentas:crear', label: 'Crear' },
                            { id: 'vVentas:ver', label: 'Ver' },
                            { id: 'vVentas:editar', label: 'Editar' },

                            { id: 'vVentas:controlDespacho', label: 'Control despacho' },
                        ]
                    },
                    {
                        label: 'Ventas detalle', goto: 'vVentaItems', permisos: [
                            { id: 'vVentaItems:listar', label: 'Listar' },
                        ]
                    },
                    {
                        label: 'Inventario', goto: 'vInventarioProductos', permisos: [
                            { id: 'vInventarioProductos:listar', label: 'Listar' },
                            { id: 'vInventarioProductos:recalcularStock', label: 'Recalcular stock' },
                        ]
                    },
                ]
            },
            {
                id: 'produccion', label: 'Producción', icon: 'fa-solid fa-oil-well', children: [
                    {
                        label: 'Lista de materiales', goto: 'vMrpBom', permisos: [
                            { id: 'vMrpBom:listar', label: 'Listar' },
                            { id: 'vMrpBom:crear', label: 'Crear' },
                            { id: 'vMrpBom:ver', label: 'Ver' },
                            { id: 'vMrpBom:editar', label: 'Editar' },
                            { id: 'vMrpBom:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        label: 'Programa', goto: 'vPrograma', permisos: [
                            { id: 'vPrograma:listar', label: 'Listar' },
                            { id: 'vPrograma:crear', label: 'Crear' },
                            { id: 'vPrograma:ver', label: 'Ver' },
                            { id: 'vPrograma:editar', label: 'Editar' },
                            { id: 'vPrograma:eliminar', label: 'Eliminar' },

                            { id: 'vPrograma:terminar', label: 'Terminar' },
                            { id: 'vPrograma:salidaInsumos', label: 'Salida insumos' },
                            { id: 'vPrograma:productosTerminados', label: 'Productos terminados' },

                            { id: 'vPrograma:verProductosPedidos', label: 'Ver productos pedidos' },
                            { id: 'vPrograma:salidaInsumosCompartidos', label: 'Salida de insumos compartidos' },
                        ]
                    },
                    {
                        label: 'Órdenes de producción', goto: 'vProduccionHistorial', permisos: [
                            { id: 'vProduccionHistorial:listar', label: 'Listar' },
                            { id: 'vProduccionHistorial:crear', label: 'Crear' },
                            { id: 'vProduccionHistorial:ver', label: 'Ver' },
                            { id: 'vProduccionHistorial:editar', label: 'Editar' },
                            { id: 'vProduccionHistorial:eliminar', label: 'Eliminar' },

                            { id: 'vProduccionHistorial:terminar', label: 'Terminar' },
                            { id: 'vProduccionHistorial:salidaInsumos', label: 'Salida insumos' },
                            { id: 'vProduccionHistorial:productosTerminados', label: 'Productos terminados' },
                            { id: 'vProduccionHistorial:trazabilidad', label: 'Ver trazabilidad' },
                            { id: 'vProduccionHistorial:controlPesos', label: 'Control de pesos' },
                            { id: 'vProduccionHistorial:controlPpc', label: 'Control del PPC' },

                            { id: 'vProduccionHistorial:verProductosPedidos', label: 'Ver productos pedidos' },
                            { id: 'vProduccionHistorial:salidaInsumosCompartidos', label: 'Salida de insumos compartidos' },
                        ]
                    },
                    {
                        label: 'Productos terminados', goto: 'vProductosCuarentena', permisos: [
                            { id: 'vProductosCuarentena:listar', label: 'Listar' },
                            { id: 'vProductosCuarentena:liberar_lote', label: 'Liberar lote' },
                            { id: 'vProductosCuarentena:trazabilidad', label: 'Ver trazabilidad' },
                        ]
                    },
                    {
                        label: 'Reporte', goto: 'vReporteProduccion', permisos: [
                            { id: 'vReporteProduccion:listar', label: 'Listar' },
                        ]
                    },
                ]
            },
            {
                id: 'calidad', label: 'Calidad', icon: 'fa-solid fa-magnifying-glass', children: [
                    {
                        label: 'Formatos BPM', goto: 'vFormatosBpm', permisos: [
                            { id: 'vFormatosBpm:listar', label: 'Listar' },
                            { id: 'vFormatosBpm:crear', label: 'Crear' },
                            { id: 'vFormatosBpm:ver', label: 'Ver' },
                            { id: 'vFormatosBpm:editar', label: 'Editar' },
                            { id: 'vFormatosBpm:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        label: 'Formatos PHS', goto: 'vFormatosPhs', permisos: [
                            { id: 'vFormatosPhs:listar', label: 'Listar' },
                            { id: 'vFormatosPhs:crear', label: 'Crear' },
                            { id: 'vFormatosPhs:ver', label: 'Ver' },
                            { id: 'vFormatosPhs:editar', label: 'Editar' },
                            { id: 'vFormatosPhs:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        label: 'Formatos HACCP', goto: 'vFormatosHaccp', permisos: [
                            { id: 'vFormatosHaccp:listar', label: 'Listar' },
                            { id: 'vFormatosHaccp:crear', label: 'Crear' },
                            { id: 'vFormatosHaccp:ver', label: 'Ver' },
                            { id: 'vFormatosHaccp:editar', label: 'Editar' },
                            { id: 'vFormatosHaccp:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        label: 'Registros sanitarios', goto: 'vRegistrosSanitarios', permisos: [
                            { id: 'vRegistrosSanitarios:listar', label: 'Listar' },
                            { id: 'vRegistrosSanitarios:crear', label: 'Crear' },
                            { id: 'vRegistrosSanitarios:editar', label: 'Editar' },
                            { id: 'vRegistrosSanitarios:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        label: 'Inspecciones de clientes', goto: 'vInspecciones', permisos: [
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
                id: 'operaciones', label: 'Operaciones', icon: 'fa-solid fa-gears', children: [
                    {
                        label: 'Documentos clave', goto: 'vDocumentos', permisos: [
                            { id: 'vDocumentos:listar', label: 'Listar' },
                            { id: 'vDocumentos:crear', label: 'Crear' },
                            { id: 'vDocumentos:editar', label: 'Editar' },
                            { id: 'vDocumentos:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        label: 'Caja chica', goto: 'vCajaAperturas', permisos: [
                            { id: 'vCajaAperturas:listar', label: 'Listar' },
                            { id: 'vCajaAperturas:aperturarCaja', label: 'Aperturar caja' },
                            { id: 'vCajaAperturas:ver', label: 'Ver' },
                            { id: 'vCajaAperturas:cerrarCaja', label: 'Cerrar caja' },
                            { id: 'vCajaAperturas:eliminar', label: 'Eliminar' },

                            { id: 'vCajaMovimientos:listar', label: 'Listar movimientos' },
                            { id: 'vCajaMovimientos:crear', label: 'Crear movimiento' },
                            { id: 'vCajaMovimientos:editar', label: 'Editar movimiento' },
                            { id: 'vCajaMovimientos:eliminar', label: 'Eliminar movimiento' },
                        ]
                    },
                    {
                        label: 'Monedas', goto: 'vMonedas', permisos: [
                            { id: 'vMonedas:listar', label: 'Listar' },
                            { id: 'vMonedas:crear', label: 'Crear' },
                            { id: 'vMonedas:editar', label: 'Editar' },
                            { id: 'vMonedas:eliminar', label: 'Eliminar' },

                            { id: 'vTipoCambios:listar', label: 'Listar tc' },
                            { id: 'vTipoCambios:crear', label: 'Crear tc' },
                            { id: 'vTipoCambios:editar', label: 'Editar tc' },
                            { id: 'vTipoCambios:eliminar', label: 'Eliminar tc' },
                        ]
                    },
                    {
                        label: 'Máquinas', goto: 'vMaquinas', permisos: [
                            { id: 'vMaquinas:listar', label: 'Listar' },
                            { id: 'vMaquinas:crear', label: 'Crear' },
                            { id: 'vMaquinas:editar', label: 'Editar' },
                            { id: 'vMaquinas:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        label: 'Equipos', goto: 'vEquipos', permisos: [
                            { id: 'vEquipos:listar', label: 'Listar' },
                            { id: 'vEquipos:crear', label: 'Crear' },
                            { id: 'vEquipos:editar', label: 'Editar' },
                            { id: 'vEquipos:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        label: 'Colaboradores', goto: 'vColaboradores', permisos: [
                            { id: 'vColaboradores:listar', label: 'Listar' },
                            { id: 'vColaboradores:crear', label: 'Crear' },
                            { id: 'vColaboradores:ver', label: 'Ver' },
                            { id: 'vColaboradores:editar', label: 'Editar' },
                            { id: 'vColaboradores:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        label: 'Asistencias', goto: 'vAsistencias', permisos: [
                            { id: 'vAsistencias:listar', label: 'Listar' },
                            { id: 'vAsistencias:crear', label: 'Crear' },
                            { id: 'vAsistencias:editar', label: 'Editar' },
                            { id: 'vAsistencias:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        label: 'Usuarios conectados', goto: 'vSessions', permisos: [
                            { id: 'vSessions:listar', label: 'Listar' },
                        ]
                    },
                    {
                        label: 'Activity logs', goto: 'vActivityLogs', permisos: [
                            { id: 'vActivityLogs:listar', label: 'Listar' },
                        ]
                    },
                ]
            }
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
            this.tables = {}
            this.avances = {}
        },

        // ----- LOGIN ----- //
        async login() {
            if (this.token == null) return false

            this.setLoading(true, 'Cargando cuenta...')
            const result = await get(`${urls.colaboradores}/login`)
            this.setLoading(false)

            if (result.code != 0) return false

            this.setSessionDatos(result)

            // this.usuario = deepCopy(result.data)
            // this.permisos = this.usuario.permisos

            // this.setTheme(this.usuario.theme)
            // this.setPrimaryColor(this.usuario.color)
            // this.setInicialTables(this.usuario.tables)
            // this.setInicialAvances(this.usuario.avances)
            // // Formato de fecha
            // this.showNavbar = this.usuario.menu_visible

            return true
        },
        setSessionDatos(result) {
            this.usuario = deepCopy(result.data)
            this.permisos = this.usuario.permisos

            this.setTheme(this.usuario.theme)
            this.setPrimaryColor(this.usuario.color)
            this.setInicialTables(this.usuario.tables)
            this.setInicialAvances(this.usuario.avances)
            // Formato de fecha
            this.showNavbar = this.usuario.menu_visible
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

        // ----- TABLES ----- //
        updateQuery(columns, qry) {
            columns.filter(a => a.op).forEach(b => {
                qry.fltr[b.id] = { op: b.op, val: b.val, val1: b.val1 }
            })

            qry.cols = columns.filter(a => a.show).map(b => b.id)
        },
        async saveTableColumns(tableName, columns) {
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

            const send = {
                id: this.usuario.colaborador,
                tables: this.tables
            }

            this.setLoading(true, 'Cargando...')
            const res = await patch(`${urls.colaboradores}/tables`, send, false)
            this.setLoading(false)

            if (res.code != 0) return
        },
        setColumns(tableName, columns) {
            // ----- RECUPERA LAS COLUMNAS GUARDADAS ----- //
            if (this.tables[tableName]) {
                for (const a of columns) {
                    Object.assign(a, this.tables[tableName].find(b => b.id === a.id))
                }
            }
        },
        setInicialTables(tables) {
            this.tables = tables
        },

        // ----- AVANCES ----- //
        async saveAvances(card, data) {
            this.avances[card] = data

            const send = {
                id: this.usuario.colaborador,
                avances: this.avances
            }

            this.setLoading(true, 'Cargando...')
            const res = await patch(`${urls.colaboradores}/avances`, send, false)
            this.setLoading(false)

            if (res.code != 0) return
        },
        setInicialAvances(avances) {
            this.avances = avances
        },

        // ----- PREFERENCIAS ----- //
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
        paths: ['token', 'isDarkMode', 'tables']
    }
})
