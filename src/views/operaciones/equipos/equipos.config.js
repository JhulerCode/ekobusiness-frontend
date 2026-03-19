export default {
    name: 'vEquipos',
    title: 'Equipos',
    apiPath: 'maquinas',

    headerActions: [
        {
            text: 'Nuevo',
            action: 'nuevo',
            permiso: 'vEquipos:crear',
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
            id: 'codigo',
            title: 'Código',
            type: 'text',
            width: '8rem',
            show: true,

            orden: 2,
        },
        {
            id: 'nombre',
            title: 'Nombre',
            type: 'text',
            width: '20rem',
            show: true,

            orden: 3,
        },
        {
            id: 'fecha_compra',
            title: 'Fecha de compra',
            prop: 'fecha_compra1',
            type: 'date',
            width: '8rem',
            show: true,
            orden: 4,
        },
    ],

    tableBulkActions: [
        {
            icon: 'fa-solid fa-trash-can',
            text: 'Eliminar',
            action: 'vista.eliminarBulk',
            permiso: 'vEquipos:eliminarBulk',
        },
    ],

    tableRowActions: [
        {
            id: 1,
            label: 'Editar',
            icon: 'fa-solid fa-pen-to-square',
            action: 'editar',
            permiso: 'vEquipos:editar',
        },
        {
            id: 2,
            label: 'Eliminar',
            icon: 'fa-solid fa-trash-can',
            action: 'vista.eliminar',
            permiso: 'vEquipos:eliminar',
        },
    ],
}
