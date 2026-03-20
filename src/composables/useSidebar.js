import { ref } from 'vue'

const isOpen = ref(window.innerWidth > 900)

window.addEventListener('resize', () => {
  if (window.innerWidth <= 900) isOpen.value = false
})

export function useSidebar() {
  const toggle = () => (isOpen.value = !isOpen.value)
  const close  = () => (isOpen.value = false)
  const open   = () => (isOpen.value = true)
  return { isOpen, toggle, open, close }
}