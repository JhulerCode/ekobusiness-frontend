<template>
    <article class="jd-table" :style="{ height: height, maxHeight: maxHeight, width: width }">
        <div
            class="container-top"
            v-if="
                seeker ||
                actions.length > 0 ||
                reload ||
                configRowSelect ||
                configFiltros ||
                configCols ||
                download
            "
        >
            <div class="left">
                <div class="buscador" v-if="seeker">
                    <JdInput
                        icon="fa-solid fa-magnifying-glass"
                        type="search"
                        :placeholder="seekString"
                        v-model="txtBuscar"
                        :title="seekString"
                    />
                </div>

                <template v-if="rowSelectable1 && !rsUno">
                    <JdButton text="Todos" tipo="3" @click="selectAll" />
                    <JdButton text="Ninguno" tipo="3" @click="selectNone" />
                </template>

                <div
                    class="container-actions"
                    v-if="datos.filter((a) => a.selected == true).length"
                >
                    <template v-for="(a, i) in actions" :key="i">
                        <JdButton
                            :icon="a.icon"
                            :text="a.text"
                            tipo="3"
                            @click="$emit('actionClick', a.action)"
                            v-if="useAuth.verifyPermiso(a.permiso)"
                        />
                    </template>
                </div>
            </div>

            <div class="container-config">
                <JdButton
                    :icon="
                        rowSelectable1 ? 'fa-solid fa-square-check' : 'fa-regular fa-square-check'
                    "
                    tipo="2"
                    @click="toogleSelectItems()"
                    v-if="configRowSelect"
                />

                <template v-if="rowSelectable1 == false">
                    <JdButton
                        icon="fa-solid fa-file-excel"
                        tipo="2"
                        title="Descargar en excel"
                        @click="downloadData"
                        v-if="download && cantidadRegistros > 0"
                    />

                    <JdButton
                        icon="fa-solid fa-gear"
                        tipo="2"
                        title="Configurar columnas"
                        @click="openConfigCols"
                        v-if="configCols"
                    />

                    <JdButton
                        icon="fa-solid fa-filter"
                        tipo="2"
                        title="Filtros"
                        @click="configFiltros"
                        v-if="configFiltros"
                    />
                </template>

                <JdButton
                    icon="fa-solid fa-rotate-right"
                    tipo="2"
                    title="Recargar"
                    @click="reloadAndSort"
                    v-if="reload"
                />
            </div>
        </div>

        <div class="container-table" :style="{ minHeight: minHeight }">
            <table ref="jdtable" :class="{ 'table-cols-resizable': columnsResizable }">
                <colgroup>
                    <col v-if="colNro" style="width: 2rem" />

                    <col v-if="colAct && !rowSelectable1" :style="`width: ${colActWidth}`" />

                    <col
                        v-for="a in columnsSorted"
                        :key="a.id"
                        :ref="`column-${a.id}`"
                        :style="{ width: a.width }"
                        v-show="a.show"
                    />

                    <col style="width: 100%" />
                </colgroup>

                <thead v-if="headless == false">
                    <tr>
                        <th v-if="colNro" class="th-numero">
                            <div><span>#</span></div>
                        </th>

                        <th v-if="colAct && !rowSelectable1"></th>

                        <th
                            v-for="a in columnsSorted"
                            :key="a.id"
                            :class="[
                                'th-vfor',
                                {
                                    'th-vfor-right': a.toRight,
                                    'th-dragging-over': a.isDraggingOver,
                                },
                            ]"
                            v-show="a.show"
                        >
                            <!-- @dragover.prevent @dragenter="columnDragEnter(i)" @drop="columnDrop(i)"
                            :draggable="columnsSortable" @dragstart="columnDragStart(i, $event)"
                            @dragend="columnDragEnd" -->

                            <div
                                :class="['th-vfor-title', { 'th-vfor-sortable': a.sort }]"
                                @click="sortData(a)"
                            >
                                <i
                                    class="fa-solid fa-arrow-up"
                                    v-if="a.sortDirection == 'desc'"
                                ></i>
                                <i
                                    class="fa-solid fa-arrow-down"
                                    v-if="a.sortDirection == 'asc'"
                                ></i>

                                <span>{{ a.title }}</span>
                            </div>

                            <!-- <span class="icon-resize" v-if="columnsResizable && !isDraggingTh" -->
                            <span
                                class="icon-resize"
                                v-if="columnsResizable"
                                @mousedown="columnResize($event, a.id)"
                            ></span>
                        </th>

                        <th class="th-last"></th>
                    </tr>
                </thead>

                <tbody>
                    <tr
                        v-for="(a, i) in datosFiltrados"
                        :key="a.id"
                        :class="{
                            'row-selectable': rowSelectable1,
                            'row-selected': a.selected,
                        }"
                        @click="selectRow(a)"
                    >
                        <td v-if="colNro" class="td-numero">
                            {{ i + 1 }}
                        </td>

                        <td v-if="colAct && !rowSelectable1" class="td-act">
                            <div class="acts">
                                <slot name="cAction" :item="{ ...a, i }"></slot>
                            </div>

                            <JdButton
                                icon="fa-solid fa-ellipsis"
                                title="Acciones"
                                tipo="2"
                                :small="true"
                                :id="'button-options-' + a.id"
                                @click="toogleRowOptions({ ...a, i })"
                                v-if="rowOptions.length > 0"
                            />
                        </td>

                        <td
                            v-for="column in columnsSorted"
                            :key="column.prop"
                            v-show="column.show"
                            :class="[
                                'td-vfor',
                                {
                                    'td-vfor-right': column.toRight,
                                    'td-vfor-resizable': columnsResizable,
                                },
                            ]"
                        >
                            <template v-if="column.slot">
                                <slot :name="column.slot" :item="a"></slot>
                            </template>

                            <template v-else-if="column.input">
                                <template v-if="column.type == 'text'">
                                    <JdInput v-model="a[column.id]" :disabled="inputsDisabled" />
                                </template>

                                <template v-if="column.type == 'number'">
                                    <JdInput
                                        type="number"
                                        v-model="a[column.id]"
                                        :toRight="true"
                                        :disabled="inputsDisabled"
                                        @change="
                                            column.onchange
                                                ? $emit('onChange', column.onchange, a)
                                                : null
                                        "
                                        @input="
                                            column.oninput
                                                ? $emit('onInput', column.oninput, a)
                                                : null
                                        "
                                    />
                                </template>

                                <template v-if="column.type == 'email'">
                                    <JdInput
                                        type="email"
                                        v-model="a[column.id]"
                                        :disabled="inputsDisabled"
                                    />
                                </template>

                                <template v-if="column.type == 'date'">
                                    <JdInput
                                        type="date"
                                        v-model="a[column.id]"
                                        :disabled="inputsDisabled"
                                    />
                                </template>

                                <template v-if="column.type == 'time'">
                                    <JdInput
                                        type="time"
                                        v-model="a[column.id]"
                                        :disabled="inputsDisabled"
                                    />
                                </template>

                                <template v-if="column.type == 'select'">
                                    <JdSelect
                                        v-model="a[column.id]"
                                        :disabled="inputsDisabled"
                                        :lista="column.list"
                                        :mostrar="column.mostrar"
                                        @elegir="
                                            column.onchange
                                                ? $emit('onChange', column.onchange, a)
                                                : null
                                        "
                                    />
                                </template>

                                <template v-if="column.select_query">
                                    <JdSelectQuery
                                        v-model="a[column.id]"
                                        :id="column.select_query.id"
                                        :mostrar="column.select_query.mostrar"
                                        @search="
                                            (txt) => column.select_query.search(txt, a, column)
                                        "
                                        @elegir="
                                            column.select_query.onchange
                                                ? column.select_query.onchange(a)
                                                : null
                                        "
                                        :spin="a.table_columns[`${column.id}_spin`]"
                                        :lista="a.table_columns[`${column.id}_lista`]"
                                        :disabled="a.table_columns[`${column.id}_disabled`]"
                                    />
                                </template>

                                <template v-if="column.type == 'check'">
                                    <JdCheckBox
                                        v-model="a[column.id]"
                                        :disabled="inputsDisabled"
                                        @change="
                                            column.onchange
                                                ? $emit('onChange', column.onchange, a)
                                                : null
                                        "
                                    />
                                </template>

                                <template v-if="column.type == 'longtext'">
                                    <JdTextArea v-model="a[column.id]" :disabled="inputsDisabled" />
                                </template>
                            </template>

                            <template v-else-if="column.format">
                                <template v-if="column.format == 'yesno'">
                                    <div
                                        class="estado"
                                        :class="`${a[column.id] ? 'si' : 'no'}`"
                                        v-if="a[column.id] != null"
                                    >
                                        {{ getNestedProp(a, column.prop) }}
                                    </div>
                                </template>

                                <template v-if="column.format == 'estado'">
                                    <div
                                        class="estado"
                                        :class="`${
                                            a[column.id] < 1
                                                ? 'anulado'
                                                : a[column.id] < 2
                                                  ? 'abierto'
                                                  : 'cerrado'
                                        }`"
                                        v-if="a[column.id] != null"
                                    >
                                        {{ getNestedProp(a, column.prop) }}
                                    </div>
                                </template>

                                <template v-if="column.format == 'date'">
                                    <template v-if="column.prop">
                                        {{
                                            getNestedProp(a, column.prop)
                                                ? dayjs(getNestedProp(a, column.prop)).format(
                                                      useAuth.usuario.format_date,
                                                  )
                                                : ''
                                        }}
                                    </template>
                                    <template v-else>
                                        {{
                                            a[column.id]
                                                ? dayjs(a[column.id]).format(
                                                      useAuth.usuario.format_date,
                                                  )
                                                : ''
                                        }}
                                    </template>
                                </template>

                                <template v-if="column.format == 'datetime'">
                                    <template v-if="column.prop">
                                        {{
                                            getNestedProp(a, column.prop)
                                                ? dayjs(getNestedProp(a, column.prop)).format(
                                                      `${useAuth.usuario.format_date} HH:mm:ss`,
                                                  )
                                                : ''
                                        }}
                                    </template>
                                    <template v-else>
                                        {{
                                            a[column.id]
                                                ? dayjs(a[column.id]).format(
                                                      `${useAuth.usuario.format_date} HH:mm:ss`,
                                                  )
                                                : ''
                                        }}
                                    </template>
                                </template>

                                <template v-if="column.format == 'number'">
                                    <template v-if="column.prop">
                                        {{ redondear(getNestedProp(a, column.prop), 0) }}
                                    </template>
                                    <template v-else>
                                        {{ redondear(a[column.id], 0) }}
                                    </template>
                                </template>

                                <template v-if="column.format == 'decimal'">
                                    <template v-if="column.prop">
                                        {{ redondear(getNestedProp(a, column.prop)) }}
                                    </template>
                                    <template v-else>
                                        {{ redondear(a[column.id]) }}
                                    </template>
                                </template>

                                <template v-if="column.format == 'color'">
                                    <div
                                        class="color-box"
                                        :style="{ background: a[column.id] }"
                                    ></div>
                                </template>

                                <template v-if="column.format == 'currency'">
                                    <template v-if="column.prop">
                                        <div
                                            class="currency-box"
                                            v-if="getNestedProp(a, column.prop)"
                                        >
                                            {{ column.moneda }}
                                            {{ redondear(getNestedProp(a, column.prop)) }}
                                        </div>
                                    </template>
                                    <template v-else>
                                        <div class="currency-box" v-if="a[column.id]">
                                            <span>{{ column.moneda }}</span>
                                            <span>{{ redondear(a[column.id]) }}</span>
                                        </div>
                                    </template>
                                </template>

                                <template v-if="column.format == 'img'">
                                    <div class="img-box" v-if="a[column.id]">
                                        <img
                                            :src="`${column.host}/${a[column.id]}`"
                                            :alt="a[column.id]"
                                        />
                                    </div>
                                </template>
                            </template>

                            <template v-else-if="column.prop">
                                {{ getNestedProp(a, column.prop) }}
                            </template>

                            <template v-else>
                                {{ a[column.id] }}
                            </template>
                        </td>

                        <td class="td-last"></td>
                    </tr>

                    <tr v-if="agregarFila">
                        <td colspan="100%">
                            <JdButton
                                text="Agregar fila"
                                tipo="3"
                                small="true"
                                @click="agregarFila"
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- <div v-if="buscar().length == 0" class="no-datos">
                <small>No existen registros</small>
            </div> -->
        </div>

        <div class="resumen">
            <small>
                <template v-if="txtBuscar">{{ datosFiltrados.length }} de</template>
                <template v-if="showResumen"
                    >{{ cantidadRegistros }} {{ mensajeRegistros }}</template
                >
            </small>
            <template v-if="cantidadSeleccionados > 0">
                <small>|</small>
                <small> {{ cantidadSeleccionados }} {{ mensajeSeleccion }} </small>
            </template>
        </div>

        <transition name="fade">
            <ul
                class="row-options-case scroll-tiny"
                v-if="optionsCaseItem.i >= 0"
                @click.stop
                :id="'options-case-' + this.name"
            >
                <template v-for="(b, i) in rowOptions" :key="i">
                    <li @click="selectOption(b)" v-if="verifyPermiso(optionsCaseItem, b)">
                        <i :class="b.icon"></i>
                        <span>{{ b.label }}</span>
                    </li>
                </template>
            </ul>
        </transition>
    </article>
</template>

<script>
// import JdInput from './inputs/JdInput.vue'
// import JdCheckBox from './inputs/JdCheckBox.vue'
// import JdButton from './inputs/JdButton.vue'
// import JdSelect from './inputs/JdSelect.vue'
// import JdTextArea from './inputs/JdTextArea.vue'
// import JdSelectQuery from './inputs/JdSelectQuery.vue'

import {
    JdInput,
    JdCheckBox,
    JdButton,
    JdSelect,
    JdTextArea,
    JdSelectQuery,
} from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

import { redondear, downloadExcel } from '@/utils/mine'

import dayjs from 'dayjs'

export default {
    components: {
        JdInput,
        JdCheckBox,
        JdButton,
        JdSelect,
        JdTextArea,
        JdSelectQuery,
    },
    props: {
        name: { type: String },
        columns: { type: Array, required: true },
        datos: { type: Array, required: true },

        headless: { type: Boolean, default: false },
        height: { type: String, default: 'auto' },
        maxHeight: { type: String, default: '100%' },
        minHeight: { type: String, default: 'auto' },
        width: { type: String, default: '100%' },

        seeker: { type: Boolean, default: true },
        actions: { type: Array, default: () => [] },
        configRowSelect: { type: Boolean, default: false },
        download: { type: Boolean, default: true },
        configCols: { type: Boolean },
        configFiltros: { type: Function },
        reload: { type: Function },

        colNro: { type: Boolean, default: true },
        colAct: { type: Boolean, default: false },
        colActWidth: { type: String, default: '2.5rem' },

        // columnsSortable: { type: Boolean, default: false },
        columnsResizable: { type: Boolean, default: true },
        rowSelectable: { type: Boolean, default: false },
        rsUno: { type: Boolean, default: false },

        inputsDisabled: { type: Boolean, default: false },
        rowOptions: { type: Array, default: () => [] },
        showResumen: { type: Boolean, default: true },

        agregarFila: { type: Function },
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        redondear,
        dayjs,

        txtBuscar: '',

        // draggedColumnIndex: null,
        // isDraggingTh: false,

        rowSelectable1: false,
        seleccionando: false,
        filaInicial: null,

        optionsCaseItem: {},
    }),
    computed: {
        columnsSorted() {
            const cols = [...this.columns]
            return cols.sort((a, b) => a.orden - b.orden)
        },
        datosFiltrados() {
            if (this.seeker == false) return this.datos
            const searchTermLowerCase = this.txtBuscar.toLowerCase()
            return this.datos.filter((a) => {
                return this.seekProperties.some((b) => {
                    const propertyValue = this.getNestedProp(a, b)
                    return propertyValue.toString().toLowerCase().includes(searchTermLowerCase)
                })
            })
        },
        seekProperties() {
            return this.columns.filter((a) => a.seek).map((b) => b.prop || b.id)
        },
        seekString() {
            const seekTitles = this.seekProperties.map((a) => {
                const col = this.columns.find((b) => b.prop == a || b.id == a)
                return col ? col.title : ''
            })
            if (seekTitles.length > 1) {
                const lastTitle = seekTitles.pop()
                return 'Buscar por ' + seekTitles.join(', ') + ' y ' + lastTitle
            } else if (seekTitles.length === 1) {
                return 'Buscar por ' + seekTitles[0]
            } else {
                return ''
            }
        },
        cantidadRegistros() {
            return this.datos.length
        },
        mensajeRegistros() {
            return this.cantidadRegistros == 1 ? 'registro' : 'registros'
        },
        cantidadSeleccionados() {
            return this.datos.filter((a) => a.selected == true).length
        },
        mensajeSeleccion() {
            return this.cantidadSeleccionados == 1 ? 'seleccionado' : 'seleccionados'
        },
    },
    created() {
        this.rowSelectable1 = this.rowSelectable
    },
    methods: {
        getNestedProp(obj, prop) {
            const result = prop.split('.').reduce((acc, part) => acc?.[part], obj)

            return result === undefined || result === null ? '' : result
        },
        sortData(column, orden) {
            const { id, prop, sort } = column

            if (!sort) return

            const col = this.columns.find((a) => a.id == id)

            if (orden) {
                col.sortDirection = orden
            } else {
                col.sortDirection = col.sortDirection == 'asc' ? 'desc' : 'asc'
            }

            for (const a of this.columns) {
                if (a.id != id) a.sortDirection = null
            }

            this.useAuth.saveTableColumns(this.name, this.columns)

            // eslint-disable-next-line vue/no-mutating-props
            this.datos.sort((a, b) => {
                const valA = this.getNestedProp(a, prop || id)
                const valB = this.getNestedProp(b, prop || id)

                if (col.sortDirection === 'asc') {
                    return valA > valB ? 1 : -1
                } else {
                    return valA < valB ? 1 : -1
                }
            })
        },

        columnResize(event, id) {
            const startX = event.pageX

            const columnId = `column-${id}`
            const columnElement = this.$refs[columnId][0]
            const initialWidth = columnElement.offsetWidth

            const handleMouseMove = (moveEvent) => {
                const deltaX = moveEvent.pageX - startX
                const newWidth = initialWidth + deltaX

                if (newWidth <= 85) {
                    columnElement.style.width = `85px`
                } else {
                    columnElement.style.width = `${newWidth}px`
                }
            }

            const handleMouseUp = () => {
                window.removeEventListener('mousemove', handleMouseMove)
                window.removeEventListener('mouseup', handleMouseUp)

                this.columns.find((a) => a.id == id).width = columnElement.offsetWidth + 'px'
                this.useAuth.saveTableColumns(this.name, this.columns)
            }

            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        },

        // columnDragStart(index, event) {
        //     this.isDraggingTh = true
        //     this.draggedColumnIndex = index
        //     event.dataTransfer.effectAllowed = 'move'
        // },
        // columnDragEnd() {
        //     for (const a of this.columns) a.isDraggingOver = false
        //     this.isDraggingTh = false
        // },
        // columnDragEnter(index) {
        //     for (let i = 0; i < this.columns.length; i++) {
        //         // eslint-disable-next-line vue/no-mutating-props
        //         this.columns[i].isDraggingOver = i == index ? true : false
        //     }
        // },
        // columnDrop(targetIndex) {
        //     if (this.draggedColumnIndex !== null) {
        //         // eslint-disable-next-line vue/no-mutating-props
        //         const draggedColumn = this.columns.splice(this.draggedColumnIndex, 1)[0]

        //         // eslint-disable-next-line vue/no-mutating-props
        //         this.columns.splice(targetIndex, 0, draggedColumn)
        //         this.draggedColumnIndex = null
        //     }
        // },

        selectRow(item) {
            if (this.rowSelectable1 == false) return

            if (this.rsUno == true) {
                for (const a of this.datos) {
                    if (a.id == item.id) continue
                    a.selected = false
                }

                item.selected = !item.selected
                this.$emit('rowSelected', item)
            } else {
                item.selected = !item.selected
            }
        },
        selectAll() {
            for (const a of this.datos) a.selected = true
        },
        selectNone() {
            for (const a of this.datos) a.selected = false
        },

        toogleSelectItems() {
            this.rowSelectable1 = !this.rowSelectable1

            if (this.rowSelectable1 == false) {
                for (const a of this.datos) a.selected = false
            }
        },
        downloadData() {
            downloadExcel(
                this.columnsSorted.filter((a) => a.show),
                this.datos,
            )
        },
        openConfigCols() {
            const send = {
                table: this.name,
                cols: this.columns,
                reload: this.reloadAndSort,
            }

            this.useModals.setModal('mConfigCols', 'Configurar columnas', null, send, true)
        },
        async reloadAndSort() {
            await this.reload()

            const column = this.columns.find((a) => a.sortDirection != null)
            if (column) this.sortData(column, column.sortDirection)
        },

        toogleRowOptions(item) {
            const previousItem = this.optionsCaseItem
            this.hide()
            if (previousItem.i == item.i) return

            this.optionsCaseItem = item
            const screenWidth = window.innerWidth
            const screenHeight = window.innerHeight

            this.$nextTick(() => {
                const el = document.getElementById('options-case-' + this.name)

                setTimeout(() => {
                    const rect = document
                        .getElementById(`button-options-${item.id}`)
                        .getBoundingClientRect()
                    const rect2 = el.getBoundingClientRect()

                    if (screenWidth < rect.left + rect2.width) {
                        el.style.right = `${screenWidth - rect.right + window.scrollX}px`
                    } else {
                        el.style.left = `${rect.left + window.scrollX}px`
                    }

                    if (screenHeight < rect.bottom + rect2.height) {
                        el.style.bottom = `${screenHeight - rect.top + window.scrollY + 5}px`
                    } else {
                        el.style.top = `${rect.bottom + window.scrollY + 5}px`
                    }

                    document.body.addEventListener('click', this.closeOnOutside)
                }, 0)
            })

            // setTimeout(() => {
            // }, 10)
        },
        closeOnOutside(event) {
            // this.$nextTick(() => {
            const el = document.getElementById('options-case-' + this.name)

            if (el && !el.contains(event.target)) {
                this.hide()
            }
            // })
        },
        hide() {
            this.optionsCaseItem = {}
            document.body.removeEventListener('click', this.closeOnOutside)
        },
        selectOption(a) {
            this.$emit('rowOptionSelected', a.action, this.optionsCaseItem)
            this.hide()
        },
        verifyPermiso(a, b) {
            // Si existe 'ocultar', evaluar condiciones para ocultar
            if (b.ocultar) {
                for (const prop in b.ocultar) {
                    const condicion = b.ocultar[prop]
                    const valorFila = a[prop]

                    if (valorFila === undefined) continue

                    // Caso 1: array
                    if (Array.isArray(condicion)) {
                        if (condicion.includes(valorFila)) return false // se oculta
                    }
                    // Caso 2: objeto con operador
                    else if (typeof condicion === 'object' && condicion.op && 'val' in condicion) {
                        if (this.comparar(valorFila, condicion.op, condicion.val)) return false
                    }
                    // Caso 3: valor simple
                    else {
                        if (condicion == valorFila) return false // se oculta
                    }
                }
            }

            // Si no hay permiso definido, solo dependerá de 'ocultar'
            if (!b.permiso) return true

            // Evaluar permiso si existe
            return Array.isArray(b.permiso)
                ? this.useAuth.verifyPermiso(...b.permiso)
                : this.useAuth.verifyPermiso(b.permiso)
        },
        comparar(a, op, b) {
            switch (op) {
                case '>':
                    return a > b
                case '<':
                    return a < b
                case '>=':
                    return a >= b
                case '<=':
                    return a <= b
                case '==':
                    return a == b
                case '!=':
                    return a != b
                default:
                    return false
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.jd-table {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    max-width: 100%;
}

.container-top {
    margin-bottom: 1rem;
    // display: grid;
    // grid-template-columns: 20rem 1fr auto;
    display: flex;
    justify-content: space-between;
    gap: 0.5rem 1rem;
    flex-wrap: wrap;

    .left {
        display: flex;
        align-items: center;
        gap: 0.5rem 1rem;
        flex-wrap: wrap;

        .buscador {
            width: 20rem;
        }

        .container-actions {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
    }

    .container-config {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: flex-end;
    }
}

.container-table {
    height: 100%;
    overflow: auto;
    border-bottom: var(--border);

    .table-cols-resizable {
        table-layout: fixed;
        width: fit-content !important;
    }

    table {
        border-collapse: collapse;
        // border-collapse: separate;
        border-spacing: 0;

        thead {
            position: sticky;
            top: 0;
            z-index: 2;
            border-radius: 0.5rem 0.5rem 0 0;

            tr {
                background-color: var(--bg-color2);
                border-bottom: var(--border);
            }

            th {
                padding: 0.5rem 0.5rem;
                text-align: left;

                * {
                    color: var(--text-color2);
                    font-size: 0.9rem;
                }
            }

            .th-numero {
                position: sticky;
                left: 0;
                z-index: 1;
                background-color: var(--bg-color2);
            }

            .th-vfor {
                position: relative;

                .th-vfor-title {
                    display: flex;

                    i {
                        margin-right: 0.5rem;
                    }

                    span {
                        width: 100%;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }

                .th-vfor-sortable {
                    cursor: pointer;
                }

                .icon-resize {
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: 0.5rem;
                    height: 100%;
                    cursor: col-resize;

                    &:hover {
                        border-right: solid 2px var(--primary-color);
                    }
                }
            }

            .th-vfor-right {
                text-align: right;
            }
        }

        tbody {
            tr {
                border-bottom: var(--border);

                &:hover {
                    background-color: var(--bg-color-hover);

                    .td-numero {
                        background-color: var(--bg-color-hover);
                    }
                }
            }

            .row-selectable {
                cursor: pointer;
            }

            .row-selected {
                background-color: var(--bg-color-selected);

                .td-numero {
                    background-color: var(--bg-color-selected);
                }
            }

            td {
                padding: 0.4rem 0.5rem;
                vertical-align: top;
            }

            .td-numero {
                background-color: var(--bg-color);
                position: sticky;
                left: 0;
                z-index: 1;
                font-size: 0.85rem;
            }

            .td-act {
                .acts {
                    display: flex;
                    gap: 0.3rem;
                }
            }

            .td-vfor {
                .estado {
                    padding: 0.1rem 0.5rem;
                    width: fit-content;
                    border-radius: 0.3rem;
                    font-size: 0.8rem;
                }

                .si {
                    // background-color: var(--verde);
                    border: solid 1px var(--verde);
                }

                .no {
                    // background-color: var(--rojo);
                    border: solid 1px var(--rojo);
                }

                .anulado {
                    border: solid 1px var(--rojo);
                    // background-color: var(--rojo);
                }

                .abierto {
                    border: solid 1px var(--amarillo);
                    // background-color: var(--amarillo);
                }

                .cerrado {
                    border: solid 1px var(--verde);
                    // background-color: var(--azul);
                }

                .color-box {
                    width: 2rem;
                    height: 1rem;
                }

                .currency-box {
                    display: flex;
                    justify-content: space-between;
                }

                .img-box {
                    width: 100%;
                    height: 3rem;

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                }
            }

            .td-vfor-right {
                text-align: right;
            }

            .td-vfor-resizable {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
    }

    .no-datos {
        padding: 0.4rem 0.5rem !important;
    }

    .footer-actions {
        display: flex;
        padding: 0.5rem;
    }
}

.resumen {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
}

.row-options-case {
    position: absolute;
    user-select: none;
    max-height: 15rem;
    overflow-y: auto;
    background-color: var(--bg-color);
    z-index: 3;
    box-shadow: 0 0 0.5rem 0.1rem var(--shadow-color);
    border-radius: 0.3rem;

    li {
        cursor: pointer;
        padding: 0.5rem 0.8rem;
        display: grid;
        grid-template-columns: 1.5rem 1fr;

        &:hover {
            background-color: var(--bg-color-hover);
        }

        span {
            text-wrap: nowrap;
        }
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.1s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
