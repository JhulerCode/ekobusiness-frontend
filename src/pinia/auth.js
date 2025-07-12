import { defineStore } from "pinia"
import { urls, get, post } from '@/utils/crud.js'
import { deepCopy } from '@/utils/mine'
// import { useVistas } from '@/pinia/vistas.js'
// import { useModals } from '@/pinia/modals.js'

export const useAuth = defineStore('auth', {
    state: () => ({
        token: null,
        usuario: {},
        // permisos: [],

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
                ]
            }
        ],
        listaPermisos: [
            {
                id: 'logistica_entrada', label: 'Logistica de entrada', vistas: [
                    {
                        id: 'vProveedores', label: 'Proveedores', permisos: [
                            { id: 'vProveedores', label: 'Acceder' },
                            { id: 'vProveedores_crear', label: 'Crear' },
                            { id: 'vProveedores_ver', label: 'Ver' },
                            { id: 'vProveedores_editar', label: 'Editar' },
                            { id: 'vProveedores_eliminar', label: 'Eliminar' },

                            { id: 'vProveedores_editarBulk', label: 'Editar masivo' },
                            { id: 'vProveedores_eliminarBulk', label: 'Eliminar masivo' },
                        ]
                    },
                    {
                        id: 'vArticuloCategorias', label: 'Categorías de artículos', permisos: [
                            { id: 'vArticuloCategorias', label: 'Acceder' },
                            { id: 'vArticuloCategorias_crear', label: 'Crear' },
                            { id: 'vArticuloCategorias_editar', label: 'Editar' },
                            { id: 'vArticuloCategorias_eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vArticulos', label: 'Artículos', permisos: [
                            { id: 'vArticulos', label: 'Acceder' },
                            { id: 'vArticulos_crear', label: 'Crear' },
                            { id: 'vArticulos_editar', label: 'Editar' },
                            { id: 'vArticulos_eliminar', label: 'Eliminar' },

                            { id: 'vArticulos_clonar', label: 'Clonar' },
                            { id: 'vArticulos_kardex', label: 'Ver kardex' },
                            { id: 'vArticulos_ajusteStock', label: 'Ajuste stock' },

                            { id: 'vArticulos_importar', label: 'Importar' },
                            { id: 'vArticulos_editarBulk', label: 'Editar masivo' },
                            { id: 'vArticulos_eliminarBulk', label: 'Eliminar masivo' },
                        ]
                    },
                    {
                        id: 'vPrecioListas', label: 'Listas de precios', permisos: [
                            { id: 'vPrecioListas', label: 'Acceder' },
                            { id: 'vPrecioListas_crear', label: 'Crear' },
                            { id: 'vPrecioListas_editar', label: 'Editar' },
                            { id: 'vPrecioListas_eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vPrecioListaItems', label: 'Items de lista de precios', permisos: [
                            { id: 'vPrecioListaItems', label: 'Acceder' },
                            { id: 'vPrecioListaItems_crear', label: 'Crear' },
                            { id: 'vPrecioListaItems_editar', label: 'Editar' },
                            { id: 'vPrecioListaItems_eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vCompraPedidos', label: 'Pedidos de compra', permisos: [
                            { id: 'vCompraPedidos', label: 'Acceder' },
                            { id: 'vCompraPedidos_crear', label: 'Crear' },
                            { id: 'vCompraPedidos_ver', label: 'Ver' },
                            { id: 'vCompraPedidos_editar', label: 'Editar' },

                            { id: 'vCompraPedidos_anular', label: 'Anular' },
                            { id: 'vCompraPedidos_generarPdf', label: 'Generar PDF' },
                            { id: 'vCompraPedidos_ingresarMercaderia', label: 'Ingresar mercadería' },
                        ]
                    },
                    {
                        id: 'vCompras', label: 'Compras', permisos: [
                            { id: 'vCompras', label: 'Acceder' },
                            { id: 'vCompras_crear', label: 'Crear' },
                            { id: 'vCompras_ver', label: 'Ver' },

                            { id: 'vCompras_anular', label: 'Anular' },
                        ]
                    },
                    {
                        id: 'vCompraItems', label: 'Compra detalle', permisos: [
                            { id: 'vCompraItems', label: 'Acceder' },
                            { id: 'vCompraItems_inspeccion', label: 'Inspeccionar' },
                        ]
                    }
                ]
            },
            {
                id: 'logistica_salida', label: 'Logistica de salida', vistas: [
                    {
                        id: 'vClientes', label: 'Clientes', permisos: [
                            { id: 'vClientes', label: 'Acceder' },
                            { id: 'vClientes_crear', label: 'Crear' },
                            { id: 'vClientes_ver', label: 'Ver' },
                            { id: 'vClientes_editar', label: 'Editar' },
                            { id: 'vClientes_eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vProductoCategorias', label: 'Categorías de productos', permisos: [
                            { id: 'vProductoCategorias', label: 'Acceder' },
                            { id: 'vProductoCategorias_crear', label: 'Crear' },
                            { id: 'vProductoCategorias_editar', label: 'Editar' },
                            { id: 'vProductoCategorias_eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vProductosTerminados', label: 'Productos', permisos: [
                            { id: 'vProductosTerminados', label: 'Acceder' },
                            { id: 'vProductosTerminados_crear', label: 'Crear' },
                            { id: 'vProductosTerminados_editar', label: 'Editar' },
                            { id: 'vProductosTerminados_eliminar', label: 'Eliminar' },

                            { id: 'vProductosTerminados_clonar', label: 'Clonar' },
                            { id: 'vProductosTerminados_kardex', label: 'Ver kardex' },
                            { id: 'vProductosTerminados_ajusteStock', label: 'Ajuste stock' },

                            { id: 'vProductosTerminados_crearCombo', label: 'Crear combo' },
                            { id: 'vProductosTerminados_importar', label: 'Importar' },
                            { id: 'vProductosTerminados_editarBulk', label: 'Editar masivo' },
                            { id: 'vProductosTerminados_eliminarBulk', label: 'Eliminar masivo' },
                        ]
                    },
                    {
                        id: 'vReceta', label: 'Receta', permisos: [
                            { id: 'vReceta', label: 'Acceder' },
                            { id: 'vReceta_crear', label: 'Crear' },
                            { id: 'vReceta_editar', label: 'Editar' },
                            { id: 'vReceta_eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vPtsIngresos', label: 'Ingreso de productos', permisos: [
                            { id: 'vPtsIngresos', label: 'Acceder' },
                            { id: 'vPtsIngresos_verCuarentena', label: 'Ver cuarentena' },
                            { id: 'vPtsIngresos_ingresarPts', label: 'Ingresar productos terminados' },
                        ]
                    },
                    {
                        id: 'vVentaPedidos', label: 'Pedidos de venta', permisos: [
                            { id: 'vVentaPedidos', label: 'Acceder' },
                            { id: 'vVentaPedidos_crear', label: 'Crear' },
                            { id: 'vVentaPedidos_ver', label: 'Ver' },
                            { id: 'vVentaPedidos_editar', label: 'Editar' },

                            { id: 'vVentaPedidos_anular', label: 'Anular' },
                            { id: 'vVentaPedidos_entregarMercaderia', label: 'Entregar mercadería' },
                            { id: 'vVentaPedidos_verProductosPedidos', label: 'Ver productos pedidos' },
                        ]
                    },
                    {
                        id: 'vVentas', label: 'Ventas', permisos: [
                            { id: 'vVentas', label: 'Acceder' },
                            { id: 'vVentas_crear', label: 'Crear' },
                            { id: 'vVentas_ver', label: 'Ver' },
                            { id: 'vVentas_anular', label: 'Anular' },
                            { id: 'vVentas_controlDespacho', label: 'Control despacho' },
                        ]
                    },
                ]
            },
            {
                id: 'produccion', label: 'Producción', vistas: [
                    {
                        id: 'vProgramaFiltrantes', label: 'Programa de filtrantes', permisos: [
                            { id: 'vProgramaFiltrantes', label: 'Acceder' },
                            { id: 'vProgramaFiltrantes_crear', label: 'Crear' },
                            { id: 'vProgramaFiltrantes_ver', label: 'Ver' },
                            { id: 'vProgramaFiltrantes_editar', label: 'Editar' },
                            { id: 'vProgramaFiltrantes_eliminar', label: 'Eliminar' },

                            { id: 'vProgramaFiltrantes_salidaInsumos', label: 'Salida de insumos' },
                            { id: 'vProgramaFiltrantes_productosCuarentena', label: 'Productos en cuarentena' },
                            { id: 'vProgramaFiltrantes_verProductosPedidos', label: 'Ver productos pedidos' },
                        ]
                    },
                    {
                        id: 'vProgramaGranel', label: 'Programa de granel', permisos: [
                            { id: 'vProgramaGranel', label: 'Acceder' },
                            { id: 'vProgramaGranel_crear', label: 'Crear' },
                            { id: 'vProgramaGranel_ver', label: 'Ver' },
                            { id: 'vProgramaGranel_editar', label: 'Editar' },
                            { id: 'vProgramaGranel_eliminar', label: 'Eliminar' },

                            { id: 'vProgramaGranel_salidaInsumos', label: 'Salida de insumos' },
                            { id: 'vProgramaGranel_productosCuarentena', label: 'Productos en cuarentena' },
                            { id: 'vProgramaGranel_verProductosPedidos', label: 'Ver productos pedidos' },
                        ]
                    },
                    {
                        id: 'vProgramaLuxury', label: 'Programa de luxury', permisos: [
                            { id: 'vProgramaLuxury', label: 'Acceder' },
                            { id: 'vProgramaLuxury_crear', label: 'Crear' },
                            { id: 'vProgramaLuxury_ver', label: 'Ver' },
                            { id: 'vProgramaLuxury_editar', label: 'Editar' },
                            { id: 'vProgramaLuxury_eliminar', label: 'Eliminar' },

                            { id: 'vProgramaLuxury_salidaInsumos', label: 'Salida de insumos' },
                            { id: 'vProgramaLuxury_productosCuarentena', label: 'Productos en cuarentena' },
                            { id: 'vProgramaLuxury_verProductosPedidos', label: 'Ver productos pedidos' },
                        ]
                    },
                    {
                        id: 'vProduccionHistorial', label: 'Órdenes de producción', permisos: [
                            { id: 'vProduccionHistorial', label: 'Acceder' },
                            { id: 'vProduccionHistorial_ver', label: 'Ver' },

                            { id: 'vProduccionHistorial_salidaInsumos', label: 'Salida de insumos' },
                            { id: 'vProduccionHistorial_controlPesos', label: 'Control de pesos' },
                            { id: 'vProduccionHistorial_controlPpc', label: 'Control del PPC' },
                            { id: 'vProduccionHistorial_productosCuarentena', label: 'Productos en cuarentena' },
                            { id: 'vProduccionHistorial_productosTerminados', label: 'Productos terminados' },
                        ]
                    },
                    {
                        id: 'vProductosCuarentena', label: 'Productos en cuarentena', permisos: [
                            { id: 'vProductosCuarentena', label: 'Acceder' },
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
                            { id: 'vFormatosBpm', label: 'Acceder' },
                            { id: 'vFormatosBpm:crear', label: 'Crear' },
                            { id: 'vFormatosBpm:ver', label: 'Ver' },
                            { id: 'vFormatosBpm:editar', label: 'Editar' },
                            { id: 'vFormatosBpm:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vFormatosPhs', label: 'Formatos PHS', permisos: [
                            { id: 'vFormatosPhs', label: 'Acceder' },
                            { id: 'vFormatosPhs:crear', label: 'Crear' },
                            { id: 'vFormatosPhs:ver', label: 'Ver' },
                            { id: 'vFormatosPhs:editar', label: 'Editar' },
                            { id: 'vFormatosPhs:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vFormatosHaccp', label: 'Formatos HACCP', permisos: [
                            { id: 'vFormatosHaccp', label: 'Acceder' },
                            { id: 'vFormatosHaccp:crear', label: 'Crear' },
                            { id: 'vFormatosHaccp:ver', label: 'Ver' },
                            { id: 'vFormatosHaccp:editar', label: 'Editar' },
                            { id: 'vFormatosHaccp:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vRegistrosSanitarios', label: 'Registros sanitarios', permisos: [
                            { id: 'vRegistrosSanitarios', label: 'Acceder' },
                            { id: 'vRegistrosSanitarios_crear', label: 'Crear' },
                            { id: 'vRegistrosSanitarios_editar', label: 'Editar' },
                            { id: 'vRegistrosSanitarios_eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vInspecciones', label: 'Inspecciones', permisos: [
                            { id: 'vInspecciones', label: 'Acceder' },
                            { id: 'vInspecciones_crear', label: 'Crear' },
                            { id: 'vInspecciones_ver', label: 'Ver' },
                            { id: 'vInspecciones_editar', label: 'Editar' },
                            { id: 'vInspecciones_eliminar', label: 'Eliminar' },
                        ]
                    },
                ]
            },
            {
                id: 'operaciones', label: 'Operaciones', vistas: [
                    {
                        id: 'vDocumentos', label: 'Documentos', permisos: [
                            { id: 'vDocumentos', label: 'Acceder' },
                            { id: 'vDocumentos_crear', label: 'Crear' },
                            { id: 'vDocumentos_editar', label: 'Editar' },
                            { id: 'vDocumentos_eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vCajaAperturas', label: 'Caja', permisos: [
                            { id: 'vCajaAperturas', label: 'Acceder' },
                            { id: 'vCajaAperturas_aperturarCaja', label: 'Aperturar caja' },
                            { id: 'vCajaAperturas_ver', label: 'Ver' },
                            { id: 'vCajaAperturas_cerrarCaja', label: 'Cerrar caja' },
                            { id: 'vCajaAperturas_eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vCajaMovimientos', label: 'Movimientos de caja', permisos: [
                            { id: 'vCajaMovimientos', label: 'Acceder' },
                            { id: 'vCajaMovimientos_crear', label: 'Crear' },
                            { id: 'vCajaMovimientos_editar', label: 'Editar' },
                            { id: 'vCajaMovimientos_eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vMonedas', label: 'Monedas', permisos: [
                            { id: 'vMonedas', label: 'Acceder' },
                            { id: 'vMonedas_crear', label: 'Crear' },
                            { id: 'vMonedas_editar', label: 'Editar' },
                            { id: 'vMonedas_eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vTipoCambios', label: 'Tipos de cambio', permisos: [
                            { id: 'vTipoCambios', label: 'Acceder' },
                            { id: 'vTipoCambios_crear', label: 'Crear' },
                            { id: 'vTipoCambios_editar', label: 'Editar' },
                            { id: 'vTipoCambios_eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vMaquinas', label: 'Máquinas', permisos: [
                            { id: 'vMaquinas', label: 'Acceder' },
                            { id: 'vMaquinas_crear', label: 'Crear' },
                            { id: 'vMaquinas_editar', label: 'Editar' },
                            { id: 'vMaquinas_eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vEquipos', label: 'Equipos', permisos: [
                            { id: 'vEquipos', label: 'Acceder' },
                            { id: 'vEquipos_crear', label: 'Crear' },
                            { id: 'vEquipos_editar', label: 'Editar' },
                            { id: 'vEquipos_eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vColaboradores', label: 'Colaboradores', permisos: [
                            { id: 'vColaboradores', label: 'Acceder' },
                            { id: 'vColaboradores_crear', label: 'Crear' },
                            { id: 'vColaboradores_ver', label: 'Ver' },
                            { id: 'vColaboradores_editar', label: 'Editar' },
                            { id: 'vColaboradores_eliminar', label: 'Eliminar' },
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
            if (this.token == null) {
                this.logout()
                return false
            }

            this.setLoading(true, 'Cargando cuenta...')
            const result = await get(`${urls.colaboradores}/login`)
            this.setLoading(false)

            if (result.code != 0) {
                this.logout()
                return false
            }

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

            // this.initVars()
            // useVistas().initVars()
            // useModals().initVars()

            if (vueRouter)
                vueRouter.replace({ name: 'SignIn' })

            location.reload()
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
            console.log(theme)
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