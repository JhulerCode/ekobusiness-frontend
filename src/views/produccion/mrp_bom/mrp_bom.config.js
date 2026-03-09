export const COLUMNS = [
    {
        id: 'articulo',
        title: 'Producto',
        prop: 'articulo1.nombre',
        type: 'text',
        width: '30rem',
        show: true,
        seek: true,
        sort: true,
    },
    {
        id: 'tipo',
        title: 'Tipo',
        type: 'select',
        prop: 'tipo1.nombre',
        width: '8rem',
        show: true,
        seek: true,
        sort: true,
    },
]

export const TABLE_ROW_OPTIONS = [
    {
        label: 'Editar',
        icon: 'fa-solid fa-pen-to-square',
        action: 'editar',
        permiso: 'vMrpBom:editar',
    },
    {
        label: 'Eliminar',
        icon: 'fa-solid fa-trash-can',
        action: 'eliminar',
        permiso: 'vMrpBom:eliminar',
    },
    {
        label: 'Clonar',
        icon: 'fa-solid fa-copy',
        action: 'clonar',
        permiso: 'vMrpBom:editar',
    },
]
