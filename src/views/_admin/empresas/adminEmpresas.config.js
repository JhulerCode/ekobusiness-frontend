export default {
    name: 'vAdminEmpresas',
    title: 'Empresas',
    apiPath: 'empresas',
    detailViewName: 'vAdminSuscripciones',
    detailPath: 'empresa_id',

    headerActions: [
        {
            text: 'Nuevo',
            action: 'nuevo',
            permiso: 'vAdminEmpresas:crear',
        },
    ],

    tableColumns: [
        {
            id: 'id',
            title: 'id',
            type: 'text',
            width: '3rem',
            show: false,
            orden: 1,
        },
        {
            id: 'razon_social',
            title: 'Razón Social / Nombre',
            type: 'text',
            width: '20rem',
            show: true,
            orden: 2,
        },
        {
            id: 'ruc',
            title: 'RUC',
            type: 'text',
            width: '10rem',
            show: true,
            orden: 3,
        },
        {
            id: 'subdominio',
            title: 'Subdominio',
            type: 'text',
            width: '10rem',
            show: true,
            orden: 4,
        },
        {
            id: 'correo',
            title: 'Correo',
            type: 'text',
            width: '15rem',
            show: true,
            orden: 5,
        },
        {
            id: 'telefono',
            title: 'Teléfono',
            type: 'text',
            width: '10rem',
            show: true,
            orden: 6,
        },
    ],

    tableRowActions: [],
}
