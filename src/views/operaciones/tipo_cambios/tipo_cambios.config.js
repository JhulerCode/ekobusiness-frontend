export default {
    name: 'vTipoCambios',
    title: 'Tipos de cambio',
    apiPath: 'tipo_cambios',

    headerActions: [
        {
            text: 'Nuevo',
            action: 'nuevo',
            permiso: 'vTipoCambios:crear',
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
            id: 'fecha',
            title: 'Fecha',
            type: 'date',
            width: '10rem',
            show: true,
            seek: true,
            orden: 2,
        },
        {
            id: 'compra',
            title: 'Compra',
            type: 'number',
            width: '8rem',
            show: true,
            seek: true,
            orden: 3,
        },
        {
            id: 'venta',
            title: 'Venta',
            type: 'number',
            width: '8rem',
            show: true,
            seek: true,
            orden: 4,
        },
    ],

    tableRowActions: [
        {
            id: 1,
            label: 'Editar',
            icon: 'fa-solid fa-pen-to-square',
            action: 'editar',
            permiso: 'vTipoCambios:editar',
        },
        {
            id: 2,
            label: 'Eliminar',
            icon: 'fa-solid fa-trash-can',
            action: 'vista.eliminar',
            permiso: 'vTipoCambios:eliminar',
        },
    ],
}
