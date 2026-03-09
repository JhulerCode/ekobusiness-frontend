export const columns = [
    {
        id: 'nombre',
        title: 'Nombre',
        type: 'text',
        width: '15rem',
        show: true,
        seek: true,
        sort: true,
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
    },
    {
        id: 'velocidad',
        title: 'Velocidad (und/min)',
        type: 'number',
        width: '8rem',
        show: true,
        seek: true,
        sort: true,
    },
    {
        id: 'limpieza_tiempo',
        title: 'Tiempo de limpieza (min)',
        type: 'number',
        width: '8rem',
        show: true,
        seek: true,
        sort: true,
    },
]

export const tableRowOptions = [
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
        action: 'eliminar',
        permiso: 'vMaquinas:eliminar',
    },
]
