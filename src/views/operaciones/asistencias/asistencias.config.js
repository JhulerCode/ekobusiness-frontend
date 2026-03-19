export default {
    name: 'vAsistencias',
    title: 'Asistencias',
    apiPath: 'asistencias',

    headerActions: [
        {
            text: 'Nuevo',
            action: 'nuevo',
            permiso: 'vAsistencias:crear',
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
            seek: false,
            sort: false,
            orden: 1,
        },
        {
            id: 'colaborador',
            title: 'Colaborador',
            prop: 'colaborador1.nombres',
            type: 'related',
            relatedUrl: 'colaboradores',
            mostrar: 'nombres',
            width: '15rem',
            show: true,

            orden: 2,
        },
        {
            id: 'fecha_entrada',
            title: 'Fecha de entrada',
            prop: 'fecha_entrada1',
            type: 'date',
            width: '8rem',
            show: true,
            orden: 3,
        },
        {
            id: 'hora_entrada',
            title: 'Hora de entrada',
            type: 'time',
            width: '8rem',
            show: true,
            orden: 4,
        },
        {
            id: 'fecha_salida',
            title: 'Fecha de salida',
            prop: 'fecha_salida1',
            type: 'date',
            width: '8rem',
            show: true,
            orden: 5,
        },
        {
            id: 'hora_salida',
            title: 'Hora de salida',
            type: 'time',
            width: '8rem',
            show: true,
            orden: 6,
        },
    ],

    tableRowActions: [
        {
            label: 'Editar',
            icon: 'fa-solid fa-pen-to-square',
            action: 'editar',
            permiso: 'vAsistencias:editar',
        },
        {
            label: 'Eliminar',
            icon: 'fa-solid fa-trash-can',
            action: 'vista.eliminar',
            permiso: 'vAsistencias:eliminar',
        },
    ],
}
