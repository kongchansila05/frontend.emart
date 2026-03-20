import { ref, watchEffect } from 'vue'

// Read saved theme from localStorage, default to 'dark'
const theme = ref(localStorage.getItem('mp_theme') || 'dark')

// Apply on every change
watchEffect(() => {
  const html = document.documentElement
  if (theme.value === 'dark') {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
  localStorage.setItem('mp_theme', theme.value)
})

export function useTheme() {
  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  const isDark = () => theme.value === 'dark'

  return { theme, toggle, isDark }
}