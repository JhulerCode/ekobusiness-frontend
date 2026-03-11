export const HEADER_ACTIONS = [
    {
        text: 'Nuevo',
        action: 'nuevo',
        permiso: 'vAsistencias:crear',
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
        id: 'colaborador',
        title: 'Colaborador',
        prop: 'colaborador1.nombres',
        type: 'select',
        mostrar: 'nombres',
        width: '15rem',
        show: true,
        seek: true,
        sort: true,
        orden: 1,
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
        orden: 2,
    },
    {
        id: 'hora_entrada',
        title: 'Hora de entrada',
        type: 'time',
        width: '8rem',
        show: true,
        seek: true,
        sort: true,
        orden: 3,
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
        orden: 4,
    },
    {
        id: 'hora_salida',
        title: 'Hora de salida',
        type: 'time',
        width: '8rem',
        show: true,
        seek: true,
        sort: true,
        orden: 5,
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
        action: 'vista.eliminar',
        permiso: 'vAsistencias:eliminar',
    },
]
