export default {
    name: 'vInspecciones',
    title: 'Inspecciones de clientes',
    apiPath: 'inspecciones',

    headerActions: [
        {
            text: 'Nuevo',
            action: 'nuevo',
            permiso: 'vInspecciones:crear',
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
            prop: 'fecha1',
            type: 'date',
            width: '10rem',
            show: true,
            orden: 2,
        },
        {
            id: 'socio',
            title: 'Cliente',
            prop: 'socio1.nombres',
            type: 'related',
            mostrar: 'nombres',
            width: '20rem',
            show: true,

            orden: 3,
        },
        {
            id: 'puntuacion',
            title: 'Puntuación',
            type: 'number',
            width: '10rem',
            show: true,
            orden: 4,
        },
        {
            id: 'puntuacion_maxima',
            title: 'Puntuación máxima',
            type: 'number',
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
            permiso: 'vInspecciones:eliminarBulk',
        },
    ],

    tableRowActions: [
        {
            label: 'Ver',
            icon: 'fa-regular fa-folder-open',
            action: 'ver',
            permiso: 'vInspecciones:ver',
        },
        {
            label: 'Editar',
            icon: 'fa-solid fa-pen-to-square',
            action: 'editar',
            permiso: 'vInspecciones:editar',
        },
        {
            label: 'Eliminar',
            icon: 'fa-solid fa-trash-can',
            action: 'vista.eliminar',
            permiso: 'vInspecciones:eliminar',
        },
    ],
}
