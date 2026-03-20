<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="open" class="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="cancel"></div>
        <div class="relative card w-full max-w-sm p-7 shadow-2xl z-10">

          <button @click="cancel" class="absolute top-4 right-4 text-surface-400 hover:text-red-500 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- ── Step 1: Phone + reCAPTCHA + Send button ─────────────────── -->
          <div v-if="step === 'phone'">
            <h3 class="text-base font-bold mb-1" style="color: var(--text-base)">Enter Phone Number</h3>
            <p class="text-xs text-surface-400 mb-5">We'll send a 6-digit verification code via SMS</p>

            <div v-if="error" class="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
              {{ error }}
            </div>

            <!-- Phone -->
            <div class="mb-4">
              <label class="form-label">Phone Number</label>
              <div class="flex gap-2">
                <select v-model="countryCode" class="form-select w-28 shrink-0">
                  <option value="+855">🇰🇭 +855</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+65">🇸🇬 +65</option>
                  <option value="+66">🇹🇭 +66</option>
                  <option value="+84">🇻🇳 +84</option>
                  <option value="+60">🇲🇾 +60</option>
                  <option value="+62">🇮🇩 +62</option>
                  <option value="+63">🇵🇭 +63</option>
                  <option value="+86">🇨🇳 +86</option>
                  <option value="+81">🇯🇵 +81</option>
                  <option value="+82">🇰🇷 +82</option>
                </select>
                <input
                  v-model="phoneNumber"
                  type="tel"
                  placeholder="12 345 678"
                  class="form-input flex-1"
                  :disabled="loading"
                />
              </div>
              <p class="text-xs text-surface-400 mt-1">No leading 0 — e.g. 66820101</p>
            </div>

            <!-- reCAPTCHA -->
            <div class="mb-4">
              <div id="recaptcha-container"></div>
            </div>

            <!-- Send button — enabled after recaptcha solved -->
            <button
              @click="sendOTP"
              :disabled="loading || !phoneNumber.trim() || !recaptchaSolved"
              class="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <span v-if="!recaptchaSolved && !loading">✅ Complete checkbox above first</span>
              <span v-else>{{ loading ? 'Sending…' : 'Send OTP' }}</span>
            </button>
          </div>

          <!-- ── Step 2: OTP verification ────────────────────────────────── -->
          <div v-else-if="step === 'otp'">
            <h3 class="text-base font-bold mb-1" style="color: var(--text-base)">Enter OTP Code</h3>
            <p class="text-xs text-surface-400 mb-1">
              Code sent to <span class="font-semibold text-brand-500">{{ sentToPhone }}</span>
            </p>
            <button @click="backToPhone" class="text-xs text-brand-500 hover:underline mb-5 block">
              ← Change number
            </button>

            <div v-if="error" class="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
              {{ error }}
            </div>

            <!-- 6 OTP input boxes -->
            <div class="mb-4">
              <label class="form-label">6-Digit Code</label>
              <div class="flex gap-2 justify-center">
                <input
                  v-for="(_, i) in 6" :key="i"
                  :ref="el => { if (el) otpRefs[i] = el }"
                  v-model="otpDigits[i]"
                  type="text"
                  maxlength="1"
                  inputmode="numeric"
                  @input="onOtpInput(i, $event)"
                  @keydown.backspace="onOtpBackspace(i)"
                  @paste.prevent="onOtpPaste($event)"
                  :disabled="loading"
                  class="w-10 h-12 text-center text-lg font-bold font-mono rounded-xl border
                         border-surface-600 outline-none
                         focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all
                         disabled:opacity-50"
                  style="background-color: var(--surface-700); color: var(--text-base)"
                />
              </div>
            </div>

            <!-- Resend -->
            <div class="flex items-center justify-center mb-4">
              <span v-if="resendTimer > 0" class="text-xs text-surface-400">
                Resend in <span class="font-mono text-brand-500">{{ resendTimer }}s</span>
              </span>
              <button v-else @click="backToPhone" :disabled="loading"
                class="text-xs text-brand-500 hover:underline disabled:opacity-50">
                Resend OTP
              </button>
            </div>

            <button
              @click="verifyOTP"
              :disabled="loading || otpCode.length < 6"
              class="btn-primary w-full justify-center disabled:opacity-40"
            >
              <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              {{ loading ? 'Verifying…' : 'Verify & Sign In' }}
            </button>
          </div>

          <!-- ── Step 3: Success ─────────────────────────────────────────── -->
          <div v-else-if="step === 'success'" class="text-center py-4">
            <div class="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <p class="text-sm font-semibold" style="color: var(--text-base)">Verified!</p>
            <p class="text-xs text-surface-400 mt-1">Signing you in…</p>
          </div>

        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { auth } from '@/firebase.js'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

