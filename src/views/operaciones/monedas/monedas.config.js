export const HEADER_ACTIONS = [
    {
        text: 'Nuevo',
        action: 'nuevo',
        permiso: 'vMonedas:crear',
    },
]

export const TABLE_COLUMNS = [
    {
        id: 'nombre',
        title: 'Nombre',
        type: 'text',
        width: '10rem',
        show: true,
        seek: true,
        sort: true,
    },
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
        id: 'simbolo',
        title: 'Símbolo',
        type: 'text',
        width: '5rem',
        show: true,
        seek: true,
        sort: true,
    },
    {
        id: 'plural',
        title: 'En plural',
        type: 'text',
        width: '10rem',
        show: true,
        seek: true,
        sort: true,
    },
]

export const TABLE_ROW_ACTIONS = [
    {
        id: 1,
        label: 'Editar',
        icon: 'fa-solid fa-pen-to-square',
        action: 'editar',
        permiso: 'vMonedas:editar',
    },
    {
        id: 2,
        label: 'Eliminar',
        icon: 'fa-solid fa-trash-can',
        action: 'eliminar',
        permiso: 'vMonedas:eliminar',
        ocultar: { estandar: true },
    },
    {
        id: 3,
        label: 'Tipos de cambio',
        icon: 'fa-solid fa-dollar-sign',
        action: 'openTiposCambio',
        permiso: 'vTipoCambios:listar',
        ocultar: { estandar: true },
    },
]
