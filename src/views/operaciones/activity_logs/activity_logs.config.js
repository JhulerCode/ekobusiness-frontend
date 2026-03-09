export const HEADER_ACTIONS = []

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
    },
    {
        id: 'method',
        title: 'Acción',
        type: 'text',
        width: '5rem',
        show: true,
        seek: false,
        sort: false,
    },
    {
        id: 'baseUrl',
        title: 'Recurso',
        type: 'text',
        width: '15rem',
        show: true,
        seek: false,
        sort: false,
    },
    {
        id: 'detail',
        title: 'Detalle',
        type: 'text',
        width: '15rem',
        show: true,
        seek: false,
        sort: false,
    },
]

export const TABLE_ROW_ACTIONS = []
