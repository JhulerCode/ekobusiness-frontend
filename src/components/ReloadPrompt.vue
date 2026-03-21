<template>
    <!-- Overlay de pantalla completa si hay una nueva versión -->
    <div v-if="needRefresh || system.versionMismatch" class="pwa-overlay" role="alert">
        <div class="pwa-card">
            <div class="pwa-icon">🚀</div>
            <h2>¡Hay una nueva versión disponible!</h2>
            <p>
                Actualizamos el sistema para brindarte una mejor experiencia y asegurar la
                consistencia de tus datos.
            </p>
            <div class="actions">
                <button class="update-btn" @click="handleUpdate()">Actualizar Ahora</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useSystem } from '@/pinia/system'

const system = useSystem()

const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
        if (r) {
            // Buscamos actualizaciones automáticamente cada 1 minuto (60000ms)
            setInterval(() => {
                console.log('Verificando nueva versión de la aplicación...')
                r.update()
            }, 60000)
        }
    },
})

const handleUpdate = async () => {
    if (system.versionMismatch) {
        // 1. Desregistrar todos los Service Workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations()
            for (const registration of registrations) {
                await registration.unregister()
            }
        }

        // 2. Limpiar las cachés del navegador (Cache Storage)
        if (window.caches) {
            const cacheNames = await caches.keys()
            for (const name of cacheNames) {
                await caches.delete(name)
            }
        }

        // 3. Forzar la recarga
        window.location.reload()
    } else {
        // Lógica normal de PWA para actualizaciones suaves
        updateServiceWorker()
    }
}
</script>

<style scoped>
/* Full screen overlay que bloquea toda la aplicación */
.pwa-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.7); /* Fondo oscuro con transparencia */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999; /* Por encima de todo, incluso modales */
    backdrop-filter: blur(4px); /* Efecto de desenfoque */
}

.pwa-card {
    background-color: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    text-align: center;
    max-width: 400px;
    width: 90%;
    animation: slideIn 0.3s ease-out;
}

.pwa-icon {
    font-size: 3rem;
    margin-bottom: 20px;
}

h2 {
    margin-top: 0;
    color: #333;
}

p {
    color: #666;
    margin-bottom: 25px;
}

.update-btn {
    background-color: #2492c2; /* Tu color principal */
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 6px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
    width: 100%;
}

.update-btn:hover {
    background-color: #1a6f94;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Soporte para Dark Mode */
:global(.dark-mode) .pwa-card {
    background-color: #1a1a1a;
    color: white;
}
:global(.dark-mode) h2 {
    color: white;
}
:global(.dark-mode) p {
    color: #bbb;
}
</style>
