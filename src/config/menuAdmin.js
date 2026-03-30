export default [
    {
        id: 'admin_panel',
        label: 'SaaS Dashboard',
        icon: 'fa-solid fa-gauge-high',
        path: 'admin',
        children: [
            {
                label: 'Empresas',
                goto: 'vAdminEmpresas',
                path: 'empresas',
                view: '_user/empresas/vEmpresas.vue',
                permisos: [
                    { id: 'vAdminEmpresas:listar', label: 'Listar' },
                    { id: 'vAdminEmpresas:ver', label: 'Ver' },
                    { id: 'vAdminEmpresas:crear', label: 'Crear' },
                    { id: 'vAdminEmpresas:editar', label: 'Editar' },
                    { id: 'vAdminEmpresas:eliminar', label: 'Eliminar' },
                ],
                children: [
                    {
                        label: 'Detalle Empresa',
                        goto: 'vAdminEmpresa',
                        path: ':empresa_id',
                        view: '_user/empresa/vEmpresa.vue',
                        showInMenu: false,
                        permission: ['vAdminEmpresas:ver', 'vAdminEmpresas:crear'],
                        viewType: 'detail',
                    },
                ],
            },
            {
                label: 'Suscripciones',
                goto: 'vAdminSuscripciones',
                path: 'suscripciones',
                view: '_admin/suscripciones/vSuscripciones.vue',
                permisos: [
                    { id: 'vAdminSuscripciones:listar', label: 'Listar' },
                    { id: 'vAdminSuscripciones:crear', label: 'Crear' },
                    { id: 'vAdminSuscripciones:editar', label: 'Editar' },
                ],
            },
        ],
    },
]
