export const COLUMNS = [
    {
        id: 'doc_tipo',
        title: 'Tipo documento',
        prop: 'doc_tipo1.nombre',
        type: 'select',
        editable: true,
        width: '10rem',
        show: true,
        seek: true,
        sort: true,
    },
    {
        id: 'doc_numero',
        title: 'Nro documento',
        type: 'text',
        width: '10rem',
        show: true,
        seek: true,
        sort: true,
    },
    {
        id: 'nombres',
        title: 'Razón social o nombres',
        type: 'text',
        width: '20rem',
        show: true,
        seek: true,
        sort: true,
    },
    {
        id: 'correo',
        title: 'E-mail',
        type: 'text',
        width: '10rem',
        show: true,
        seek: true,
        sort: false,
    },
    {
        id: 'telefono1',
        title: 'Teléfono',
        type: 'text',
        width: '10rem',
        show: true,
        seek: true,
        sort: false,
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
    },
]

export const TABLE_ACTIONS = [
    {
        icon: 'fa-solid fa-pen-to-square',
        text: 'Editar',
        action: 'editarBulk',
        permiso: 'vProveedores:editarBulk',
    },
    {
        icon: 'fa-solid fa-trash-can',
        text: 'Eliminar',
        action: 'eliminarBulk',
        permiso: 'vProveedores:eliminarBulk',
    },
]

export const TABLE_ROW_OPTIONS = [
    {
        label: 'Ver',
        icon: 'fa-regular fa-folder-open',
        action: 'ver',
        permiso: 'vProveedores:ver',
    },
    {
        label: 'Editar',
        icon: 'fa-solid fa-pen-to-square',
        action: 'editar',
        permiso: 'vProveedores:editar',
    },
    {
        label: 'Eliminar',
        icon: 'fa-solid fa-trash-can',
        action: 'eliminar',
        permiso: 'vProveedores:eliminar',
    },
]
