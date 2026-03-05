import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

// ----- RUTAS HIJAS DE LA CONSOLA ----- //
const consolaChildren = [
    // ----- INVENTARIO ----- //
    {
        path: 'inventario/lineas',
        name: 'vProductoLineas',
        meta: {
            title: 'Líneas de productos - Eko Business',
            vistaName: 'vProductoLineas',
            permission: 'vProductoLineas',
        },
        component: () => import('@/views/inventario/lineas/vProductoLineas.vue'),
    },
    {
        path: 'inventario/categorias',
        name: 'vArticuloCategorias',
        meta: {
            title: 'Categorías - Eko Business',
            vistaName: 'vArticuloCategorias',
            permission: 'vArticuloCategorias',
        },
        component: () => import('@/views/inventario/categorias/vArticuloCategorias.vue'),
    },
    {
        path: 'inventario/articulos',
        name: 'vArticulos',
        meta: {
            title: 'Artículos - Eko Business',
            vistaName: 'vArticulos',
            permission: 'vArticulos',
        },
        component: () => import('@/views/inventario/articulos/vArticulos.vue'),
    },
    {
        path: 'inventario/stock',
        name: 'vInventarioArticulos',
        meta: {
            title: 'Inventario - Eko Business',
            vistaName: 'vInventarioArticulos',
            permission: 'vInventarioArticulos',
        },
        component: () => import('@/views/inventario/inventario/vInventarioArticulos.vue'),
    },

    // ----- COMPRAS ----- //
    {
        path: 'compras/proveedores',
        name: 'vProveedores',
        meta: {
            title: 'Proveedores - Eko Business',
            vistaName: 'vProveedores',
            permission: 'vProveedores',
        },
        component: () => import('@/views/logistica_entrada/proveedores/vProveedores.vue'),
    },
    {
        path: 'compras/pedidos',
        name: 'vCompraPedidos',
        meta: {
            title: 'Pedidos de compra - Eko Business',
            vistaName: 'vCompraPedidos',
            permission: 'vCompraPedidos',
        },
        component: () => import('@/views/logistica_entrada/pedidos/vCompraPedidos.vue'),
    },
    {
        path: 'compras/pedido-items',
        name: 'vCompraPedidoItems',
        meta: {
            title: 'Pedidos detalle - Eko Business',
            vistaName: 'vCompraPedidoItems',
            permission: 'vCompraPedidoItems',
        },
        component: () => import('@/views/logistica_entrada/pedido_items/vCompraPedidoItems.vue'),
    },
    {
        path: 'compras/compras',
        name: 'vCompras',
        meta: { title: 'Compras - Eko Business', vistaName: 'vCompras', permission: 'vCompras' },
        component: () => import('@/views/logistica_entrada/compras/vCompras.vue'),
    },
    {
        path: 'compras/compra-items',
        name: 'vCompraItems',
        meta: {
            title: 'Compras detalle - Eko Business',
            vistaName: 'vCompraItems',
            permission: 'vCompraItems',
        },
        component: () => import('@/views/logistica_entrada/compra_items/vCompraItems.vue'),
    },

    // ----- VENTAS ----- //
    {
        path: 'ventas/clientes',
        name: 'vClientes',
        meta: { title: 'Clientes - Eko Business', vistaName: 'vClientes', permission: 'vClientes' },
        component: () => import('@/views/logistica_salida/clientes/vClientes.vue'),
    },
    {
        path: 'ventas/pedidos',
        name: 'vVentaPedidos',
        meta: {
            title: 'Pedidos de venta - Eko Business',
            vistaName: 'vVentaPedidos',
            permission: 'vVentaPedidos',
        },
        component: () => import('@/views/logistica_salida/pedidos/vVentaPedidos.vue'),
    },
    {
        path: 'ventas/pedido-items',
        name: 'vVentaPedidoItems',
        meta: {
            title: 'Pedidos venta detalle - Eko Business',
            vistaName: 'vVentaPedidoItems',
            permission: 'vVentaPedidoItems',
        },
        component: () => import('@/views/logistica_salida/pedido_items/vVentaPedidoItems.vue'),
    },
    {
        path: 'ventas/ventas',
        name: 'vVentas',
        meta: { title: 'Ventas - Eko Business', vistaName: 'vVentas', permission: 'vVentas' },
        component: () => import('@/views/logistica_salida/ventas/vVentas.vue'),
    },
    {
        path: 'ventas/venta-items',
        name: 'vVentaItems',
        meta: {
            title: 'Ventas detalle - Eko Business',
            vistaName: 'vVentaItems',
            permission: 'vVentaItems',
        },
        component: () => import('@/views/logistica_salida/venta_items/vVentaItems.vue'),
    },
    {
        path: 'ventas/soporte',
        name: 'vHelpdeskTickets',
        meta: {
            title: 'Soporte al cliente - Eko Business',
            vistaName: 'vHelpdeskTickets',
            permission: 'vHelpdeskTickets',
        },
        component: () => import('@/views/logistica_salida/soporte_cliente/vHelpdeskTickets.vue'),
    },

    // ----- PRODUCCIÓN ----- //
    {
        path: 'produccion/bom',
        name: 'vMrpBom',
        meta: {
            title: 'Lista de materiales - Eko Business',
            vistaName: 'vMrpBom',
            permission: 'vMrpBom',
        },
        component: () => import('@/views/produccion/mrp_bom/vMrpBom.vue'),
    },
    {
        path: 'produccion/programa',
        name: 'vPrograma',
        meta: { title: 'Programa - Eko Business', vistaName: 'vPrograma', permission: 'vPrograma' },
        component: () => import('@/views/produccion/vPrograma.vue'),
    },
    {
        path: 'produccion/ordenes',
        name: 'vProduccionHistorial',
        meta: {
            title: 'Órdenes de producción - Eko Business',
            vistaName: 'vProduccionHistorial',
            permission: 'vProduccionHistorial',
        },
        component: () => import('@/views/produccion/historial/vProduccionHistorial.vue'),
    },
    {
        path: 'produccion/cuarentena',
        name: 'vProductosCuarentena',
        meta: {
            title: 'Productos terminados - Eko Business',
            vistaName: 'vProductosCuarentena',
            permission: 'vProductosCuarentena',
        },
        component: () => import('@/views/produccion/vProductosCuarentena.vue'),
    },
    {
        path: 'produccion/ingresos',
        name: 'vPtsIngresos',
        meta: {
            title: 'Ingreso de productos - Eko Business',
            vistaName: 'vPtsIngresos',
            permission: 'vPtsIngresos',
        },
        component: () => import('@/views/logistica_salida/ingreso_pt/vPtsIngresos.vue'),
    },
    {
        path: 'produccion/reporte',
        name: 'vReporteProduccion',
        meta: {
            title: 'Reporte producción - Eko Business',
            vistaName: 'vReporteProduccion',
            permission: 'vReporteProduccion',
        },
        component: () => import('@/views/produccion/vReporteProduccion.vue'),
    },

    // ----- CALIDAD ----- //
    {
        path: 'calidad/formatos-bpm',
        name: 'vFormatosBpm',
        meta: {
            title: 'Formatos BPM - Eko Business',
            vistaName: 'vFormatosBpm',
            permission: 'vFormatosBpm',
        },
        component: () => import('@/views/calidad/formatos/vFormatosBpm.vue'),
    },
    {
        path: 'calidad/formatos-phs',
        name: 'vFormatosPhs',
        meta: {
            title: 'Formatos PHS - Eko Business',
            vistaName: 'vFormatosPhs',
            permission: 'vFormatosPhs',
        },
        component: () => import('@/views/calidad/formatos/vFormatosPhs.vue'),
    },
    {
        path: 'calidad/formatos-haccp',
        name: 'vFormatosHaccp',
        meta: {
            title: 'Formatos HACCP - Eko Business',
            vistaName: 'vFormatosHaccp',
            permission: 'vFormatosHaccp',
        },
        component: () => import('@/views/calidad/formatos/vFormatosHaccp.vue'),
    },
    {
        path: 'calidad/registros-sanitarios',
        name: 'vRegistrosSanitarios',
        meta: {
            title: 'Registros sanitarios - Eko Business',
            vistaName: 'vRegistrosSanitarios',
            permission: 'vRegistrosSanitarios',
        },
        component: () => import('@/views/calidad/documentos/vRegistrosSanitarios.vue'),
    },
    {
        path: 'calidad/inspecciones',
        name: 'vInspecciones',
        meta: {
            title: 'Inspecciones - Eko Business',
            vistaName: 'vInspecciones',
            permission: 'vInspecciones',
        },
        component: () => import('@/views/calidad/inspecciones/vInspecciones.vue'),
    },

    // ----- OPERACIONES ----- //
    {
        path: 'operaciones/documentos',
        name: 'vDocumentos',
        meta: {
            title: 'Documentos clave - Eko Business',
            vistaName: 'vDocumentos',
            permission: 'vDocumentos',
        },
        component: () => import('@/views/operaciones/documentos/vDocumentos.vue'),
    },
    {
        path: 'operaciones/caja-chica',
        name: 'vCajaAperturas',
        meta: {
            title: 'Caja chica - Eko Business',
            vistaName: 'vCajaAperturas',
            permission: 'vCajaAperturas',
        },
        component: () => import('@/views/operaciones/caja_chica/vCajaAperturas.vue'),
    },
    {
        path: 'operaciones/monedas',
        name: 'vMonedas',
        meta: { title: 'Monedas - Eko Business', vistaName: 'vMonedas', permission: 'vMonedas' },
        component: () => import('@/views/operaciones/monedas/vMonedas.vue'),
    },
    {
        path: 'operaciones/maquinas',
        name: 'vMaquinas',
        meta: { title: 'Máquinas - Eko Business', vistaName: 'vMaquinas', permission: 'vMaquinas' },
        component: () => import('@/views/operaciones/maquinas/vMaquinas.vue'),
    },
    {
        path: 'operaciones/equipos',
        name: 'vEquipos',
        meta: { title: 'Equipos - Eko Business', vistaName: 'vEquipos', permission: 'vEquipos' },
        component: () => import('@/views/operaciones/equipos/vEquipos.vue'),
    },
    {
        path: 'operaciones/colaboradores',
        name: 'vColaboradores',
        meta: {
            title: 'Colaboradores - Eko Business',
            vistaName: 'vColaboradores',
            permission: 'vColaboradores',
        },
        component: () => import('@/views/operaciones/colaboradores/vColaboradores.vue'),
    },
    {
        path: 'operaciones/asistencias',
        name: 'vAsistencias',
        meta: {
            title: 'Asistencias - Eko Business',
            vistaName: 'vAsistencias',
            permission: 'vAsistencias',
        },
        component: () => import('@/views/operaciones/asistencias/vAsistencias.vue'),
    },
    {
        path: 'operaciones/sesiones',
        name: 'vSessions',
        meta: {
            title: 'Usuarios conectados - Eko Business',
            vistaName: 'vSessions',
            permission: 'vSessions',
        },
        component: () => import('@/views/operaciones/sessions/vSessions.vue'),
    },
    {
        path: 'operaciones/actividad',
        name: 'vActivityLogs',
        meta: {
            title: 'Activity logs - Eko Business',
            vistaName: 'vActivityLogs',
            permission: 'vActivityLogs',
        },
        component: () => import('@/views/operaciones/activity_logs/vActivityLogs.vue'),
    },
]

