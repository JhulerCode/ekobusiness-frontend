export const HEADER_ACTIONS = [
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
    }
]

export const TABLE_COLUMNS = [
    {
        id: 'nombre',
        title: 'Nombre',
        type: 'text',
        width: '15rem',
        show: true,
        seek: true,
        sort: true,
        orden: 1,
    },
    {
        id: 'linea',
        title: 'Tipo de producción',
        prop: 'linea1.nombre',
        type: 'select',
        width: '15rem',
        show: true,
        seek: true,
        sort: true,
        orden: 2,
    },
    {
        id: 'velocidad',
        title: 'Velocidad (und/min)',
        type: 'number',
        width: '8rem',
        show: true,
        seek: true,
        sort: true,
        orden: 3,
    },
    {
        id: 'limpieza_tiempo',
        title: 'Tiempo de limpieza (min)',
        type: 'number',
        width: '8rem',
        show: true,
        seek: true,
        sort: true,
        orden: 4,
    },
]

export const TABLE_ROW_ACTIONS = [
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
]
