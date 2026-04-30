<template>
    <label
        class="container-input"
        :style="`grid-template-columns: ${label || icon ? 'auto 1fr' : '1fr'}`"
    >
        <div class="left" v-if="label || icon">
            <span v-if="label">{{ label }}</span>
            <i v-if="icon" :class="icon"></i>
            <span v-if="nec" class="nec"> *</span>
        </div>

        <div class="right" :class="{ disabled: disabled }">
            <textarea
                rows="1"
                :placeholder="placeholder"
                v-model="inputModel"
                v-if="!disabled"
            ></textarea>

            <template v-else>
                {{ inputModel }}
            </template>
        </div>
    </label>
</template>

<script>
export default {
    props: {
        modelValue: [String, Number],

        label: String,
        icon: String,
        nec: { type: Boolean, default: false },
        tipo: { type: String, default: 'text' },
        placeholder: String,
        disabled: { type: Boolean, default: false },
        toRight: { type: Boolean, default: false },
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
        padding: 0.5rem 0.5rem;
        border-radius: 0.2rem;
        border: var(--border);
        display: flex;
        align-items: center;
    }

    // .right{
    //     height: 2.2rem;
    // }

    .left {
        background-color: var(--bg-color2);
        border-right: initial !important;
        gap: 0.3rem;
        height: fit-content;

        .nec {
            color: var(--rojo);
        }
    }

    .right {
        background-color: var(--bg-color);

        textarea {
            resize: none;
            width: 100%;
            field-sizing: content;
            background-color: var(--bg-color);
        }
    }

    .disabled {
        background-color: var(--bg-color2);
    }
}
</style>
