<template>
    <div class="container-datos">
        <JdTable
            :columns="columns_direcciones"
            :datos="vista.data.direcciones || []"
            :rowOptions="rowActions"
            rowOptionsMode="buttons"
            @rowOptionSelected="runMethod"
            :inputsDisabled="vista.mode == 'view'"
            :agregarFila="vista.mode == 'view' ? null : addDireccion"
            style="grid-column: 1/5"
        />
    </div>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

export default {
    name: 'vEmpresaDetalleDirecciones',
    computed: {
        auth: () => useAuth(),
        vistas: () => useVistas(),
        vista() {
            return this.vistas.vEmpresa
        },
        columns_direcciones() {
            return [
                {
                    id: 'nombre',
                    title: 'Nombre/Sede',
                    type: 'text',
                    input: true,
                    width: '15rem',
                    show: true,
                    sort: true,
                },
                {
                    id: 'direccion',
                    title: 'Dirección',
                    type: 'text',
                    input: true,
                    width: '25rem',
                    show: true,
                    sort: true,
                },
                {
                    id: 'ubigeo',
                    title: 'Ubigeo (Distrito - Prov - Dep)',
                    type: 'text',
                    input: true,
                    width: '20rem',
                    show: true,
                    sort: true,
                },
                {
                    id: 'principal',
                    title: 'Principal',
                    type: 'check',
                    input: true,
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
                    action: 'removeDireccion',
                },
            ]
        },
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        addDireccion() {
            if (!this.vista.data.direcciones) this.vista.data.direcciones = []
            this.vista.data.direcciones.push({
                nombre: '',
                direccion: '',
                ubigeo: '',
                principal: this.vista.data.direcciones.length === 0,
                id: crypto.randomUUID(),
            })
        },
        removeDireccion(item) {
            const i = this.vista.data.direcciones.findIndex((a) => a.id == item.id)
            this.vista.data.direcciones.splice(i, 1)
        },
    },
}
</script>
