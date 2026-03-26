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

            <!-- <JdSelect
                label="Lotes"
                v-model="nuevo.lote_padre"
                :lista="modal.lotes"
                mostrar="lote_fv_stock"
                :loaded="modal.lotesLoaded"
                @reload="loadLotes"
                @elegir="agregarLote"
            /> -->

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
            :datos="modal.lotes || []"
            :colNro="false"
            :rowOptions="rowActions"
            rowOptionsMode="buttons"
            @rowOptionSelected="runMethod"
            :agregarFila="addLote"
        />
    </JdModal>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
import { jmsg } from '@/utils/swal'
import { obtenerNumeroJuliano } from '@/utils/mine'

export default {
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        nuevo: {},

        buttons: [{ text: 'Agregar articulos', action: 'sendItems', spin: false, show: true }],
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
            return this.modal.lotes.reduce((sum, a) => sum + (a.cantidad ?? 0), 0)
        },
        columns() {
            return [
                {
                    id: 'articulo',
                    title: 'Artículo',
                    prop: 'articulo1.nombre',
                    width: '20rem',
                    show: this.modal.articulo1.type == 'combo',
                },
                {
                    id: 'componente',
                    title: 'Componente',
                    prop: 'componente1.nombre',
                    width: '20rem',
                    input: true,
                    select: {
                        lista: this.modal.lotes,
                        mostrar: 'componente1.nombre',
                        reload: this.loadLotes,
                    },
                    show: this.modal.type == 'old' && this.modal.articulo1.type == 'combo',
                },
                {
                    id: 'lote_padre',
                    title: 'Lote | Fv | Stock',
                    prop: 'lote_padre1.lote_fv_stock',
                    width: '20rem',
                    input: true,
                    select: {
                        lista: this.modal.lotes,
                        mostrar: 'lote_fv_stock',
                        reload: this.loadLotes,
                    },
                    show: this.modal.type == 'old',
                },
                {
                    id: 'codigo',
                    title: 'Lote',
                    width: '12rem',
                    input: true,
                    type: 'text',
                    show: this.modal.type == 'new',
                },
                {
                    id: 'fv',
                    title: 'F.v.',
                    width: '12rem',
                    input: true,
                    type: 'date',
                    show: this.modal.type == 'new' && this.modal.articulo1.has_fv,
                },
                {
                    id: 'cantidad',
                    title: 'Cantidad',
                    width: '10rem',
                    input: true,
                    type: 'number',
                    toRight: true,
                    show: true,
                },
            ]
        },
        rowActions() {
            return [
                {
                    icon: 'fa-solid fa-trash-can',
                    title: 'Eliminar',
                    action: 'quitar',
                },
            ]
        },
    },
    async created() {
        this.modal = this.useModals.mTransaccionItemLotes

        if (this.modal.articulo1.type == 'combo') {
            this.setNuevoArticulo(this.modal.articulo1.combo_articulos[0])
        }
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
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

        //--- Methods ---//
        addLote() {
            if (this.modal.type == 'new') {
                this.modal.lotes.push({
                    id: crypto.randomUUID(),
                    codigo: `${obtenerNumeroJuliano(this.modal.fecha)}-${Math.floor(Math.random() * 90 + 10)}`,
                })
            } else {
                this.modal.lotes.push({
                    id: crypto.randomUUID(),
                })
            }
        },
        // agregarLote(item) {
        //     if (item.stock == 0) return jmsg('warning', 'Selecciona un lote con stock disponible')

        //     const i = this.modal.lotes.findIndex((a) => a.lote_padre == item.id)
        //     if (i !== -1) return jmsg('warning', 'El lote ya está agregado')

        //     this.modal.lotes.push({
        //         articulo1: { ...this.nuevo.articulo1 },

        //         articulo:
        //             this.modal.articulo1.type != 'combo'
        //                 ? this.modal.articulo
        //                 : this.nuevo.articulo,
        //         lote_padre: item.id,
        //         lote_padre1: {
        //             lote_fv_stock: item.lote_fv_stock,
        //             stock: item.stock,
        //         },
        //     })

        //     this.nuevo.lote_padre = null
        // },
        quitar(item) {
            const i = this.modal.lotes.findIndex((a) => a.id == item.id)
            this.modal.lotes.splice(i, 1)
        },
        sendItems() {
            if (this.modal.type == 'old') {
                const items_fallados = this.modal.lotes.some((a) => a.stock < a.cantidad)
                if (items_fallados) return jmsg('warning', 'Stock insuficiente en uno o más lotes')
            }

            if (this.modal.type == 'new') {
                for (const a of this.modal.lotes) {
                    if (!a.codigo) return jmsg('warning', 'Falta codigo de lote')
                    if (this.modal.articulo1.has_fv && !a.fv) {
                        return jmsg('warning', 'Falta fecha de vencimiento')
                    }
                }
            }

            if (this.totalRequerido != this.totalCantidad) {
                return jmsg('warning', 'La cantidad ingresada no coincide con el total')
            }

            this.$emit('sendItems', {
                transaccion_item_id: this.modal.transaccion_item_id,
                lotes: this.modal.lotes,
            })

            this.useModals.show.mTransaccionItemLotes = false
        },

        //--- Auxiliar data ---//
        async loadLotes() {
            const qry = {
                cols: [
                    'codigo',
                    'fv',
                    'stock',
                    // 'lote_fv_stock',
                ],
                fltr: {
                    articulo: {
                        op: 'Es',
                        val:
                            this.modal.articulo1.type != 'combo'
                                ? this.modal.articulo
                                : this.nuevo.articulo,
                    },
                    // is_lote_padre: { op: 'Es', val: true },
                },
                ordr: [
                    ['createdAt', 'DESC'],
                    ['codigo', 'DESC'],
                    ['fv', 'DESC'],
                ],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            this.modal.lotesLoaded = false
            const res = await get(`${urls.lotes}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.modal.lotesLoaded = true

            if (res.code !== 0) return

            this.modal.lotes = res.data
        },
    },
}
</script>

<style lang="scss" scoped>
// .container-agregar {
//     display: grid;
//     gap: 0.5rem;
// }

.resumen {
    display: flex;
    justify-content: flex-end;
    gap: 2rem;
    margin: 1rem 0;
}
</style>
