import { createRouter, createWebHistory } from 'vue-router'

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
        meta: { title: 'Consola - Eko Business' },
        component: () => import('@/views/_consola/ConsolaView.vue'),
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

router.beforeEach((to, from, next) => {
    const title = to.meta.title
    if (title) document.title = title
    next()
})

export default router