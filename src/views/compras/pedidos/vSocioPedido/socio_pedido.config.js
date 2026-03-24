export default {
    name: 'vSocioPedido',
    apiPath: 'socio_pedidos',

    headerActions: [
        {
            text: 'Exportar PDF',
            icon: 'fa-regular fa-file-pdf',
            tipo: '2',
            action: 'generarPdf',
            show: true,
        },
    ],
}
