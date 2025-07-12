<template>
    <label class="container-input"
        :style="`grid-template-columns: ${label || icon ? 'auto 1fr' : '1fr'}; height: ${height}rem`">
        <div class="left" v-if="label || icon">
            <i v-if="icon" :class="icon"></i>
            <span v-if="label">{{ label }}</span>
            <span v-if="nec" class="nec"> *</span>
        </div>

        <div class="right" :class="{ disabled: disabled }">
            <template v-if="type != 'color'">
                <input :type="type" :placeholder="placeholder" v-model="inputModel" v-if="!disabled"
                    :class="{ 'to-right': toRight }" />

                <template v-else>
                    <template v-if="['text', 'number', 'email', 'hour', 'search'].includes(type)">
                        <p :class="{ 'to-right-p': toRight }">{{ inputModel }}</p>
                    </template>

                    <template v-else-if="type == 'date'">
                        <p :class="{ 'to-right-p': toRight }" v-if="inputModel">
                            {{ dayjs(inputModel).format(useAuth.usuario.format_date || 'DD-MM-YYYY') }}
                        </p>
                    </template>
                </template>
            </template>

            <template v-else>
                <input type="text" :placeholder="placeholder" v-model="inputModel" v-if="!disabled" />

                <div class="disabled" v-else>
                    {{ inputModel }}
                </div>

                <div class="box-color">
                    <input type="color" :placeholder="placeholder" v-model="inputModel" v-if="!disabled" />
                </div>
            </template>
        </div>
    </label>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import dayjs from 'dayjs'

export default {
    props: {
        modelValue: [String, Number],

        icon: String,
        label: String,
        nec: { type: Boolean, default: false },
        type: { type: String, default: 'text' },
        placeholder: String,
        disabled: { type: Boolean, default: false },
        toRight: { type: Boolean, default: false },
        height: { type: [String, Number], default: '2.2' },
    },
    computed: {
        inputModel: {
            get() {
                return this.modelValue
            },
            set(newValue) {
                this.$emit('update:modelValue', newValue)
            },
        },
    },
    data: () => ({
        useAuth: useAuth(),
        dayjs,
    })
}
</script>

<style lang="scss" scoped>
.container-input {
    display: grid;
    width: 100%;
    // height: 2.2rem;

    * {
        font-size: 0.9rem;
    }

    .left,
    .right {
        padding: 0 0.5rem;
        border-radius: 0.2rem;
        border: var(--border);
        display: flex;
        align-items: center;
    }

    .left {
        background-color: var(--bg-color2);
        border-right: initial !important;
        gap: 0.3rem;

        .nec {
            color: var(--rojo);
        }
    }

    .right {
        background-color: var(--bg-color);

        input {
            width: 100%;
            // height: 100%;
            background-color: var(--bg-color);
        }

        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        .to-right {
            -moz-appearance: textfield;
            text-align: right;
        }

        .to-right-p {
            width: 100%;
            text-align: right;
        }

        .box-color {
            padding: 0;
            border-left: initial !important;
            cursor: pointer;

            input {
                border: none;
                background-color: initial;
                width: 1.5rem;
            }
        }
    }

    .disabled {
        background-color: var(--bg-color2) !important;
    }
}
</style>