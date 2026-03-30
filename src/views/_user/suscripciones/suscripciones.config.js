export default {
    apiPath: 'suscripciones',

    headerActions: [
        {
            text: 'Nuevo',
            action: 'nuevo',
            permiso: 'vAdminSuscripciones:crear',
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
            id: 'empresa',
            title: 'Cliente',
            prop: 'empresa1.razon_social',
            type: 'text',
            width: '15rem',
            show: true,
            orden: 2,
        },
        {
            id: 'plan_nombre',
            title: 'Plan',
            type: 'text',
            width: '10rem',
            show: true,
            orden: 3,
        },
        {
            id: 'fecha_inicio',
            title: 'Inicio',
            prop: 'fecha_inicio1',
            type: 'text',
            width: '8rem',
            show: true,
            orden: 4,
        },
        {
            id: 'fecha_vencimiento',
            title: 'Vencimiento',
            prop: 'fecha_vencimiento1',
            type: 'text',
            width: '8rem',
            show: true,
            orden: 5,
        },
        {
            id: 'estado',
            title: 'Estado',
            prop: 'estado1.nombre',
            type: 'select',
            systemKey: 'suscripcion_estados',
            format: 'estado',
            color: 'estado1.color',
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
            permiso: 'vAdminSuscripciones:editar',
        },
    ],
}
