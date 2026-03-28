<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-surface-950">

    <!-- Background glows -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute -top-56 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-brand-500/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/4 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-0 w-64 h-64 bg-emerald-500/3 rounded-full blur-3xl"></div>
    </div>

    <div class="w-full max-w-md animate-slide-up relative z-10">

      <!-- Logo -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-3 mb-5">
          <div class="w-11 h-11 bg-brand-500 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-500/30">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <span class="text-3xl font-bold tracking-tight text-gray-800">
            Market<span class="text-brand-500">Place</span>
          </span>
        </div>
        <p class="text-gray-400 text-sm font-semibold tracking-widest uppercase">
          Admin Control Panel
        </p>
      </div>

      <!-- Card -->
      <div class="card p-8 shadow-2xl">
        <h1 class="text-xl font-bold text-gray-800 mb-1">Welcome back</h1>
        <p class="text-gray-400 text-sm mb-7">Sign in with your administrator account</p>

        <!-- Error alert -->
        <transition name="modal">
          <div v-if="error" class="mb-5 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            <svg class="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            {{ error }}
          </div>
        </transition>

        <!-- Email / Password form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="form-label">Email address</label>
            <input v-model="form.email" type="email" placeholder="admin@market.com" required class="form-input" />
          </div>

          <div>
            <label class="form-label">Password</label>
            <div class="relative">
              <input v-model="form.password" :type="showPwd ? 'text' : 'password'" placeholder="••••••••" required class="form-input pr-11" />
              <button type="button" @click="showPwd = !showPwd"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800 transition-colors">
                <svg v-if="!showPwd" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" :disabled="loading" class="btn-primary w-full justify-center py-3 text-sm">
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <span>{{ loading ? 'Signing in…' : 'Sign in to Admin Panel' }}</span>
            <svg v-if="!loading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </form>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-5">
          <div class="flex-1 h-px bg-surface-600"></div>
          <span class="text-xs text-surface-400">or continue with</span>
          <div class="flex-1 h-px bg-surface-600"></div>
        </div>

        <!-- Firebase Google Sign In -->
        <button
          @click="handleGoogleLogin"
          :disabled="googleLoading"
          class="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border
                 border-surface-600 hover:border-brand-500/40 bg-surface-950 hover:bg-surface-900
                 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style="color: var(--text-base)"
        >
          <svg v-if="googleLoading" class="w-4 h-4 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <svg v-else class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {{ googleLoading ? 'Signing in…' : 'Continue with Google' }}
        </button>

        <!-- Phone Sign In -->
        <button
          @click="showPhoneModal = true"
          class="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border
                border-surface-600 hover:border-brand-500/40 bg-surface-950 hover:bg-surface-900
                text-sm font-medium transition-all mt-2"
          style="color: var(--text-base)"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
          </svg>
          Continue with Phone (OTP)
        </button>

        <!-- Phone OTP Modal -->
        <PhoneOTPModal
          :open="showPhoneModal"
          @success="onPhoneSuccess"
          @cancel="showPhoneModal = false"
        />

        <!-- Demo credentials -->
        <div class="mt-6 pt-5 border-t border-surface-600">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Demo credentials</p>
          <button @click="fillDemo"
            class="w-full flex items-center justify-between px-4 py-3 bg-surface-950 hover:bg-surface-900
                   border border-surface-600 hover:border-surface-500 rounded-xl text-xs transition-all group">
            <div>
              <span class="font-mono text-brand-600">admin@market.com</span>
              <span class="text-gray-400 mx-2">/</span>
              <span class="font-mono text-gray-600">admin123</span>
            </div>
            <svg class="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore }  from '@/store/auth.js'
import { authApi }       from '@/services/api.js'
import PhoneOTPModal     from '@/components/PhoneOTPModal.vue'

// ── Firebase ──────────────────────────────────────────────────────────────────
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const auth           = useAuthStore()
const loading        = ref(false)
const googleLoading  = ref(false)
const error          = ref('')
const showPwd        = ref(false)
const form           = reactive({ email: '', password: '' })
const showPhoneModal = ref(false)

// ── Email / Password ──────────────────────────────────────────────────────────
async function handleLogin() {
  loading.value = true
  error.value   = ''
  try {
    await auth.login(form.email, form.password)
  } catch (e) {
    error.value = e.response?.data?.error || e.message || 'Login failed'
  } finally {
    loading.value = false
  }
}

function fillDemo() {
  form.email    = 'admin@market.com'
  form.password = 'admin123'
}

// ── Firebase Google Login ─────────────────────────────────────────────────────
// signInWithPopup issues a proper Firebase ID token (iss=securetoken.google.com,
// sign_in_provider=google.com) that the backend's verifyFirebaseGoogleToken validates.
async function handleGoogleLogin() {
  googleLoading.value = true
  error.value         = ''

  try {
    const firebaseAuth = getAuth()
    const provider     = new GoogleAuthProvider()
    provider.addScope('email')
    provider.addScope('profile')
    provider.setCustomParameters({ prompt: 'select_account' })

    const result  = await signInWithPopup(firebaseAuth, provider)
    const idToken = await result.user.getIdToken()

    await handleToken(idToken)
  } catch (e) {
    // Silently ignore popup closed / cancelled — no error banner needed
    if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
      error.value = e.message || 'Google sign-in failed'
    }
    googleLoading.value = false
  }
}

async function handleToken(idToken) {
  try {
    const { data } = await authApi.googleLogin(idToken)

    const role = typeof data.user.role === 'string'
      ? data.user.role
      : data.user.role?.name

    if (role !== 'administrator' && role !== 'admin') {
      error.value         = `Access denied — "${data.user.name}" is a ${role} account, not an admin`
      googleLoading.value = false
      return
    }

    auth.setAuth(data.token, data.user)
  } catch (e) {
    error.value         = e.response?.data?.error || e.message || 'Google login failed'
    googleLoading.value = false
  }
}

// ── Phone OTP Login ───────────────────────────────────────────────────────────
async function onPhoneSuccess({ idToken, phone, name }) {
  showPhoneModal.value = false
  error.value          = ''
  try {
    const { data } = await authApi.phoneLogin(idToken, phone, name)

    const role = typeof data.user.role === 'string'
      ? data.user.role
      : data.user.role?.name

    if (role !== 'administrator' && role !== 'admin') {
      error.value = `Access denied — this phone is registered as ${role}, not admin`
      return
    }

    auth.setAuth(data.token, data.user)
  } catch (e) {
    error.value = e.response?.data?.error || 'Phone login failed'
  }
}
</script>