export default {
    apiPath: 'socio_pedidos',
    titleKey: 'codigo',
    permisoEditar: ['vCompraPedidos:editar', 'vVentaPedidos:editar'],
    permisoClonar: ['vCompraPedidos:clonar'],

    headerActions: [
        {
            text: 'Exportar en PDF',
            icon: 'fa-regular fa-file-pdf',
            tipo: '2',
            action: 'generarPdf',
        },
        {
            text: 'Recalcular entregados',
            icon: 'fa-solid fa-calculator',
            tipo: '2',
            action: 'recalcularEntregados',
            permiso: 'vCompraPedidos:recalcularEntregados',
            ocultar: { estado: 2 },
        },
        {
            text: 'Ingresar mercadería',
            icon: 'fa-regular fa-truck',
            tipo: '2',
            action: 'ingresar',
            permiso: 'vCompraPedidos:ingresarMercaderia',
            ocultar: { estado: 2, tipo: 2 },
        },
        {
            text: 'Entregar mercadería',
            icon: 'fa-regular fa-truck',
            tipo: '2',
            action: 'entregar',
            permiso: 'vCompraPedidos:entregarMercaderia',
            ocultar: { estado: 2, tipo: 1 },
        },
    ],
}