const props = defineProps({
  open: { type: Boolean, default: false }
})
const emit = defineEmits(['success', 'cancel'])

// ── State ─────────────────────────────────────────────────────────────────────
const step           = ref('phone')
const loading        = ref(false)
const error          = ref('')
const countryCode    = ref('+855')
const phoneNumber    = ref('')
const otpDigits      = ref(['', '', '', '', '', ''])
const otpRefs        = ref([])
const resendTimer    = ref(0)
const sentToPhone    = ref('')
const recaptchaSolved = ref(false)  // ← tracks if checkbox is checked

let timerInterval  = null
let confirmResult  = null
let recaptchaWidget = null

const fullPhone = computed(() =>
  `${countryCode.value}${phoneNumber.value.replace(/\s/g, '').replace(/^0/, '')}`
)
const otpCode = computed(() => otpDigits.value.join(''))

// ── reCAPTCHA ─────────────────────────────────────────────────────────────────
function clearRecaptcha() {
  recaptchaSolved.value = false
  if (window.recaptchaVerifier) {
    try { window.recaptchaVerifier.clear() } catch { /* silent */ }
    window.recaptchaVerifier = null
  }
  recaptchaWidget = null
}

async function setupRecaptcha() {
  clearRecaptcha()
  await nextTick()

  const el = document.getElementById('recaptcha-container')
  if (!el) return

  try {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'normal',
      callback: () => {
        // reCAPTCHA solved — enable Send button
        console.log('[OTP] reCAPTCHA solved ✅')
        recaptchaSolved.value = true
      },
      'expired-callback': () => {
        console.log('[OTP] reCAPTCHA expired')
        recaptchaSolved.value = false
      },
    })

    recaptchaWidget = await window.recaptchaVerifier.render()
    console.log('[OTP] reCAPTCHA rendered, widgetId:', recaptchaWidget)

  } catch (e) {
    console.error('[OTP] reCAPTCHA setup failed:', e.code, e.message)
    error.value = `reCAPTCHA failed: ${e.message}`
  }
}

// ── Send OTP — triggered by button click ─────────────────────────────────────
async function sendOTP() {
  if (!phoneNumber.value.trim()) {
    error.value = 'Please enter your phone number'
    return
  }
  if (!recaptchaSolved.value) {
    error.value = 'Please complete the reCAPTCHA checkbox first'
    return
  }
  if (!window.recaptchaVerifier) {
    error.value = 'reCAPTCHA not ready — please refresh'
    return
  }

  loading.value = true
  error.value   = ''

  const phone = fullPhone.value
  console.log('[OTP] Sending to:', phone)

  // ── Catch the reCAPTCHA internal timeout that Firebase throws after SMS ────
  window.addEventListener('unhandledrejection', function captureRecaptchaTimeout(e) {
    if (e.reason?.message?.includes('reCAPTCHA') || e.reason?.message?.includes('Timeout')) {
      e.preventDefault() // suppress the uncaught error
      console.log('[OTP] reCAPTCHA timeout suppressed (SMS already sent)')
    }
    window.removeEventListener('unhandledrejection', captureRecaptchaTimeout)
  })

  try {
    confirmResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier)
    console.log('[OTP] SMS sent ✅ moving to OTP step')

    sentToPhone.value    = phone
    step.value           = 'otp'        // ← this was being blocked before
    recaptchaSolved.value = false

    startResendTimer()
    await nextTick()
    otpRefs.value[0]?.focus()

  } catch (e) {
    // ── Ignore reCAPTCHA timeout if SMS was already sent ─────────────────────
    if (e?.message?.includes('reCAPTCHA') || e?.message?.includes('Timeout')) {
      console.log('[OTP] reCAPTCHA timeout after send — SMS was sent, continuing')
      if (confirmResult) {
        sentToPhone.value    = phone
        step.value           = 'otp'
        recaptchaSolved.value = false
        startResendTimer()
        await nextTick()
        otpRefs.value[0]?.focus()
        loading.value = false
        return
      }
    }

    console.error('[OTP] Send failed:', e.code, e.message)
    confirmResult = null
    clearRecaptcha()
    await nextTick()
    await setupRecaptcha()

    const code = e.code || ''
    if (code === 'auth/invalid-phone-number')
      error.value = 'Invalid phone number — no leading 0'
    else if (code === 'auth/too-many-requests')
      error.value = 'Too many requests — wait a few minutes'
    else if (code === 'auth/quota-exceeded')
      error.value = 'SMS quota exceeded'
    else if (code === 'auth/billing-not-enabled')
      error.value = 'Firebase billing not enabled'
    else
      error.value = `Error: ${e.message || e.code}`

  } finally {
    loading.value = false
  }
}

