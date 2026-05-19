export const FLEX_DIRECTIONS = [
    { id: 'row', nombre: 'Horizontal' },
    { id: 'column', nombre: 'Vertical' },
]

export const JUSTIFY_OPTIONS = [
    { id: 'flex-start', nombre: 'Inicio' },
    { id: 'center', nombre: 'Centro' },
    { id: 'flex-end', nombre: 'Fin' },
    { id: 'space-between', nombre: 'Espaciado' },
]

export const ALIGN_OPTIONS = [
    { id: 'stretch', nombre: 'Estirar' },
    { id: 'flex-start', nombre: 'Inicio' },
    { id: 'center', nombre: 'Centro' },
    { id: 'flex-end', nombre: 'Fin' },
]

export const BORDER_STYLE_OPTIONS = [
    { id: 'solid', nombre: 'Sólido' },
    { id: 'dashed', nombre: 'Guiones' },
    { id: 'dotted', nombre: 'Puntos' },
    { id: 'double', nombre: 'Doble' },
]

export const PAPER_SIZES = [
    { id: 'A4', nombre: 'A4 (210 x 297 mm)' },
    { id: 'LETTER', nombre: 'Carta (215.9 x 279.4 mm)' },
    { id: 'LEGAL', nombre: 'Oficio (215.9 x 355.6 mm)' },
]

export const ORIENTATIONS = [
    { id: 'portrait', nombre: 'Vertical' },
    { id: 'landscape', nombre: 'Horizontal' },
]

export const TEXT_ALIGN_OPTIONS = [
    { id: 'left', nombre: 'Izquierda' },
    { id: 'center', nombre: 'Centro' },
    { id: 'right', nombre: 'Derecha' },
    { id: 'justify', nombre: 'Justificado' },
]

export const TYPOGRAPHY_STYLES = ['fontSize', 'fontWeight', 'color', 'textAlign']

export const COMMON_STYLES = [
    'width',
    'height',
    'marginTop',
    'marginRight',
    'marginBottom',
    'marginLeft',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'backgroundColor',
    'borderStyle',
    'borderWidth',
    'borderColor',
    'borderRadius',
]

export const ORDER_ELEMENT_TYPES = ['DESIGN', 'TEXT', 'MEDIA', 'INPUTS']

