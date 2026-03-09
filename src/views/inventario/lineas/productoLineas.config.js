export const HEADER_ACTIONS = [
    {
        text: 'Nuevo',
        action: 'nuevo',
        permiso: 'vProductoLineas:crear',
    },
]

export const TABLE_COLUMNS = [
    {
        id: 'nombre',
        title: 'Nombre',
        type: 'text',
        width: '15rem',
        show: true,
        seek: true,
        sort: true,
        orden: 1,
    },
    {
        id: 'activo',
        title: 'Activo?',
        prop: 'activo1.nombre',
        type: 'select',
        format: 'yesno',
        width: '10rem',
        show: true,
        seek: false,
        sort: false,
        orden: 2,
    },
    {
        id: 'is_ecommerce',
        title: 'Ecommerce?',
        prop: 'is_ecommerce1.nombre',
        type: 'select',
        format: 'yesno',
        width: '10rem',
        show: true,
        seek: false,
        sort: false,
        orden: 3,
    },
    {
        id: 'descripcion',
        title: 'Descripción',
        type: 'text',
        width: '20rem',
        show: true,
        seek: false,
        sort: false,
        orden: 4,
    },
]

export const TABLE_ROW_ACTIONS = [
    {
        label: 'Editar',
        icon: 'fa-solid fa-pen-to-square',
        action: 'editar',
        permiso: 'vProductoLineas:editar',
    },
    {
        label: 'Eliminar',
        icon: 'fa-solid fa-trash-can',
        action: 'eliminar',
        permiso: 'vProductoLineas:eliminar',
    },
    {
        label: 'Actualizar fotos',
        icon: 'fa-solid fa-image',
        action: 'openUploadFiles',
        permiso: 'vProductoLineas:actualizarFotos',
    },
]
