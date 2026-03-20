<template>
  <div class="space-y-2">
    <label class="form-label">{{ label }}</label>

    <!-- Preview / Upload zone -->
    <div class="flex items-center gap-4">

      <!-- Avatar preview -->
      <div class="relative shrink-0">
        <div class="w-20 h-20 rounded-2xl border-2 border-dashed border-surface-600 overflow-hidden bg-surface-700 flex items-center justify-center">
          <img
            v-if="modelValue"
            :src="modelValue"
            alt="Avatar"
            class="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
            @click="$emit('preview', modelValue)"
          />
          <span v-else class="text-3xl select-none">{{ fallbackEmoji }}</span>
        </div>

        <!-- Remove button -->
        <button
          v-if="modelValue"
          type="button"
          @click="$emit('update:modelValue', '')"
          class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-colors"
          title="Remove image"
        >
          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Upload controls -->
      <div class="flex-1 space-y-2">
        <label
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-surface-500 hover:border-brand-500 bg-surface-700 hover:bg-surface-600 text-sm text-surface-300 hover:text-white cursor-pointer transition-all w-full justify-center"
          :class="{ 'opacity-60 pointer-events-none': uploading }"
        >
          <svg v-if="!uploading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <span>{{ uploading ? 'Uploading…' : 'Upload Photo' }}</span>
          <input
            type="file"
            accept="image/*"
            class="hidden"
            :disabled="uploading"
            @change="handleFile"
          />
        </label>

        <p class="text-xs text-surface-400 text-center">
          JPG, PNG, WebP · Max 5MB
        </p>
      </div>
    </div>

    <!-- Error -->
    <p v-if="error" class="text-xs text-red-400 flex items-center gap-1">
      <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { uploadApi } from '@/services/api.js'

const props = defineProps({
  modelValue:    { type: String,  default: '' },
  label:         { type: String,  default: 'Profile Photo' },
  fallbackEmoji: { type: String,  default: '👤' },
})

const emit = defineEmits(['update:modelValue', 'preview'])

const uploading = ref(false)
const error     = ref('')

async function handleFile(e) {
  const file = e.target.files?.[0]
  if (!file) return

  // Validate size (5 MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'File too large — max 5 MB'
    e.target.value = ''
    return
  }

  error.value   = ''
  uploading.value = true
  try {
    const { data } = await uploadApi.image(file)
    emit('update:modelValue', data.url)
  } catch {
    error.value = 'Upload failed — please try again'
  } finally {
    uploading.value = false
    e.target.value  = ''
  }
}
</script>