export const ELEMENT_TYPES = [
    {
        type: 'input_text',
        group: 'INPUTS',
        label: 'Input Texto',
        icon: 'fas fa-font',
        allowedParents: ['document', 'group', 'grid'],
        propsFields: [
            { key: 'fieldId', label: 'ID del Campo (v-model)' },
            { key: 'label', label: 'Etiqueta' },
            {
                key: 'relatedPath',
                label: 'Propiedad Relacionada (Entidad)',
                placeholder: 'socio1.nombres',
            },
        ],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
        renderComponent: 'JdInput',
        inputType: 'text',
    },
    {
        type: 'input_number',
        group: 'INPUTS',
        label: 'Input Número',
        icon: 'fas fa-hashtag',
        allowedParents: ['document', 'group', 'grid'],
        propsFields: [
            { key: 'fieldId', label: 'ID del Campo (v-model)' },
            { key: 'label', label: 'Etiqueta' },
            { key: 'relatedPath', label: 'Propiedad Relacionada (Entidad)' },
        ],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
        renderComponent: 'JdInput',
        inputType: 'number',
    },
    {
        type: 'input_date',
        group: 'INPUTS',
        label: 'Input Fecha',
        icon: 'fas fa-calendar-alt',
        allowedParents: ['document', 'group', 'grid'],
        propsFields: [
            { key: 'fieldId', label: 'ID del Campo (v-model)' },
            { key: 'label', label: 'Etiqueta' },
            { key: 'relatedPath', label: 'Propiedad Relacionada (Entidad)' },
        ],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
        renderComponent: 'JdInput',
        inputType: 'date',
    },
    {
        type: 'input_time',
        group: 'INPUTS',
        label: 'Input Hora',
        icon: 'fas fa-clock',
        allowedParents: ['document', 'group', 'grid'],
        propsFields: [
            { key: 'fieldId', label: 'ID del Campo (v-model)' },
            { key: 'label', label: 'Etiqueta' },
            { key: 'relatedPath', label: 'Propiedad Relacionada (Entidad)' },
        ],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
        renderComponent: 'JdInput',
        inputType: 'time',
    },
    {
        type: 'input_longtext',
        group: 'INPUTS',
        label: 'Texto Largo',
        icon: 'fas fa-align-left',
        allowedParents: ['document', 'group', 'grid'],
        propsFields: [
            { key: 'fieldId', label: 'ID del Campo (v-model)' },
            { key: 'label', label: 'Etiqueta' },
            { key: 'relatedPath', label: 'Propiedad Relacionada (Entidad)' },
        ],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
        renderComponent: 'JdTextArea',
        inputType: 'longtext',
    },
    {
        type: 'input_select',
        group: 'INPUTS',
        label: 'Selector',
        icon: 'fas fa-list',
        allowedParents: ['document', 'group', 'grid'],
        propsFields: [
            { key: 'fieldId', label: 'ID del Campo (v-model)' },
            { key: 'label', label: 'Etiqueta' },
            { key: 'optionsKey', label: 'Key de Lista (Pinia)' },
        ],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
        styleLabelFields: TYPOGRAPHY_STYLES,
        styleValueFields: TYPOGRAPHY_STYLES,
        renderComponent: 'JdSelect',
        inputType: 'select',
    },
    {
        type: 'input_ref',
        group: 'INPUTS',
        label: 'Related',
        icon: 'fas fa-search',
        allowedParents: ['document', 'group', 'grid'],
        propsFields: [
            { key: 'fieldId', label: 'ID del Campo (v-model)' },
            { key: 'label', label: 'Etiqueta' },
            { key: 'searchUrl', label: 'URL de Búsqueda' },
            { key: 'searchField', label: 'Columna de Búsqueda', placeholder: 'nombre' },
            { key: 'mostrar', label: 'Propiedad a mostrar', placeholder: 'nombre' },
            { key: 'searchFltr', label: 'Filtros Extra (JSON)', placeholder: '{"activo":1}' },
            { key: 'searchCols', label: 'Columnas Extra (JSON)', placeholder: '["id", "nombre"]' },
            { key: 'searchOrdr', label: 'Orden (JSON)', placeholder: '[["id", "DESC"]]' },
            { key: 'searchLimt', label: 'Límite', placeholder: '25' },
        ],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
        styleLabelFields: TYPOGRAPHY_STYLES,
        styleValueFields: TYPOGRAPHY_STYLES,
        renderComponent: 'JdSelectQuery',
        inputType: 'ref',
    },

    {
        type: 'group',
        group: 'DESIGN',
        label: 'Grupo',
        icon: 'fas fa-layer-group',
        allowedParents: ['document', 'group', 'grid'],
        hasChildren: true,
        propsFields: [],
        styleFields: [
            'flexDirection',
            'justifyContent',
            'alignItems',
            'gap',
            'flex',
            ...COMMON_STYLES,
        ],
    },
    {
        type: 'grid',
        group: 'DESIGN',
        label: 'Cuadrícula',
        icon: 'fas fa-th',
        allowedParents: ['document', 'group', 'grid'],
        hasChildren: true,
        propsFields: [],
        styleFields: [
            'gridTemplateColumns',
            'gridTemplateRows',
            'justifyItems',
            'alignItems',
            'gap',
            ...COMMON_STYLES,
        ],
    },
    {
        type: 'h1',
        group: 'TEXT',
        label: 'Título 1',
        icon: 'fas fa-heading',
        allowedParents: ['document', 'group', 'grid'],
        propsFields: [{ key: 'content', label: 'Contenido', textarea: true }],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
    },
    {
        type: 'h2',
        group: 'TEXT',
        label: 'Título 2',
        icon: 'fas fa-heading',
        allowedParents: ['document', 'group', 'grid'],
        propsFields: [{ key: 'content', label: 'Contenido', textarea: true }],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
    },
    {
        type: 'h3',
        group: 'TEXT',
        label: 'Título 3',
        icon: 'fas fa-heading',
        allowedParents: ['document', 'group', 'grid'],
        propsFields: [{ key: 'content', label: 'Contenido', textarea: true }],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
    },
    {
        type: 'p',
        group: 'TEXT',
        label: 'Párrafo',
        icon: 'fas fa-paragraph',
        allowedParents: ['document', 'group', 'grid'],
        propsFields: [{ key: 'content', label: 'Contenido', textarea: true }],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
    },
    {
        type: 'small',
        group: 'TEXT',
        label: 'Small',
        icon: 'fas fa-minus',
        allowedParents: ['document', 'group', 'grid'],
        propsFields: [{ key: 'content', label: 'Contenido' }],
        styleFields: [...TYPOGRAPHY_STYLES, ...COMMON_STYLES],
    },
    {
        type: 'image',
        group: 'MEDIA',
        label: 'Imagen',
        icon: 'fas fa-image',
        allowedParents: ['document', 'group', 'grid'],
        propsFields: [{ key: 'src', label: 'URL Imagen' }],
        styleFields: COMMON_STYLES,
    },
]

export const STYLE_SECTIONS_LABELS = {
    layout: 'Layout',
    box: 'Dimensiones y Espaciado',
    border: 'Bordes y Fondo',
    typography: 'Tipografía',
    other: 'Otros',
    inputLabel: 'Estilo de Etiqueta (PDF)',
    inputValue: 'Estilo de Valor (PDF)',
}
