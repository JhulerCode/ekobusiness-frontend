export const columns = [
    {
        id: 'codigo',
        title: 'Código',
        type: 'text',
        width: '8rem',
        show: true,
        seek: true,
        sort: true,
    },
    {
        id: 'nombre',
        title: 'Nombre',
        type: 'text',
        width: '20rem',
        show: true,
        seek: true,
        sort: true,
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
    },
]

export const tableRowOptions = [
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
        action: 'eliminar',
        permiso: 'vEquipos:eliminar',
    },
]
