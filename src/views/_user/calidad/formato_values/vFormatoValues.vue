<template>
    <VistaLayout
        :key="$route.fullPath"
        :config="VIEW_CONFIG"
        :setQuery="setQuery"
        @runMethod="runMethod"
    />

    <!-- Modal para completar Valores -->
    <mFormatoValue
        v-if="modals?.show?.mFormatoValue"
        @created="vistas.addItem('vFormatoStructureValues', 'tableData', $event, 'first')"
    />
</template>

<script>
import mFormatoValue from '@/views/_user/calidad/formato_values/mFormatoValue.vue'

import { useSystem } from '@/pinia/system'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    components: {
        mFormatoValue,
    },
    data: () => ({
        dynamicColumns: [],
    }),
    computed: {
        system: () => useSystem(),
        auth: () => useAuth(),
        vistas: () => useVistas(),
        modals: () => useModals(),
        vista() {
            return this.vistas[this.$route.name]
        },
        VIEW_CONFIG() {
            return {
                apiPath: 'formato_values',
                headerActions: [
                    {
                        text: 'Nuevo',
                        action: 'nuevo',
                        permiso: 'vFormatoValues:crear',
                    },
                ],
                tableColumns: [
                    {
                        id: 'createdAt',
                        title: 'Creado el',
                        prop: 'createdAt1',
                        type: 'datetime',
                        width: '12rem',
                        show: true,
                    },
                    {
                        id: 'createdBy1.nombres',
                        title: 'Creado por',
                        prop: 'createdBy1.nombres',
                        type: 'text',
                        width: '12rem',
                        show: true,
                    },
                    ...this.dynamicColumns,
                ],
                tableRowActions: [
                    {
                        label: 'Ver',
                        icon: 'fa-solid fa-folder-open',
                        action: 'ver',
                        permiso: 'vFormatoValues:ver',
                    },
                    {
                        label: 'Eliminar',
                        icon: 'fa-solid fa-trash',
                        action: 'eliminar',
                        permiso: 'vFormatoValues:eliminar',
                    },
                ],
            }
        },
    },
    async created() {
        const sit = setInterval(() => {
            if (this.vista) {
                if (this.$route.params.formato_structure_id) this.loadFormatoStructure()
                clearInterval(sit)
            }
        }, 100)
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['formato_structure1', 'createdBy1'],
                page: this.vista.table_page,
            }

            if (this.$route.params.formato_structure_id) {
                this.vista.qry.fltr.formato_structure = {
                    op: 'Es',
                    val: this.$route.params.formato_structure_id,
                }
            }

            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)

            if (this.vista.qry.cols && !this.vista.qry.cols.includes('values')) {
                this.vista.qry.cols.push('values')
            }
        },

        //--- Header actions ---//
        async nuevo() {
            // Buscamos dinámicamente qué listas de Pinia necesitamos cargar
            const systemLists = []
            const findKeys = (blocks) => {
                if (!blocks) return
                blocks.forEach((b) => {
                    if (b.props?.optionsKey) systemLists.push(b.props.optionsKey)
                    if (b.children) findKeys(b.children)
                })
            }
            findKeys(this.vistas.vFormatoStructure.data.structure?.children || [])

            if (systemLists.length > 0) {
                await this.system.load(systemLists)
            }

            const send = {
                estructura: this.vistas.vFormatoStructure.data,
                listas: {},
                formato_value: {
                    formato_structure: this.$route.params.formato_structure_id,
                    values: {},
                },
            }

            // if (this.vistas.vFormatoStructure.data.entity) {
            //     send[this.vistas.vFormatoStructure.data.entity] =
            //         this.modal[this.vistas.vFormatoStructure.data.entity]
            //     send[this.vistas.vFormatoStructure.data.entity + '1'] =
            //         this.modal[this.vistas.vFormatoStructure.data.entity + '1']

            //     // También lo metemos en formato_value para persistencia
            //     send.formato_value[this.vistas.vFormatoStructure.data.entity] =
            //         this.modal[this.vistas.vFormatoStructure.data.entity]
            // }
            // console.log(this.system.data)
            for (const sl of systemLists) {
                send.listas[sl] = this.system.data[sl]
            }

            this.modals.setModal('mFormatoValue', '', 1, send, true)
        },

        //--- Row actions ---//
        async ver(row) {
            this.auth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.formato_values}/uno/${row.id}`, {
                incl: ['formato_structure1', 'createdBy1'],
            })
            this.auth.setLoading(false)

            if (res.code !== 0) return

            // Buscamos dinámicamente qué listas de Pinia necesitamos cargar
            const systemLists = []
            const findKeys = (blocks) => {
                if (!blocks) return
                blocks.forEach((b) => {
                    if (b.props?.optionsKey) systemLists.push(b.props.optionsKey)
                    if (b.children) findKeys(b.children)
                })
            }
            findKeys(this.vistas.vFormatoStructure.data.structure?.children || [])

            if (systemLists.length > 0) {
                await this.system.load(systemLists)
            }

            const send = {
                estructura: this.vistas.vFormatoStructure.data,
                listas: {},
                formato_value: res.data,
            }

            for (const sl of systemLists) {
                send.listas[sl] = this.system.data[sl]
            }

            this.modals.setModal('mFormatoValue', '', 3, send, true)
        },
        async eliminar(row) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.auth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.formato_values, row)
            this.auth.setLoading(false)

            if (res.code !== 0) return

            this.vistas.removeItem('vFormatoStructureValues', 'tableData', row)
        },

        //--- auxiliar data ---//
        async loadFormatoStructure() {
            const formato_structure_id = this.$route.params.formato_structure_id
            const vFormatoStructure = 'vFormatoStructure'

            this.vista.formato_structure = {}

            if (
                this.vistas[vFormatoStructure] &&
                this.vistas[vFormatoStructure].data &&
                this.vistas[vFormatoStructure].data.id == formato_structure_id
            ) {
                this.vista.formato_structure = this.vistas[vFormatoStructure].data
            } else {
                this.auth.setLoading(true, 'Cargando pedido...')
                const res = await get(
                    `${urls.formato_structures}/uno/${this.$route.params.formato_structure_id}`,
                )
                this.auth.setLoading(false)

                if (res.code !== 0 || !res.data) return this.auth.goBack(this.$router)

                this.vista.formato_structure = res.data

                this.vistas.initVista(vFormatoStructure, 'detail')
                this.vistas.updateVista(vFormatoStructure, {
                    apiPath: 'formato_structures',
                    pathKey: 'formato_structure_id',
                    titleKey: 'codigo',
                    permisoEditar: 'vFormatoStructures:editar',
                    permisoCrear: 'vFormatoStructures:crear',
                    fullWidth: true,
                    data: this.vista.formato_structure,
                    last_path: this.$router.resolve({
                        name: vFormatoStructure,
                        params: { formato_structure_id: this.vista.formato_structure.id },
                    }).path,
                })
            }

            this.processStructureColumns(this.vista.formato_structure.structure)

            // if (this.vista && typeof this.vista.loadTableData === 'function') {
            //     this.vista.loadTableData()
            // }
        },
        processStructureColumns(structure) {
            const cols = []
            const findInputs = (node) => {
                if (node.type && node.type.startsWith('input_') && node.props?.fieldId) {
                    cols.push({
                        id: `values_${node.props.fieldId}`,
                        prop: `values.${node.props.fieldId}`,
                        title: node.props.label || node.props.fieldId,
                        type: 'text',
                        width: '10rem',
                        show: true,
                    })
                }
                if (node.children) {
                    node.children.forEach(findInputs)
                }
            }
            if (structure) {
                findInputs(structure)
            }
            this.dynamicColumns = cols

            this.vista.tableColumns = [...this.VIEW_CONFIG.tableColumns]
        },
    },
}
</script>
