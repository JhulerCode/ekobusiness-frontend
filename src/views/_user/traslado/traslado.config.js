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
            ocultar: { tipo: 5, socio_pedido: { op: '!=', val: null } },
        },
    ],
}
