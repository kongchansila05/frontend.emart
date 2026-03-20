<template>
  <button
    type="button"
    @click="open = true"
    class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl
           border border-brand-200 bg-brand-50 text-brand-600
           hover:bg-brand-100 transition-all w-full justify-center mt-1"
  >
    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
    {{ modelValue.lat && modelValue.lng ? 'Change on Map' : 'Pick on Map' }}
  </button>

  <teleport to="body">
    <transition name="modal">
      <div v-if="open" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="cancel"></div>
        <div class="relative z-10 w-full max-w-2xl card shadow-2xl overflow-hidden">

          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-surface-600">
            <div>
              <h3 class="text-sm font-bold" style="color: var(--text-base)">Pick Location</h3>
              <p class="text-xs text-surface-400 mt-0.5">Click anywhere on the map to set coordinates</p>
            </div>
            <button @click="cancel" class="text-surface-400 hover:text-red-500 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Search bar -->
          <div class="px-5 py-3 border-b border-surface-600 flex gap-2">
            <input
              v-model="searchQuery"
              @keyup.enter="searchLocation"
              placeholder="Search place, city, address…"
              class="form-input py-2 flex-1"
            />
            <button @click="searchLocation" :disabled="searching" class="btn-primary py-2 px-4 text-xs">
              <svg v-if="searching" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              Search
            </button>
          </div>

          <!-- Map -->
          <div ref="mapEl" class="w-full h-80"></div>

          <!-- Coordinates + actions -->
          <div class="px-5 py-3 border-t border-surface-600 flex items-center justify-between gap-4">
            <div class="flex items-center gap-4 text-xs font-mono">
              <span class="text-surface-400">
                Lat: <span class="font-semibold" style="color: var(--text-base)">
                  {{ picked.lat ? picked.lat.toFixed(6) : '—' }}
                </span>
              </span>
              <span class="text-surface-400">
                Lng: <span class="font-semibold" style="color: var(--text-base)">
                  {{ picked.lng ? picked.lng.toFixed(6) : '—' }}
                </span>
              </span>
            </div>
            <div class="flex gap-2">
              <button @click="cancel" class="btn-ghost py-2 text-xs">Cancel</button>
              <button
                @click="confirm"
                :disabled="!picked.lat || !picked.lng"
                class="btn-primary py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Use This Location
              </button>
            </div>
          </div>

        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({ lat: null, lng: null }) }
})
const emit = defineEmits(['update:modelValue'])

const open        = ref(false)
const mapEl       = ref(null)
const searchQuery = ref('')
const searching   = ref(false)
const picked      = ref({ lat: props.modelValue.lat, lng: props.modelValue.lng })

let map    = null
let marker = null
let L      = null

async function loadLeaflet() {
  if (L) return L
  const mod = await import('leaflet')
  L = mod.default
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link')
    link.id   = 'leaflet-css'
    link.rel  = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
  return L
}

async function initMap() {
  const Leaflet = await loadLeaflet()
  await nextTick()
  if (!mapEl.value) return
  const defaultLat = picked.value.lat || 11.5564
  const defaultLng = picked.value.lng || 104.9282
  map = Leaflet.map(mapEl.value).setView([defaultLat, defaultLng], 13)
  Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors', maxZoom: 19,
  }).addTo(map)
  if (picked.value.lat && picked.value.lng) {
    marker = Leaflet.marker([picked.value.lat, picked.value.lng]).addTo(map)
  }
  map.on('click', (e) => {
    const { lat, lng } = e.latlng
    picked.value = { lat: +lat.toFixed(6), lng: +lng.toFixed(6) }
    if (marker) { marker.setLatLng([lat, lng]) }
    else        { marker = Leaflet.marker([lat, lng]).addTo(map) }
  })
}

function destroyMap() {
  if (map) { map.remove(); map = null; marker = null }
}

async function searchLocation() {
  if (!searchQuery.value.trim()) return
  searching.value = true
  try {
    const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery.value)}&format=json&limit=1`)
    const data = await res.json()
    if (data.length) {
      const lat = parseFloat(data[0].lat)
      const lng = parseFloat(data[0].lon)
      map.setView([lat, lng], 15)
      picked.value = { lat: +lat.toFixed(6), lng: +lng.toFixed(6) }
      if (marker) { marker.setLatLng([lat, lng]) }
      else        { marker = L.marker([lat, lng]).addTo(map) }
    }
  } catch { /* silent */ }
  finally { searching.value = false }
}

function confirm() { emit('update:modelValue', { ...picked.value }); open.value = false }
function cancel()  { open.value = false }

watch(open, async (val) => {
  if (val) {
    picked.value      = { lat: props.modelValue.lat, lng: props.modelValue.lng }
    searchQuery.value = ''
    await nextTick()
    await initMap()
  } else { destroyMap() }
})

onUnmounted(destroyMap)
</script>