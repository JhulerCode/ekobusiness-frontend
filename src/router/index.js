import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

import menuUser from '@/config/menuUser.js'
import menuAdmin from '@/config/menuAdmin.js'
const viewsModules = import.meta.glob('../views/**/*.vue')

// ----- RUTAS HIJAS DE LA CONSOLA (DINÁMICAS) ----- //
const consolaChildren = []

const traverseRoutes = (items, parentPath = '') => {
    if (!items) return
    items.forEach((item) => {
        let currentPath = parentPath

        if (item.path) {
            if (parentPath && !item.path.startsWith(parentPath) && !item.path.startsWith('/')) {
                currentPath = `${parentPath}/${item.path}`
            } else if (item.path.startsWith('/')) {
                currentPath = item.path.substring(1)
            } else {
                currentPath = item.path
            }
        }

        if (item.path && item.view) {
            consolaChildren.push({
                path: currentPath,
                name: item.goto,
                meta: {
                    title: item.label,
                    vistaName: item.goto,
                    viewType: item.viewType || 'list',
                    permission: item.permission || item.goto,
                },
                component: viewsModules[`../views/${item.view}`],
                // component: () => import(`@/views/${item.view}`),
            })
        }
        if (item.children && item.children.length > 0) {
            traverseRoutes(item.children, currentPath)
        }
    })
}

traverseRoutes(menuUser)
traverseRoutes(menuAdmin)

// ----- RUTAS PRINCIPALES ----- //
const routes = [
    {
        path: '/signin',
        name: 'SignIn',
        meta: { title: 'Sign In' },
        component: () => import('@/views/_sign/SignIn.vue'),
    },
    {
        path: '/consola',
        name: 'ConsolaView',
        meta: { title: 'Consola', requiresAuth: true },
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

router.beforeEach(async (to, from, next) => {
    const auth = useAuth()

    // Actualizar título de la página
    if (to.meta.title) document.title = to.meta.title

    // Verificar si la ruta requiere autenticación
    const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)

    if (requiresAuth) {
        // Si no hay token, redirigir al login
        if (!auth.token) {
            return next({ name: 'SignIn' })
        }

        // Si hay token pero no hay usuario cargado (ej. al refrescar F5), cargarlo
        if (!auth.usuario?.id) {
            const loginOk = await auth.login()
            if (!loginOk) return next({ name: 'SignIn' })
        }

        // Verificar permisos de la vista
        if (to.meta.permission) {
            const permissions = Array.isArray(to.meta.permission)
                ? to.meta.permission
                : [to.meta.permission]
            const hasPermission = permissions.some(
                (perm) =>
                    auth.verifyPermiso(perm) ||
                    (auth.usuario?.permisos || []).some((p) => p.startsWith(perm + ':')),
            )

            if (!hasPermission) {
                if (from.name && from.name !== 'SignIn') return next(false)
                return next({ name: 'SignIn' })
            }
        }

        // Inicializar datos de la vista
        if (to.meta.vistaName) {
            const vistas = useVistas()
            vistas.initVista(to.meta.vistaName, to.meta.viewType)
        }

        // Si navega a /consola sin vista específica, redirigir a vista inicial
        if (to.name === 'ConsolaView') {
            const vistaInicial = auth.usuario?.vista_inicial
            if (vistaInicial) {
                return next({ name: vistaInicial, replace: true })
            }
        }
    } else {
        // Si intenta entrar al Login ya estando autenticado, mandarlo a la consola
        if (to.name === 'SignIn' && auth.token) {
            // Intentar cargar usuario si no está cargado para saber su vista inicial
            if (!auth.usuario?.id) await auth.login()

            if (auth.usuario?.id) {
                const vistaInicial = auth.usuario?.vista_inicial
                return next({ name: vistaInicial || 'ConsolaView', replace: true })
            }
        }
    }

    next()
})

export default router
