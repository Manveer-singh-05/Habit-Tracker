import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import { useAuthStore } from './store/authStore.js'
import './styles.css'

async function bootstrap() {
	const app = createApp(App)
	const pinia = createPinia()

	app.use(pinia)
	app.use(router)

	// Initialize authentication from localStorage before the first route decision
	const authStore = useAuthStore()
	await authStore.initAuth()

	app.mount('#app')
}

bootstrap()
