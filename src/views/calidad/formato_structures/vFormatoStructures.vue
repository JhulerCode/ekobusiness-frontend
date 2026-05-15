<template>
    <VistaLayout
        :key="$route.fullPath"
        :config="VIEW_CONFIG"
        :setQuery="setQuery"
        @runMethod="runMethod"
    />
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

export default {
    data: () => ({
        auth: useAuth(),
        vistas: useVistas(),
    }),
    computed: {
        vista() {
            return this.vistas[this.$route.name]
        },
        VIEW_CONFIG() {
            return {
                apiPath: 'formato_structures',
                detailViewName: 'vFormatoStructure',
                detailPath: 'formato_structure_id',
                headerActions: [
                    {
                        text: 'Nuevo',
                        action: 'nuevo',
                        permiso: 'vFormatoStructures:crear',
                    },
                ],
                tableRowActions: [],
                tableColumns: [
                    {
                        id: 'codigo',
                        title: 'Código',
                        type: 'text',
                        width: '10rem',
                        show: true,
                        seek: true,
                    },
                    {
                        id: 'nombre',
                        title: 'Nombre',
                        type: 'text',
                        width: '40rem',
                        show: true,
                        seek: true,
                    },
                ],
            }
        },
    },
    methods: {
        runMethod(action, item) {
            this[action](item)
        },
        setQuery() {
            this.vista.qry = {
                fltr: {},
                page: this.vista.table_page,
            }
            this.auth.updateQuery(this.vista.tableColumns, this.vista.qry)
        },

        //--- Header actions ---//
        nuevo() {
            this.$router.push({
                name: 'vFormatoStructure',
                params: { formato_structure_id: 'nuevo' },
            })
        },

        //--- Row actions ---//
        async editar(item) {
            this.$router.push({
                name: 'vFormatoStructure',
                params: { formato_structure_id: item.id },
            })
        },
    },
}
</script>
