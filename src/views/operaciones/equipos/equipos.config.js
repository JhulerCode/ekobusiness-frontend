export const HEADER_ACTIONS = [
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
    }
]

export const TABLE_COLUMNS = [
    {
        id: 'codigo',
        title: 'Código',
        type: 'text',
        width: '8rem',
        show: true,
        seek: true,
        sort: true,
        orden: 1,
    },
    {
        id: 'nombre',
        title: 'Nombre',
        type: 'text',
        width: '20rem',
        show: true,
        seek: true,
        sort: true,
        orden: 2,
    },
    {
        id: 'fecha_compra',
        title: 'Fecha de compra',
        type: 'date',
        format: 'date',
        width: '8rem',
        show: true,
        seek: true,
        sort: true,
        orden: 3,
    },
]

export const TABLE_ROW_ACTIONS = [
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
]
