<template>
    <JdModal
        modal="mTrasladoItemLotes"
        :buttons="buttons"
        @button-click="(action) => this[action]()"
    >
        <div class="container-agregar">
            <!-- <JdInput label="Artículo" v-model="modal.articulo1.nombre" :disabled="true" /> -->
            <span>{{ modal.articulo1.nombre }}</span>

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
            :rowOptions="rowActions"
            rowOptionsMode="buttons"
            @rowOptionSelected="runMethod"
            :agregarFila="addKardex"
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
            if (this.modal.articulo1.type == 'combo') {
                if (!this.modal.combo_componentes) return 0

                return this.modal.combo_componentes.reduce(
                    (sum, a) => sum + this.modal.cantidad * a.cantidad,
                    0,
                )
            } else {
                return this.modal.cantidad
            }
        },
        totalCantidad() {
            if (!this.modal.kardexes) return 0
            return this.modal.kardexes.reduce((sum, a) => sum + (a.cantidad ?? 0), 0)
        },
        columns() {
            return [
                {
                    id: 'componente',
                    title: 'Componente',
                    width: '20rem',
                    type: 'select',
                    input: {
                        lista: this.modal.combo_componentes,
                        mostrar: 'articulo1.nombre',
                        reload: this.loadComboComponentes,
                        elegir: this.setComponente,
                    },
                    show: this.modal.type == 'old' && this.modal.articulo1.type == 'combo',
                },
                {
                    id: 'lote_id',
                    title: 'Lote | Fv | Stock',
                    width: '22rem',
                    type: 'select_query',
                    input: {
                        search: this.loadLotes,
                        mostrar: 'codigo_fv_stock',
                        selectedObjectProp: 'lote1',
                        elegir: this.elegirLote,
                    },
                    show: this.modal.type == 'old',
                },
                {
                    id: 'lote1.codigo',
                    title: 'Lote',
                    width: '12rem',
                    input: {},
                    type: 'text',
                    show: this.modal.type == 'new',
                },
                {
                    id: 'lote1.fv',
                    title: 'F.v.',
                    width: '12rem',
                    input: {},
                    type: 'date',
                    show: this.modal.type == 'new' && this.modal.articulo1.has_fv,
                },
                {
                    id: 'cantidad',
                    title: 'Cantidad',
                    prop: 'cantidad',
                    width: '10rem',
                    input: {},
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
        this.modal = this.useModals.mTrasladoItemLotes

        if (this.modal.articulo1.type == 'combo') {
            this.loadComboComponentes()
        }
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },

        //--- Methods ---//
        addKardex() {
            if (this.modal.type == 'new') {
                this.modal.kardexes.push({
                    id: crypto.randomUUID(),
                    lote1: {
                        codigo: `${obtenerNumeroJuliano(this.modal.fecha)}-${Math.floor(Math.random() * 90 + 10)}`,
                    },
                    articulo: this.modal.articulo,
                })
            } else {
                this.modal.kardexes.push({
                    id: crypto.randomUUID(),
                    articulo: this.modal.articulo1.type == 'combo' ? null : this.modal.articulo,
                })
            }
        },
        quitar(item) {
            const i = this.modal.kardexes.findIndex((a) => a.id == item.id)
            this.modal.kardexes.splice(i, 1)
        },
        elegirLote(data, item) {
            const i = this.modal.kardexes.findIndex((a) => a.id == item.id)

            if (!data) {
                this.modal.kardexes[i].lote1 = null
                return
            }

            this.modal.kardexes[i].lote1 = data
        },
        setComponente(data, item) {
            const i = this.modal.kardexes.findIndex((a) => a.id == item.id)
            this.modal.kardexes[i].articulo = data.articulo1.id
            this.modal.kardexes[i].articulo1 = data.articulo1
        },
        sendItems() {
            let fila = 1
            for (const a of this.modal.kardexes) {
                if (this.modal.type == 'old') {
                    if (!a.lote1)
                        return jmsg('warning', `Falta seleccionar lote en la fila ${fila}`)

                    if (a.lote1.lote_stock < a.cantidad) {
                        return jmsg('warning', `Stock insuficiente en la fila ${fila}`)
                    }
                }

                if (this.modal.type == 'new') {
                    if (!a.lote1.codigo)
                        return jmsg('warning', `Falta codigo de lote en la fila ${fila}`)

                    if (this.modal.articulo1.has_fv && !a.lote1.fv) {
                        return jmsg('warning', `Falta fecha de vencimiento en la fila ${fila}`)
                    }
                }

                fila++
            }

            if (this.totalRequerido != this.totalCantidad) {
                return jmsg('warning', 'La cantidad ingresada no coincide con el requerido')
            }

            this.$emit('sendItems', {
                transaccion_item_id: this.modal.transaccion_item_id,
                kardexes: this.modal.kardexes,
            })

            this.useModals.show.mTrasladoItemLotes = false
        },

        //--- Auxiliar data ---//
        async loadLotes(txt, item) {
            const qry = {
                incl: ['kardexes_for_sqls'],
                cols: ['codigo', 'fv', 'codigo_fv_stock'],
                sqls: ['lote_stock'],
                fltr: {
                    articulo: { op: 'Es', val: item.articulo },
                },
                grop: ['id'],
                ordr: [
                    ['createdAt', 'DESC'],
                    ['codigo', 'DESC'],
                    ['fv', 'DESC'],
                ],
                limt: 25,
            }

            if (txt) {
                qry.fltr.codigo = { op: 'Contiene', val: txt }
            }

            const res = await get(`${urls.lotes}?qry=${JSON.stringify(qry)}`)

            if (res.code !== 0) return

            return res.data
        },
        async loadComboComponentes() {
            const qry = {
                cols: ['orden', 'cantidad'],
                incl: ['articulo1'],
                fltr: {
                    articulo_principal: {
                        op: 'Es',
                        val: this.modal.articulo,
                    },
                },
                ordr: [['orden', 'ASC']],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            this.modal.lotesLoaded = false
            const res = await get(`${urls.combo_componentes}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.modal.lotesLoaded = true

            if (res.code !== 0) return

            this.modal.combo_componentes = res.data
        },
    },
}
</script>

<style lang="scss" scoped>
.resumen {
    display: flex;
    justify-content: flex-end;
    gap: 2rem;
    margin: 1rem 0;
}
</style>
