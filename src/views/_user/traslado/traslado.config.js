export default {
    apiPath: 'transacciones',
    titleKey: 'fecha1',
    pathKey: 'traslado_id',
    permisoEditar: ['no'],
    permisoClonar: ['no'],

    headerActions: [
        {
            text: 'Facturas proveedor',
            icon: 'fa-solid fa-file-invoice',
            tipo: '2',
            action: 'facturar',
            permiso: ['vCompraComprobantes:crear'],
            ocultar: { socio_pedido: { op: '!=', val: null }, tipo: 5 },
        },
        {
            text: 'Abrir',
            icon: 'fa-solid fa-check-double',
            tipo: '2',
            action: 'abrir',
            permiso: ['vCompras:abrir'],
            ocultar: { estado: '1', socio_pedido: { op: '!=', val: null }, tipo: 5 },
        },
        {
            text: 'Cerrar',
            icon: 'fa-solid fa-check-double',
            tipo: '2',
            action: 'cerrar',
            permiso: ['vCompras:cerrar'],
            ocultar: { estado: '2', socio_pedido: { op: '!=', val: null }, tipo: 5 },
        },
    ],
}
