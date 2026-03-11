<template>
    <JdModal
        modal="mTransaccionItemLotes"
        :buttons="buttons"
        @button-click="(action) => this[action]()"
    >
        <div class="container-agregar">
            <JdInput
                label="Artículo"
                v-model="modal.articulo1.nombre"
                :disabled="true"
                v-if="modal.articulo1.type != 'combo'"
            />

            <JdSelect
                label="Articulo"
                v-model="nuevo.articulo"
                :lista="modal.articulo1.combo_articulos || []"
                id="articulo"
                mostrar="articulo1.nombre"
                :loaded="modal.combo_articulosLoaded"
                @elegir="setNuevoArticulo"
                v-else
            />

            <JdSelect
                label="Lotes"
                v-model="nuevo.lote_padre"
                :lista="modal.lotes"
                mostrar="lote_fv_stock"
                :loaded="modal.lotesLoaded"
                @reload="loadLotes"
                @elegir="agregarLote"
            />

            <div class="resumen">
                <p>
                    <small>Requerido:</small>
                    {{ totalRequerido }}
                </p>

                <p>
                    <small>Cantidad:</small>
                    {{ totalCantidad }}
                </p>

                <p>
                    <small>Dif:</small>
                    {{ totalRequerido - totalCantidad }}
                </p>
            </div>
        </div>

        <JdTable
            :columns="columns"
            :datos="modal.kardexes || []"
            :colNro="false"
            :seeker="false"
            :colAct="true"
            :download="false"
            maxHeight="30rem"
        >
            <template v-slot:cAction="{ item }">
                <JdButton
                    :small="true"
                    tipo="2"
                    icon="fa-solid fa-trash-can"
                    title="Eliminar"
                    @click="quitar(item)"
                />
            </template>
        </JdTable>
    </JdModal>
</template>

<script>
import { JdModal, JdTable, JdButton, JdInput, JdSelect } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdTable,
        JdSelect,
        JdButton,
        JdInput,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        nuevo: {},

        buttons: [{ text: 'Agregar articulos', action: 'sendItems', spin: false, show: true }],

        columns: [
            {
                id: 'articulo',
                title: 'Artículo',
                prop: 'articulo1.nombre',
                width: '20rem',
                show: false,
            },
            {
                id: 'lote_padre',
                title: 'Lote | Fv | Stock',
                prop: 'lote_padre1.lote_fv_stock',
                width: '20rem',
                show: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                width: '8rem',
                input: true,
                type: 'number',
                toRight: true,
                show: true,
            },
        ],
    }),
    computed: {
        totalRequerido() {
            if (this.modal.articulo1.type != 'combo') {
                return this.modal.cantidad
            } else {
                return this.modal.articulo1.combo_articulos.reduce(
                    (sum, a) => sum + this.modal.cantidad * a.cantidad,
                    0,
                )
            }
        },
        totalCantidad() {
            return this.modal.kardexes.reduce((sum, a) => sum + (a.cantidad ?? 0), 0)
        },
    },
    async created() {
        this.modal = this.useModals.mTransaccionItemLotes

        this.setColumns()
        this.loadLotes()
    },
    methods: {
        async setColumns() {
            if (this.modal.articulo1.type == 'combo') {
                this.columns[0].show = true
                this.setNuevoArticulo(this.modal.articulo1.combo_articulos[0])
            }
        },

        setNuevoArticulo(item) {
            this.modal.lotes = []

            if (item == null) {
                this.nuevo.articulo = null
                return
            }

            this.nuevo.articulo = item.articulo
            this.nuevo.articulo1 = { ...item.articulo1 }
        },

        async loadLotes() {
            const qry = {
                incl: ['articulo1'],
                cols: [
                    // 'fecha',
                    // 'moneda',
                    // 'tipo_cambio',
                    // 'pu',
                    // 'igv_afectacion',
                    // 'igv_porcentaje',
                    'fv',
                    'lote',
                    'stock',
                    'lote_fv_stock',
                ],
                fltr: {
                    articulo: {
                        op: 'Es',
                        val:
                            this.modal.articulo1.type != 'combo'
                                ? this.modal.articulo
                                : this.nuevo.articulo,
                    },
                    is_lote_padre: { op: 'Es', val: true },
                },
                ordr: [
                    ['createdAt', 'DESC'],
                    ['lote', 'DESC'],
                    ['fv', 'DESC'],
                ],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            this.modal.lotesLoaded = false
            const res = await get(`${urls.kardex}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.modal.lotesLoaded = true

            if (res.code !== 0) return

            this.modal.lotes = res.data
        },
        agregarLote(item) {
            if (item.stock == 0) return jmsg('warning', 'Selecciona un lote con stock disponible')

            const i = this.modal.kardexes.findIndex((a) => a.lote_padre == item.id)
            if (i !== -1) return jmsg('warning', 'El lote ya está agregado')

            this.modal.kardexes.push({
                articulo1: { ...this.nuevo.articulo1 },

                articulo:
                    this.modal.articulo1.type != 'combo'
                        ? this.modal.articulo
                        : this.nuevo.articulo,
                lote_padre: item.id,
                lote_padre1: {
                    lote_fv_stock: item.lote_fv_stock,
                    stock: item.stock,
                },
            })

            this.nuevo.lote_padre = null
        },
        quitar(item) {
            this.modal.kardexes.splice(item.i, 1)
        },

        sendItems() {
            const items_fallados = this.modal.kardexes.some((a) => a.stock < a.cantidad)
            if (items_fallados) return jmsg('warning', 'Stock insuficiente en uno o más lotes')

            if (this.totalRequerido != this.totalCantidad) {
                return jmsg('warning', 'La cantidad ingresada no coincide con el total')
            }

            this.$emit('sendItems', {
                transaccion_item: this.modal.transaccion_item,
                kardexes: this.modal.kardexes,
            })

            this.useModals.show.mTransaccionItemLotes = false
        },
    },
}
</script>

<style lang="scss" scoped>
.container-agregar {
    display: grid;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.resumen {
    display: flex;
    justify-content: flex-end;
    gap: 2rem;
}
</style>
