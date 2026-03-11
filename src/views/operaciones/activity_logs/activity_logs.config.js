export const HEADER_ACTIONS = [
    {
        icon: 'fa-solid fa-download',
        text: 'Exportar página actual',
        action: 'vista.downloadActualTablePage',
        tipo: '2',
    }
]

export const TABLE_COLUMNS = [
    {
        id: 'createdAt',
        title: 'Fecha',
        type: 'datetime',
        format: 'datetime',
        width: '15rem',
        show: true,
        seek: true,
        sort: true,
        orden: 1,
    },
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
        orden: 2,
    },
    {
        id: 'method',
        title: 'Acción',
        type: 'text',
        width: '5rem',
        show: true,
        seek: false,
        sort: false,
        orden: 3,
    },
    {
        id: 'baseUrl',
        title: 'Recurso',
        type: 'text',
        width: '15rem',
        show: true,
        seek: false,
        sort: false,
        orden: 4,
    },
    {
        id: 'detail',
        title: 'Detalle',
        type: 'text',
        width: '15rem',
        show: true,
        seek: false,
        sort: false,
        orden: 5,
    },
]

export const TABLE_ROW_ACTIONS = []
