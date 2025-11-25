<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Inventario</strong>

            <div class="buttons">
                <JdInput type="date" v-model="vista.f2" style="width: 10rem" />
                <JdButton
                    @click="loadInventario"
                    text="Buscar"
                    v-if="useAuth.verifyPermiso('vInventarioArticulos:listar')"
                />
            </div>
        </div>

        <JdTable :columns="columns" :datos="vista.inventario || []" />
    </div>
</template>

<script>
import { JdTable, JdInput, JdButton } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
import { redondear } from '@/utils/mine'

import dayjs from 'dayjs'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdTable,
        JdInput,
        JdButton,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        dayjs,
        redondear,

        vista: {},

        columns: [
            {
                id: 'nombre',
                title: 'Nombre',
                width: '30rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'categoria1.nombre',
                title: 'Categoría',
                width: '12rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'unidad',
                title: 'Unidad',
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Stock',
                format: 'number',
                toRight: true,
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vInventarioArticulos

        if (this.vista.loaded) return
    },
    methods: {
        checkDatos() {
            if (!this.vista.f2) {
                jmsg('error', 'Ingrese la fecha límite')
                return true
            }

            return false
        },
        setQuery() {
            this.vista.qry = {
                fltr: {
                    tipo: { op: 'Es', val: 1 },
                },
                incl: ['categoria1'],
                transaccion_items: {
                    f2: { op: 'Es', val: this.vista.f2 },
                },
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadInventario() {
            if (this.checkDatos()) return

            this.setQuery()

            this.vista.inventario = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}/inventario?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.inventario = res.data
        },
    },
}
</script>
