<template>
    <div class="left">
        <img src="@/assets/img/logo-sunka-black.webp" v-if="!useAuth.isDarkMode" />
        <img src="@/assets/img/logo-sunka-white.webp" v-else />
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
    // background: linear-gradient(135deg, var(--primary-color), #6acbe0);
    // backdrop-filter: blur(3px);
    // -webkit-backdrop-filter: blur(3px);
    padding: 5rem 5rem;

    img {
        // max-height: 20rem;
        max-width: 20rem;
    }
}
</style>
