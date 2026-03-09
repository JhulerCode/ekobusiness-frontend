export const HEADER_ACTIONS = [
    {
        text: 'Nuevo',
        action: 'nuevo',
        permiso: 'vClientes:crear',
    },
]

export const TABLE_COLUMNS = [
    {
        id: 'doc_tipo',
        title: 'Tipo documento',
        prop: 'doc_tipo1.nombre',
        type: 'select',
        editable: true,
        width: '10rem',
        show: true,
        sort: true,
        orden: 1,
    },
    {
        id: 'doc_numero',
        title: 'Nro documento',
        type: 'text',
        width: '10rem',
        show: true,
        seek: true,
        sort: true,
        orden: 2,
    },
    {
        id: 'nombres',
        title: 'Razón social o nombres',
        type: 'text',
        width: '20rem',
        show: true,
        seek: true,
        sort: true,
        orden: 3,
    },
    {
        id: 'correo',
        title: 'E-mail',
        type: 'text',
        width: '10rem',
        show: true,
        seek: true,
        sort: false,
        orden: 4,
    },
    {
        id: 'telefono1',
        title: 'Teléfono',
        type: 'text',
        width: '10rem',
        show: true,
        seek: true,
        sort: false,
        orden: 5,
    },
    {
        id: 'activo',
        title: 'Activo?',
        prop: 'activo1.nombre',
        format: 'yesno',
        type: 'select',
        editable: true,
        width: '10rem',
        show: true,
        seek: false,
        sort: false,
        orden: 6,
    },
]

export const TABLE_BULK_ACTIONS = [
    { icon: 'fa-solid fa-pen-to-square', text: 'Editar', action: 'editarBulk' },
    { icon: 'fa-solid fa-trash-can', text: 'Eliminar', action: 'eliminarBulk' },
]

export const TABLE_ROW_ACTIONS = [
    {
        label: 'Ver',
        icon: 'fa-regular fa-folder-open',
        action: 'ver',
        permiso: 'vClientes:ver',
    },
    {
        label: 'Editar',
        icon: 'fa-solid fa-pen-to-square',
        action: 'editar',
        permiso: 'vClientes:editar',
    },
    {
        label: 'Eliminar',
        icon: 'fa-solid fa-trash-can',
        action: 'eliminar',
        permiso: 'vClientes:eliminar',
    },
]
