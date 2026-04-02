export default {
    apiPath: 'comprobantes',
    titleKey: 'serie_correlativo',
    pathKey: 'comprobante_id',
    permisoEditar: ['no'],
    permisoClonar: ['no'],
    permisoGuardarAvance: ['no'],

    headerActions: [
        {
            text: 'Exportar en PDF',
            icon: 'fa-regular fa-file-pdf',
            tipo: '2',
            action: 'generarPdf',
        },
    ],
}
