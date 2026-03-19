export default {
    name: 'vMonedas',
    title: 'Monedas',
    apiPath: 'monedas',

    headerActions: [
        {
            text: 'Nuevo',
            action: 'nuevo',
            permiso: 'vMonedas:crear',
        },
        {
            icon: 'fa-solid fa-download',
            text: 'Exportar página actual',
            action: 'vista.downloadActualTablePage',
            tipo: '2',
        },
    ],

    tableColumns: [
        {
            id: 'id',
            title: 'id',
            type: 'text',
            width: '5rem',
            show: false,
            orden: 1,
        },
        {
            id: 'nombre',
            title: 'Nombre',
            type: 'text',
            width: '10rem',
            show: true,

            orden: 2,
        },
        {
            id: 'codigo',
            title: 'Código',
            type: 'text',
            width: '8rem',
            show: true,

            orden: 3,
        },
        {
            id: 'simbolo',
            title: 'Símbolo',
            type: 'text',
            width: '5rem',
            show: true,

            orden: 4,
        },
        {
            id: 'plural',
            title: 'En plural',
            type: 'text',
            width: '10rem',
            show: true,

            orden: 5,
        },
    ],

    tableBulkActions: [
        {
            icon: 'fa-solid fa-trash-can',
            text: 'Eliminar',
            action: 'vista.eliminarBulk',
            permiso: 'vMonedas:eliminarBulk',
        },
    ],

    tableRowActions: [
        {
            id: 1,
            label: 'Editar',
            icon: 'fa-solid fa-pen-to-square',
            action: 'editar',
            permiso: 'vMonedas:editar',
        },
        {
            id: 2,
            label: 'Eliminar',
            icon: 'fa-solid fa-trash-can',
            action: 'vista.eliminar',
            permiso: 'vMonedas:eliminar',
            ocultar: { estandar: true },
        },
        {
            id: 3,
            label: 'Tipos de cambio',
            icon: 'fa-solid fa-dollar-sign',
            action: 'openTiposCambio',
            permiso: 'vTipoCambios:listar',
            ocultar: { estandar: true },
        },
    ],
}
