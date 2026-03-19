<template>
    <div class="container-input" :style="`height: ${height}rem`">
        <div class="left" v-if="label || icon">
            <i v-if="icon" :class="icon"></i>
            <span v-if="label">{{ label }}</span>
            <span v-if="nec" class="nec"> *</span>
        </div>

        <div class="right" :class="{ disabled: disabled }">
            {{ inputModel }}
        </div>

        <div class="actions" v-if="!disabled">
            <i class="fa-solid fa-trash-can" @click="deleteFile" v-if="inputModel"></i>
            <i class="fa-solid fa-upload" @click="$refs.inputFile.click()" v-if="!inputModel"></i>
        </div>

        <input
            type="file"
            :placeholder="placeholder"
            :accept="accept"
            hidden
            @change="handleFile"
            ref="inputFile"
        />
    </div>
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
        accept: { type: String },
    },
    emits: ['update:modelValue', 'deleteFile', 'handleFile'],
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
        deleteFile() {
            this.inputModel = null
            this.$emit('deleteFile')
        },
        handleFile(e) {
            const file = e.target.files[0]

            if (file) {
                this.inputModel = file.name
                this.$emit('handleFile', file, URL.createObjectURL(file))
            }

            e.target.value = null
        },
    },
}
</script>

<style lang="scss" scoped>
.container-input {
    display: grid;
    grid-template-columns: auto 1fr auto;
    width: 100%;

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

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        overflow-x: auto;

        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE y Edge antiguos */

        &::-webkit-scrollbar {
            display: none; /* Chrome, Safari y Edge moderno */
        }
    }

    .disabled {
        background-color: var(--bg-color2);
    }

    .actions {
        display: flex;
        align-items: center;
        border-radius: 0.2rem;
        border: var(--border);
        border-left: initial !important;
        background-color: var(--bg-color);
        padding: 0 0.5rem;
        gap: 0.5rem;

        i {
            cursor: pointer;
        }
    }
}
</style>
