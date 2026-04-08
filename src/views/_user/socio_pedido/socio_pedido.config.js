export default {
    apiPath: 'socio_pedidos',
    titleKey: 'codigo',
    pathKey: 'pedido_id',
    permisoEditar: ['vCompraPedidos:editar', 'vVentaPedidos:editar'],
    permisoClonar: ['vCompraPedidos:clonar', 'vVentaPedidos:clonar'],
    permisoGuardarAvance: ['vCompraPedidos:crear', 'vVentaPedidos:crear'],

    headerActions: [
        {
            text: 'Exportar en PDF',
            icon: 'fa-regular fa-file-pdf',
            tipo: '2',
            action: 'generarPdf',
        },
        {
            text: 'Entrega',
            icon: 'fa-regular fa-truck',
            tipo: '2',
            action: 'entregar',
            permiso: 'vVentaPedidos:entregarMercaderia',
            ocultar: { tipo: 2, is_maquila: false },
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
        {
            text: 'Facturas proveedor',
            action: 'facturar',
            permiso: ['vCompraComprobantes:crear'],
            tipo: '2',
        },
    ],
}
