export default {
    apiPath: 'produccion_ordenes',
    titleKey: 'fecha1',
    pathKey: 'produccion_orden_id',
    permisoEditar: ['vProduccionOrdenes:editar', 'vProduccionOrdenes:editar'],
    permisoClonar: ['vProduccionOrdenes:clonar', 'vProduccionOrdenes:clonar'],

    headerActions: [
        {
            label: 'Inicar',
            icon: 'fa-solid fa-play',
            tipo: '2',
            action: 'iniciar',
            permiso: 'vProduccionOrdenes:iniciarTerminar',
            ocultar: { estado: 2, inicio: { op: '!=', val: null } },
        },
        {
            label: 'Terminar',
            icon: 'fa-solid fa-stop',
            tipo: '2',
            action: 'terminar',
            permiso: 'vProduccionOrdenes:iniciarTerminar',
            ocultar: { estado: 2, inicio: { op: '=', val: null }, fin: { op: '!=', val: null } },
        },
    ],
}
