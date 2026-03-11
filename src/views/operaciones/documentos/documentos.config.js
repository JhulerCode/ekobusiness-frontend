export const HEADER_ACTIONS = [
    {
        text: 'Nuevo',
        action: 'nuevo',
        permiso: 'vDocumentos:crear',
    },
    {
        icon: 'fa-solid fa-download',
        text: 'Exportar página actual',
        action: 'vista.downloadActualTablePage',
        tipo: '2',
    }
]

export const TABLE_COLUMNS = [
    {
        id: 'nombre',
        title: 'Nombre',
        type: 'text',
        width: '20rem',
        show: true,
        seek: true,
        sort: true,
        orden: 1,
    },
    {
        id: 'fecha_emision',
        title: 'Fecha de emisión',
        type: 'date',
        format: 'date',
        width: '12rem',
        show: true,
        seek: true,
        sort: true,
        orden: 2,
    },
    {
        id: 'fecha_vencimiento',
        title: 'Fecha de vencimiento',
        type: 'date',
        format: 'date',
        width: '12rem',
        show: true,
        seek: true,
        sort: true,
        orden: 3,
    },
    {
        id: 'recordar_dias',
        title: 'Recordatorio',
        type: 'number',
        width: '8rem',
        show: true,
        seek: true,
        sort: true,
        orden: 4,
    },
    {
        id: 'estado',
        title: 'Estado',
        prop: 'estado1.nombre',
        type: 'select',
        format: 'estado',
        width: '10rem',
        show: true,
        seek: true,
        sort: true,
        orden: 5,
    },
]

export const TABLE_ROW_ACTIONS = [
    {
        label: 'Editar',
        icon: 'fa-solid fa-pen-to-square',
        action: 'editar',
        permiso: 'vDocumentos:editar',
    },
    {
        label: 'Ver pdf',
        icon: 'fa-regular fa-file-pdf',
        action: 'verFile',
        permiso: 'vRegistrosSanitarios:editar',
        ocultar: { file: {} },
    },
    {
        label: 'Eliminar',
        icon: 'fa-solid fa-trash-can',
        action: 'vista.eliminar',
        permiso: 'vDocumentos:eliminar',
    },
]
