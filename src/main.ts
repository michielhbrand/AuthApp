import '@fontsource-variable/manrope'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import './styles/orbital.css'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(createPinia())

const auth = useAuthStore()
await auth.initialize()

app.use(router)
app.use(vuetify)

app.mount('#app')
