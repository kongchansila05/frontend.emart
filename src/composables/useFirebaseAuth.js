import { ref } from 'vue'
import { auth, googleProvider, appleProvider, signInWithPopup } from '@/firebase.js'

export function useFirebaseAuth() {
  const loading = ref(false)
  const error   = ref('')

  async function signInWithGoogle() {
    loading.value = true
    error.value   = ''
    try {
      const result  = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      const name    = result.user.displayName || ''
      return { idToken, name, photoURL: result.user.photoURL }
    } catch (e) {
      error.value = e.message || 'Google sign-in failed'
      return null
    } finally {
      loading.value = false
    }
  }

  async function signInWithApple() {
    loading.value = true
    error.value   = ''
    try {
      const result  = await signInWithPopup(auth, appleProvider)
      const idToken = await result.user.getIdToken()
      const name    = result.user.displayName || ''
      return { idToken, name }
    } catch (e) {
      error.value = e.message || 'Apple sign-in failed'
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, error, signInWithGoogle, signInWithApple }
}