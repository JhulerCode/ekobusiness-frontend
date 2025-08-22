import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
    onNeedRefresh() {
        // cuando hay nueva versión disponible
        const confirmed = confirm("Nueva versión disponible. ¿Quieres actualizar?")
        if (confirmed) {
            updateSW(true) // recarga la app con la nueva versión
        }
    },
    onOfflineReady() {
        console.log("La app está lista para usarse offline 🚀")
    }
})
