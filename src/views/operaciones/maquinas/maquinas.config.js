export default {
    name: 'vMaquinas',
    title: 'Maquinas',
    apiPath: 'maquinas',

    headerActions: [
        {
            text: 'Nuevo',
            action: 'nuevo',
            permiso: 'vMaquinas:crear',
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
            width: '15rem',
            show: true,

            orden: 2,
        },
        {
            id: 'linea',
            title: 'Tipo de producción',
            prop: 'linea1.nombre',
            type: 'related',
            relatedUrl: 'articulo_lineas',
            width: '15rem',
            show: true,

            orden: 3,
        },
        {
            id: 'velocidad',
            title: 'Velocidad (und/min)',
            type: 'number',
            width: '8rem',
            show: true,
            orden: 4,
        },
        {
            id: 'limpieza_tiempo',
            title: 'Tiempo de limpieza (min)',
            type: 'number',
            width: '8rem',
            show: true,
            orden: 5,
        },
    ],

    tableBulkActions: [
        {
            icon: 'fa-solid fa-trash-can',
            text: 'Eliminar',
            action: 'vista.eliminarBulk',
            permiso: 'vMaquinas:eliminarBulk',
        },
    ],

    tableRowActions: [
        {
            id: 1,
            label: 'Editar',
            icon: 'fa-solid fa-pen-to-square',
            action: 'editar',
            permiso: 'vMaquinas:editar',
        },
        {
            id: 2,
            label: 'Eliminar',
            icon: 'fa-solid fa-trash-can',
            action: 'vista.eliminar',
            permiso: 'vMaquinas:eliminar',
        },
    ],
}
