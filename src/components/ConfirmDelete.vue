<template>
  <transition name="modal">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('update:modelValue', false)"></div>

      <div class="relative card w-full max-w-sm p-7 shadow-2xl z-10">

        <!-- Close -->
        <button
          @click="$emit('update:modelValue', false)"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Icon -->
        <div class="flex justify-center mb-5">
          <div class="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
            <!-- If item-icon is an image URL -->
            <img
              v-if="itemIcon && isImageUrl(itemIcon)"
              :src="itemIcon"
              :alt="itemName"
              class="w-full h-full object-cover rounded-2xl"
            />
            <!-- If item-icon is an emoji -->
            <span v-else-if="itemIcon" class="text-3xl">{{ itemIcon }}</span>
            <!-- Default trash icon -->
            <svg v-else class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </div>
        </div>

        <!-- Title -->
        <h2 class="text-lg font-bold text-gray-800 text-center mb-1">{{ title }}</h2>

        <!-- Item name highlight -->
        <p v-if="itemName" class="text-center text-sm text-gray-500 mb-1">
          <span class="font-semibold text-gray-700">"{{ itemName }}"</span> will be permanently removed.
        </p>

        <!-- Description -->
        <p v-if="description" class="text-center text-sm text-gray-500 mb-1">
          {{ description }}
        </p>

        <!-- Warning -->
        <p v-if="warning" class="text-center text-xs text-red-500 mt-2 mb-5">
          ⚠️ {{ warning }}
        </p>
        <div v-else class="mb-5"></div>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button
            type="button"
            :disabled="loading"
            @click="$emit('update:modelValue', false)"
            class="btn-ghost flex-1 justify-center"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="loading"
            @click="$emit('confirm')"
            class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5
                   bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed
                   text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-red-500/20"
          >
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            {{ loading ? 'Deleting…' : confirmLabel }}
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  modelValue:   { type: Boolean, required: true },
  title:        { type: String,  default: 'Confirm Delete' },
  itemName:     { type: String,  default: '' },
  itemIcon:     { type: String,  default: '' },
  description:  { type: String,  default: '' },
  warning:      { type: String,  default: '' },
  confirmLabel: { type: String,  default: 'Yes, Delete' },
  loading:      { type: Boolean, default: false },
})

defineEmits(['update:modelValue', 'confirm'])

function isImageUrl(str) {
  return str?.startsWith('http') || str?.startsWith('/')  || str?.startsWith('data:')
}
</script>