<template>
    <label class="container-checkbox" :class="{ disabled: disabled }">
        <input type="checkbox" v-model="inputModel" v-if="!disabled">
        <div class="type-check" :class="{ active: inputModel }"></div>
        
        <span :style="{ fontSize: textSize + 'rem' }" v-if="label">{{ label }}</span>
    </label>
</template>

<script>
export default {
    props: {
        modelValue: Boolean,

        label: String,
        textSize: { type: String, default: '1' },
        disabled: { type: Boolean, default: false },
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
.container-checkbox {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    cursor: pointer;
    width: fit-content;
    margin-top: 0;
    background-color: transparent;

    input[type="checkbox"] {
        display: none;
    }

    .type-check {
        background-color: var(--bg-color);
        margin: 0;
        width: 1.2rem;
        height: 1.2rem;
        border-radius: 0.2rem;
        border: var(--border);
        display: grid;
        place-content: center;

        &:before {
            content: "";
            width: 0.7rem;
            height: 0.7rem;
            transform: scale(0);
            transition: 120ms transform ease-in-out;
            background-color: var(--primary-color);
            transform-origin: center;
            clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
        }
    }

    .active {
        &::before {
            transform: scale(1);
        }
    }
}

.disabled {
    div {
        background-color: var(--input-disabled-bg-color) !important;
    }

    cursor: default;
}</style>