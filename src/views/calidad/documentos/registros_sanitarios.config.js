export default {
    name: 'vRegistrosSanitarios',
    title: 'Registros Sanitarios',
    apiPath: 'documentos',

    headerActions: [
        {
            text: 'Nuevo',
            action: 'nuevo',
            permiso: 'vRegistrosSanitarios:crear',
        },
        {
            icon: 'fa-solid fa-download',
            text: 'Exportar página actual',
            action: 'vista.downloadActualTablePage',
            tipo: '2',
        },
    ],

    tableColumns: [
        {
            id: 'id',
            title: 'id',
            type: 'text',
            width: '5rem',
            show: false,
            orden: 1,
        },
        {
            id: 'denominacion_legal',
            title: 'Denominación legal',
            type: 'text',
            width: '20rem',
            show: true,
            seek: true,
            orden: 2,
        },
        {
            id: 'denominacion_comercial',
            title: 'Denominación comercial',
            type: 'text',
            width: '20rem',
            show: true,
            seek: true,
            orden: 3,
        },
        {
            id: 'registro_sanitario',
            title: 'Registro sanitario',
            type: 'text',
            width: '12rem',
            show: true,
            seek: true,
            orden: 4,
        },
        {
            id: 'fecha_emision',
            title: 'Fecha de emisión',
            prop: 'fecha_emision1',
            type: 'date',
            width: '12rem',
            show: true,
            orden: 5,
        },
        {
            id: 'fecha_vencimiento',
            title: 'Fecha de vencimiento',
            prop: 'fecha_vencimiento1',
            type: 'date',
            width: '12rem',
            show: true,
            orden: 6,
        },
        {
            id: 'recordar_dias',
            title: 'Recordatorio',
            type: 'number',
            width: '8rem',
            show: true,
            orden: 7,
        },
        {
            id: 'estado',
            title: 'Estado',
            prop: 'estado1.nombre',
            type: 'select',
            format: 'estado',
            width: '10rem',
            show: true,
            orden: 8,
        },
    ],

    tableBulkActions: [
        {
            icon: 'fa-solid fa-trash-can',
            text: 'Eliminar',
            action: 'vista.eliminarBulk',
            permiso: 'vRegistrosSanitarios:eliminarBulk',
        },
    ],

    tableRowActions: [
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
            action: 'vista.eliminar',
            permiso: 'vRegistrosSanitarios:eliminar',
        },
    ],
}
