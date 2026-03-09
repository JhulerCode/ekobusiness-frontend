export const HEADER_ACTIONS = [
    {
        text: 'Nuevo',
        action: 'nuevo',
        permiso: 'vArticuloCategorias:crear',
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
    },
    {
        id: 'is_destacado',
        title: 'Destacado?',
        prop: 'is_destacado1.nombre',
        type: 'select',
        format: 'yesno',
        width: '10rem',
        show: true,
        seek: false,
        sort: false,
    },
    {
        id: 'descripcion',
        title: 'Descripción',
        type: 'text',
        width: '20rem',
        show: true,
        seek: false,
        sort: false,
    },
]

export const TABLE_ROW_ACTIONS = [
    {
        label: 'Editar',
        icon: 'fa-solid fa-pen-to-square',
        action: 'editar',
        permiso: 'vArticuloCategorias:editar',
    },
    {
        label: 'Eliminar',
        icon: 'fa-solid fa-trash-can',
        action: 'eliminar',
        permiso: 'vArticuloCategorias:eliminar',
    },
    {
        label: 'Actualizar fotos',
        icon: 'fa-solid fa-image',
        action: 'openUploadFiles',
        permiso: 'vArticuloCategorias:actualizarFotos',
    },
]
