<template>
    <div class="container-datos">
        <JdTable
            :columns="columns_bancos"
            :datos="vista.data.bancos || []"
            :rowOptions="rowActions"
            rowOptionsMode="buttons"
            @rowOptionSelected="runMethod"
            :inputsDisabled="vista.mode == 'view'"
            :agregarFila="vista.mode == 'view' ? null : addBanco"
            style="grid-column: 1/5"
        />
    </div>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { urls, get } from '@/utils/crud'

export default {
    name: 'vEmpresaBancos',
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        vista() {
            return this.vistas.vEmpresa
        },
        columns_bancos() {
            return [
                {
                    id: 'nombre',
                    title: 'Banco',
                    type: 'text',
                    input: {},
                    width: '20rem',
                    show: true,
                    sort: true,
                },
                {
                    id: 'moneda',
                    title: 'Moneda',
                    width: '8rem',
                    type: 'select_query',
                    input: {
                        search: this.loadMonedas,
                        selectedObjectProp: 'moneda1',
                    },
                    show: true,
                    sort: true,
                },
                {
                    id: 'nc',
                    title: 'Nro de cuenta (NC)',
                    type: 'text',
                    input: {},
                    width: '15rem',
                    show: true,
                    sort: true,
                },
                {
                    id: 'cci',
                    title: 'CCI',
                    type: 'text',
                    input: {},
                    width: '18rem',
                    show: true,
                    sort: true,
                },
                {
                    id: 'principal',
                    title: 'Principal',
                    type: 'check',
                    input: {},
                    width: '6rem',
                    show: true,
                },
            ]
        },
        rowActions() {
            if (this.vista.mode == 'view') return []
            return [
                {
                    icon: 'fa-solid fa-trash-can',
                    title: 'Eliminar',
                    action: 'removeBanco',
                },
            ]
        },
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        addBanco() {
            if (!this.vista.data.bancos) this.vista.data.bancos = []
            this.vista.data.bancos.push({
                nombre: '',
                moneda: null,
                nc: '',
                cci: '',
                principal: this.vista.data.bancos.length === 0,
                id: crypto.randomUUID(),
            })
        },
        removeBanco(item) {
            const index = this.vista.data.bancos.findIndex((b) => b.id == item.id)
            this.vista.data.bancos.splice(index, 1)
        },

        // --- Datos auxiliares ---
        async loadMonedas(txtBuscar) {
            const qry = {
                fltr: { activo: { op: 'Es', val: true } },
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
                limt: 25,
            }

            if (txtBuscar) {
                qry.fltr.nombre = { op: 'Contiene', val: txtBuscar }
            }

            const res = await get(`${urls.monedas}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return []

            return res.data
        },
    },
}
</script>
