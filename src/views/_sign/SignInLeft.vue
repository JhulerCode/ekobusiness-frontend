<template>
    <div class="left">
        <template v-if="useAuth.empresa_publica?.logo">
            <img :src="useAuth.empresa_publica.logo.url" class="logo-empresa" />
        </template>
    </div>
</template>

<script>
import { useAuth } from '@/pinia/auth'

export default {
    data: () => ({
        useAuth: useAuth(),
    }),
}
</script>

<style lang="scss" scoped>
.left {
    border-radius: 2rem 0 0 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 5rem 5rem;
    width: 30rem;

    img {
        max-width: 100%;
    }
}
</style>
