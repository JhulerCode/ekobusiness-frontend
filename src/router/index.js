import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

import menuConfig from '@/config/menu.js'

// ----- RUTAS HIJAS DE LA CONSOLA (DINÁMICAS) ----- //
const consolaChildren = []

menuConfig.forEach((section) => {
    section.children.forEach((item) => {
        consolaChildren.push({
            path: item.path,
            name: item.goto,
            meta: {
                title: `${item.label} - Eko Business`,
                vistaName: item.goto,
                permission: item.goto,
            },
            component: () => import(`@/views/${item.view}`),
        })
    })
})

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
            const permisos = auth.usuario?.permisos || []
            const hasPermission = permisos.some((p) => p.startsWith(to.meta.permission + ':'))

            if (!hasPermission) {
                if (from.name && from.name !== 'SignIn') return next(false)
                return next({ name: 'SignIn' })
            }
        }

        // Inicializar datos de la vista
        if (to.meta.vistaName) {
            const vistas = useVistas()
            vistas.initVista(to.meta.vistaName)
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
