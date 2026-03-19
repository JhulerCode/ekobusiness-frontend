export default {
    name: 'vEmpresa',
    title: 'Mi empresa',
    titleKey: 'razon_social',
    apiPath: 'empresas',

    headerActions: [],

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
            id: 'ruc',
            title: 'RUC',
            type: 'text',
            show: true,
            orden: 2,
        },
        {
            id: 'razon_social',
            title: 'Razón Social',
            type: 'text',
            show: true,
            orden: 3,
        },
        {
            id: 'nombre_comercial',
            title: 'Nombre Comercial',
            type: 'text',
            show: true,
            orden: 4,
        },
    ],
}