// ----- RUTAS PRINCIPALES ----- //
const routes = [
    {
        path: '/signin',
        name: 'SignIn',
        meta: { title: 'Sign In - Eko Business' },
        component: () => import('@/views/_sign/SignIn.vue'),
    },
    {
        path: '/consola',
        name: 'ConsolaView',
        meta: { title: 'Consola - Eko Business', requiresAuth: true },
        component: () => import('@/views/_consola/ConsolaView.vue'),
        children: consolaChildren,
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/signin',
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

router.beforeEach((to, from, next) => {
    // Actualizar título de la página
    if (to.meta.title) document.title = to.meta.title

    // Verificar si la ruta requiere autenticación
    const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)

    if (requiresAuth) {
        const auth = useAuth()

        // Si no hay token, redirigir al login
        if (!auth.token) {
            return next({ name: 'SignIn' })
        }

        // Verificar permisos de la vista
        if (to.meta.permission) {
            const permisos = auth.usuario?.permisos || []
            const hasPermission = permisos.some((p) => p.startsWith(to.meta.permission + ':'))

            if (!hasPermission) {
                // Si no tiene permiso, quedarse donde está o ir al login
                if (from.name && from.name !== 'SignIn') {
                    return next(false)
                }
                return next({ name: 'SignIn' })
            }
        }

        // Inicializar datos de la vista en el store
        if (to.meta.vistaName) {
            const vistas = useVistas()
            vistas.initVista(to.meta.vistaName)
        }
    }

    // Si navega a /consola sin vista específica, redirigir a vista inicial
    if (to.name === 'ConsolaView') {
        const auth = useAuth()
        const vistaInicial = auth.usuario?.vista_inicial
        if (vistaInicial) {
            return next({ name: vistaInicial, replace: true })
        }
    }

    next()
})

export default router
