export default {
    name: 'vDocumentos',
    title: 'Documentos clave',
    apiPath: 'documentos',

    headerActions: [
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
            id: 'nombre',
            title: 'Nombre',
            type: 'text',
            width: '20rem',
            show: true,

            orden: 2,
        },
        {
            id: 'fecha_emision',
            title: 'Fecha de emisión',
            prop: 'fecha_emision1',
            type: 'date',
            width: '12rem',
            show: true,
            orden: 3,
        },
        {
            id: 'fecha_vencimiento',
            title: 'Fecha de vencimiento',
            prop: 'fecha_vencimiento1',
            type: 'date',
            width: '12rem',
            show: true,
            orden: 4,
        },
        {
            id: 'recordar_dias',
            title: 'Recordatorio',
            type: 'number',
            width: '8rem',
            show: true,
            orden: 5,
        },
        {
            id: 'estado',
            title: 'Estado',
            prop: 'estado1.nombre',
            type: 'select',
            systemKey: 'documentos_estados',
            format: 'estado',
            color: 'estado1.color',
            width: '10rem',
            show: true,
            orden: 6,
        },
    ],

    tableBulkActions: [
        {
            icon: 'fa-solid fa-trash-can',
            text: 'Eliminar',
            action: 'vista.eliminarBulk',
            permiso: 'vDocumentos:eliminarBulk',
        },
    ],

    tableRowActions: [
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
    ],
}
