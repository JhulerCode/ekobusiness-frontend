export default {
    name: 'vHelpdeskTickets',
    title: 'Soporte al cliente',
    apiPath: 'helpdesk_tickets',

    headerActions: [
        {
            text: 'Nuevo',
            action: 'nuevo',
            permiso: 'vHelpdeskTickets:crear',
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
            id: 'nombre',
            title: 'Nombre',
            type: 'text',
            width: '10rem',
            show: true,

            orden: 1,
        },
        {
            id: 'descripcion',
            title: 'Descripción',
            type: 'text',
            width: '15rem',
            show: true,

            orden: 2,
        },
        {
            id: 'socio',
            title: 'Cliente',
            prop: 'socio1.nombres',
            type: 'related',
            relatedUrl: 'socios',
            mostrar: 'nombres',
            width: '15rem',
            show: true,

            orden: 3,
        },
        {
            id: 'articulo',
            title: 'Producto',
            prop: 'articulo1.nombre',
            type: 'related',
            relatedUrl: 'articulos',
            width: '15rem',
            show: true,

            orden: 4,
        },
        {
            id: 'reclamo_fecha',
            title: 'Fecha de reclamo',
            prop: 'reclamo_fecha1',
            type: 'date',
            width: '10rem',
            show: true,
            orden: 5,
        },
        {
            id: 'reclamo_fuente',
            title: 'Fuente de reclamo',
            type: 'text',
            width: '10rem',
            show: true,

            orden: 6,
        },
        {
            id: 'createdAt',
            title: 'Creado el',
            format: 'datetime',
            type: 'datetime',
            width: '10rem',
            show: true,
            orden: 7,
        },
        {
            id: 'createdBy',
            title: 'Creado por',
            prop: 'createdBy1.nombres',
            type: 'related',
            relatedUrl: 'colaboradores',
            mostrar: 'nombres',
            width: '10rem',
            show: true,

            orden: 8,
        },
    ],

    tableRowActions: [
        {
            label: 'Editar',
            icon: 'fa-solid fa-pen-to-square',
            action: 'editar',
            permiso: 'vHelpdeskTickets:editar',
        },
        {
            label: 'Eliminar',
            icon: 'fa-solid fa-trash-can',
            action: 'vista.eliminar',
            permiso: 'vHelpdeskTickets:eliminar',
            ocultar: { estandar: true },
        },
    ],
}