// ── Verify OTP ────────────────────────────────────────────────────────────────
async function verifyOTP() {
  const code = otpCode.value
  if (code.length < 6 || !confirmResult) return

  loading.value = true
  error.value   = ''

  console.log('[OTP] Verifying code:', code)

  try {
    const result  = await confirmResult.confirm(code)
    const idToken = await result.user.getIdToken()

    console.log('[OTP] Verification success ✅')

    step.value    = 'success'
    confirmResult = null

    setTimeout(() => {
      emit('success', {
        idToken,
        phone: sentToPhone.value,
        name:  result.user.displayName || '',
      })
    }, 800)

  } catch (e) {
    console.error('[OTP] Verify failed:', e.code, e.message)

    if (e.code === 'auth/invalid-verification-code')
      error.value = 'Incorrect OTP — please try again'
    else if (e.code === 'auth/code-expired' || e.code === 'auth/session-expired')
      error.value = 'OTP expired — go back and resend'
    else
      error.value = `Error: ${e.message || e.code}`

    otpDigits.value = ['', '', '', '', '', '']
    await nextTick()
    otpRefs.value[0]?.focus()

  } finally {
    loading.value = false
  }
}

// ── Back to phone ─────────────────────────────────────────────────────────────
async function backToPhone() {
  clearInterval(timerInterval)
  step.value        = 'phone'
  error.value       = ''
  otpDigits.value   = ['', '', '', '', '', '']
  resendTimer.value = 0
  confirmResult     = null
  await nextTick()
  await setupRecaptcha()
}

// ── Timer ─────────────────────────────────────────────────────────────────────
function startResendTimer() {
  resendTimer.value = 60
  clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0) clearInterval(timerInterval)
  }, 1000)
}

// ── OTP input ─────────────────────────────────────────────────────────────────
function onOtpInput(i, e) {
  const val = e.target.value.replace(/\D/g, '').slice(0, 1)
  otpDigits.value[i] = val
  if (val && i < 5) nextTick(() => otpRefs.value[i + 1]?.focus())
  if (otpCode.value.length === 6) nextTick(verifyOTP)
}

function onOtpBackspace(i) {
  if (!otpDigits.value[i] && i > 0) {
    otpDigits.value[i - 1] = ''
    nextTick(() => otpRefs.value[i - 1]?.focus())
  }
}

function onOtpPaste(e) {
  const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
  for (let i = 0; i < 6; i++) otpDigits.value[i] = text[i] || ''
  nextTick(() => {
    otpRefs.value[Math.min(text.length, 5)]?.focus()
    if (text.length === 6) verifyOTP()
  })
}

// ── Cancel / Reset ────────────────────────────────────────────────────────────
function cancel() { emit('cancel'); reset() }

function reset() {
  step.value           = 'phone'
  loading.value        = false
  error.value          = ''
  phoneNumber.value    = ''
  sentToPhone.value    = ''
  otpDigits.value      = ['', '', '', '', '', '']
  resendTimer.value    = 0
  recaptchaSolved.value = false
  confirmResult        = null
  clearInterval(timerInterval)
  clearRecaptcha()
}

// ── Watch ─────────────────────────────────────────────────────────────────────
watch(() => props.open, async (val) => {
  if (val) {
    reset()
    await nextTick()
    await setupRecaptcha()
  } else {
    reset()
  }
})

onUnmounted(() => {
  clearInterval(timerInterval)
  clearRecaptcha()
})
</script>