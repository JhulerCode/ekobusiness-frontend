export const HEADER_ACTIONS = [
    {
        text: 'Nuevo',
        action: 'nuevo',
        permiso: 'vRegistrosSanitarios:crear',
    },
]

export const TABLE_COLUMNS = [
    {
        id: 'denominacion_legal',
        title: 'Denominación legal',
        type: 'text',
        width: '20rem',
        show: true,
        seek: true,
        sort: true,
    },
    {
        id: 'denominacion_comercial',
        title: 'Denominación comercial',
        type: 'text',
        width: '20rem',
        show: true,
        seek: true,
        sort: true,
    },
    {
        id: 'registro_sanitario',
        title: 'Registro sanitario',
        type: 'date',
        width: '12rem',
        show: true,
        sort: true,
    },
    {
        id: 'fecha_emision',
        title: 'Fecha de emisión',
        type: 'date',
        format: 'date',
        width: '12rem',
        show: true,
        sort: true,
    },
    {
        id: 'fecha_vencimiento',
        title: 'Fecha de vencimiento',
        type: 'date',
        format: 'date',
        width: '12rem',
        show: true,
        sort: true,
    },
    {
        id: 'recordar_dias',
        title: 'Recordatorio',
        type: 'number',
        width: '8rem',
        show: true,
        sort: true,
    },
    {
        id: 'estado',
        title: 'Estado',
        prop: 'estado1.nombre',
        type: 'select',
        format: 'estado',
        width: '10rem',
        show: true,
        sort: true,
    },
]

export const TABLE_ROW_ACTIONS = [
    {
        label: 'Editar',
        icon: 'fa-solid fa-pen-to-square',
        action: 'editar',
        permiso: 'vRegistrosSanitarios:editar',
    },
    {
        label: 'Ver pdf',
        icon: 'fa-regular fa-file-pdf',
        action: 'verFile',
        permiso: 'vRegistrosSanitarios:editar',
        ocultar: { file_name: null },
    },
    {
        label: 'Eliminar',
        icon: 'fa-solid fa-trash-can',
        action: 'eliminar',
        permiso: 'vRegistrosSanitarios:eliminar',
    },
]
