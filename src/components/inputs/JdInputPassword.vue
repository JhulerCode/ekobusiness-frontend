<template>
    <label class="container-input" :style="`height: ${height}rem`">
        <div class="left" v-if="label || icon">
            <i v-if="icon" :class="icon"></i>
            <span v-if="label">{{ label }}</span>
            <span v-if="nec" class="nec"> *</span>
        </div>

        <div class="right">
            <input :type="tipo_input" :placeholder="placeholder" v-model="inputModel" v-if="!disabled" class="input1" />

            <div class="disabled" v-else>
                {{ inputModel }}
            </div>
        </div>

        <div class="action" @click="showPass">
            <i :class="ver_pass ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"></i>
        </div>
    </label>
</template>

<script>
export default {
    props: {
        modelValue: [String, Number],

        icon: String,
        label: String,
        nec: { type: Boolean, default: false },
        placeholder: String,
        disabled: { type: Boolean, default: false },
        height: { type: [String, Number], default: '2.2' },
    },
    data: () => ({
        tipo_input: 'password',
        ver_pass: false,
    }),
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
    methods: {
        showPass() {
            this.ver_pass = !this.ver_pass
            this.tipo_input = this.ver_pass ? 'text' : 'password'
        },
    },
}
</script>

<style lang="scss" scoped>
.container-input {
    display: grid;
    grid-template-columns: auto 1fr 2.5rem;
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
        border-right: initial !important;

        input {
            width: 100%;
            background-color: var(--bg-color);
        }

        .disabled {
            background-color: var(--bg-color2);
        }
    }

    .action {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.2rem;
        border: var(--border);
        border-left: initial !important;
        cursor: pointer;
        background-color: var(--bg-color);
    }
}
</style>