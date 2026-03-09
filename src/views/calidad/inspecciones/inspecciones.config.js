export const HEADER_ACTIONS = [
    {
        text: 'Nuevo',
        action: 'nuevo',
        permiso: 'vInspecciones:crear',
    },
]

export const TABLE_COLUMNS = [
    {
        id: 'fecha',
        title: 'Fecha',
        type: 'date',
        format: 'date',
        width: '10rem',
        show: true,
        sort: true,
    },
    {
        id: 'socio1.nombres',
        title: 'Cliente',
        prop: 'socio1.nombres',
        type: 'select',
        mostrar: 'nombres',
        width: '20rem',
        show: true,
        seek: true,
        sort: true,
    },
    {
        id: 'puntuacion',
        title: 'Puntuación',
        type: 'number',
        width: '10rem',
        show: true,
        sort: true,
    },
    {
        id: 'puntuacion_maxima',
        title: 'Puntuación máxima',
        type: 'number',
        width: '10rem',
        show: true,
        sort: true,
    },
]

export const TABLE_ROW_ACTIONS = [
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
        action: 'eliminar',
        permiso: 'vInspecciones:eliminar',
    },
]
