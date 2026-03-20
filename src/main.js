import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router/index.js'
import App from '@/App.vue'
import '@/assets/main.css'

// ── Suppress Firebase reCAPTCHA internal timeout errors ───────────────────────
window.addEventListener('unhandledrejection', (e) => {
  if (
    e.reason?.message?.includes('reCAPTCHA') ||
    e.reason?.message?.includes('Timeout')   ||
    e.reason?.message?.includes('grecaptcha')
  ) {
    e.preventDefault()
  }
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')