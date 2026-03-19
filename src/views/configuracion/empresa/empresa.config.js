export default {
    name: 'vEmpresa',
    title: 'Mi Empresa',
    apiPath: 'empresas',

    headerActions: [
        {
            text: 'Editar',
            action: 'editar',
            icon: 'fa-solid fa-pen-to-square',
            permiso: 'vEmpresa:editar',
            show: true,
        },
        {
            text: 'Cancelar',
            action: 'cancelar',
            icon: 'fa-solid fa-xmark',
            tipo: '2',
            show: false,
        },
        {
            text: 'Guardar',
            action: 'guardar',
            icon: 'fa-solid fa-floppy-disk',
            show: false,
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
