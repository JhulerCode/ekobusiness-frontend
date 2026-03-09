export const HEADER_ACTIONS = [
    {
        text: 'Crear',
        action: 'nuevo',
        permiso: 'vAsistencias:crear',
    },
]

export const TABLE_COLUMNS = [
    {
        id: 'colaborador',
        title: 'Colaborador',
        prop: 'colaborador1.nombres',
        type: 'select',
        mostrar: 'nombres',
        width: '15rem',
        show: true,
        seek: true,
        sort: true,
    },
    {
        id: 'fecha_entrada',
        title: 'Fecha de entrada',
        format: 'date',
        type: 'date',
        width: '8rem',
        show: true,
        seek: true,
        sort: true,
    },
    {
        id: 'hora_entrada',
        title: 'Hora de entrada',
        type: 'time',
        width: '8rem',
        show: true,
        seek: true,
        sort: true,
    },
    {
        id: 'fecha_salida',
        title: 'Fecha de salida',
        format: 'date',
        type: 'date',
        width: '8rem',
        show: true,
        seek: true,
        sort: true,
    },
    {
        id: 'hora_salida',
        title: 'Hora de salida',
        type: 'time',
        width: '8rem',
        show: true,
        seek: true,
        sort: true,
    },
]

export const TABLE_ROW_ACTIONS = [
    {
        label: 'Editar',
        icon: 'fa-solid fa-pen-to-square',
        action: 'editar',
        permiso: 'vAsistencias:editar',
    },
    {
        label: 'Eliminar',
        icon: 'fa-solid fa-trash-can',
        action: 'eliminar',
        permiso: 'vAsistencias:eliminar',
    },
]
