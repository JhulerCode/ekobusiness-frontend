export default {
    name: 'vClientes',
    title: 'Clientes',
    apiPath: 'socios',

    headerActions: [
        {
            text: 'Nuevo',
            action: 'nuevo',
            permiso: 'vClientes:crear',
        },
    ],

    tableColumns: [
        {
            id: 'doc_tipo',
            title: 'Tipo documento',
            prop: 'doc_tipo1.nombre',
            type: 'select',
            systemKey: 'documentos_identidad',
            editable: true,
            width: '10rem',
            show: true,
            orden: 1,
        },
        {
            id: 'doc_numero',
            title: 'Nro documento',
            type: 'text',
            width: '10rem',
            show: true,
            seek: true,
            orden: 2,
        },
        {
            id: 'nombres',
            title: 'Razón social o nombres',
            type: 'text',
            width: '20rem',
            show: true,
            seek: true,
            orden: 3,
        },
        {
            id: 'correo',
            title: 'E-mail',
            type: 'text',
            width: '10rem',
            show: true,
            seek: true,
            orden: 4,
        },
        {
            id: 'telefono1',
            title: 'Teléfono',
            type: 'text',
            width: '10rem',
            show: true,
            seek: true,
            orden: 5,
        },
        {
            id: 'activo',
            title: 'Activo?',
            prop: 'activo1.nombre',
            type: 'select',
            systemKey: 'estados',
            format: 'estado',
            color: 'activo1.color',
            editable: true,
            width: '10rem',
            show: true,
            orden: 6,
        },
    ],

    tableBulkActions: [
        {
            icon: 'fa-solid fa-pen-to-square',
            text: 'Editar',
            action: 'editarBulk',
            permiso: 'vClientes:editarBulk',
        },
        {
            icon: 'fa-solid fa-trash-can',
            text: 'Eliminar',
            action: 'eliminarBulk',
            permiso: 'vClientes:eliminarBulk',
        },
    ],

    tableRowActions: [
        {
            label: 'Ver',
            icon: 'fa-regular fa-folder-open',
            action: 'ver',
            permiso: 'vClientes:ver',
        },
        {
            label: 'Editar',
            icon: 'fa-solid fa-pen-to-square',
            action: 'editar',
            permiso: 'vClientes:editar',
        },
    ],
}
