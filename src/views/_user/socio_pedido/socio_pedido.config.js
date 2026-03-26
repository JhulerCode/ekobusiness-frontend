export default {
    apiPath: 'socio_pedidos',
    titleKey: 'codigo',
    pathKey: 'pedido_id',
    permisoEditar: ['vCompraPedidos:editar', 'vVentaPedidos:editar'],
    permisoClonar: ['vCompraPedidos:clonar', 'vVentaPedidos:clonar'],

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
            text: 'Recepción',
            icon: 'fa-regular fa-truck',
            tipo: '2',
            action: 'ingresar',
            permiso: 'vCompraPedidos:ingresarMercaderia',
            ocultar: { tipo: 2 },
        },
        {
            text: 'Entrega',
            icon: 'fa-regular fa-truck',
            tipo: '2',
            action: 'entregar',
            permiso: 'vVentaPedidos:entregarMercaderia',
            ocultar: { tipo: 1 },
        },
    ],
}
