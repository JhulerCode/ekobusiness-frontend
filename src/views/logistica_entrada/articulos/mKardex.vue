<template>
    <JdModal modal="mKardex">
        <div class="header">
            <p>{{ modal.articulo.nombre }} ({{ modal.articulo.unidad }})</p>

            <div>
                <p>
                    <small>Stock:</small>
                    {{ redondear(modal.stock) }}
                </p>

                <p>
                    <small>Valor:</small>
                    {{ redondear(modal.valor) }}
                </p>
            </div>
        </div>

        <JdTable :columns="columns" :datos="modal.kardex || []" :reload="loadKardex" :colAct="true"
            :rowOptions="tableRowOptions" @rowOptionSelected="runMethod">
            <template v-slot:cTipo="{ item }">
                <i class="fa-solid fa-ban anulado" v-if="item.transaccion1.estado == 0"></i>
                {{ item.transaccion1.tipo1.nombre }}
            </template>
        </JdTable>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdTable from '@/components/JdTable.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'
import { redondear, getItemFromArray } from '@/utils/mine'

import dayjs from 'dayjs'

export default {
    components: {
        JdModal,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        redondear,
        getItemFromArray,
        dayjs,

        modal: {},
        // articulo: {},

        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                prop: 'transaccion1.fecha',
                format: 'date',
                width: '8rem',
                show: true,
                seek: true,
            },
            {
                id: 'tipo',
                title: 'Operación',
                prop: 'transaccion1.tipo1.nombre',
                slot: 'cTipo',
                width: '15rem',
                show: true,
                seek: true,
            },
            {
                id: 'lote',
                title: 'Lote',
                width: '8rem',
                show: true,
                seek: true,
            },
            {
                id: 'fv',
                title: 'Fecha vencimiento',
                format: 'date',
                width: '8rem',
                show: true,
                seek: true,
            },
            {
                id: 'pu_real',
                title: 'Pu',
                toRight: true,
                width: '8rem',
                show: true,
                seek: true,
            },
            {
                id: 'pu_igv',
                title: 'Vu',
                toRight: true,
                width: '8rem',
                show: true,
                seek: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                format: 'decimal',
                toRight: true,
                width: '8rem',
                show: true,
                seek: true,
            },
        ],
        tableRowOptions: [
            { label: 'Eliminar', icon: 'fa-regular fa-trash-can', action: 'eliminar', permiso: 'vArticulos_kardex' },
        ],
    }),
    async created() {
        this.modal = this.useModals.mKardex

        await this.loadKardex()
    },
    methods: {
        async loadKardex() {
            this.modal.kardex = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}/kardex/${this.modal.articulo.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.kardex = res.data
            this.calculateStock()
        },
        calculateStock() {
            this.modal.stock = 0
            this.modal.valor = 0

            for (const a of this.modal.kardex) {
                if (a.is_lote_padre && a.transaccion1.estado != 0) {
                    this.modal.stock += a.stock
                    this.modal.valor += a.stock * a.pu_real
                }
            }
        },

        runMethod(method, item) {
            this[method](item)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return
            
            const send = {
                id: item.transaccion1.id,
                tipo: item.transaccion1.tipo,
                estado: item.transaccion1.estado,
            }

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.transacciones, send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.loadKardex()
        }
    },
};
</script>

<style lang="scss" scoped>
.header {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    margin-bottom: 2rem;

    div {
        display: flex;
        gap: 1rem;
    }
}

.anulado {
    color: var(--rojo);
}
</style>