<template>
  <header
    class="sticky top-0 z-20 h-16 backdrop-blur-md border-b border-surface-600 flex items-center justify-between px-8 shadow-sm"
    style="background-color: var(--surface-800);" >
        <!-- Sidebar toggle -->
    <button
      @click="sidebarToggle"
      class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-600 transition-all"
      style="background-color: var(--surface-700); color: var(--surface-400);"
      :title="sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'"
    >
      <!-- Collapse icon (sidebar open) -->
      <svg v-if="sidebarOpen" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M11 19l-7-7 7-7M21 19l-7-7 7-7"/>
      </svg>
      <!-- Expand icon (sidebar closed) -->
      <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
      </svg>
    </button>
    <!-- Left: Page title -->
    <!-- <div>
      <h1 class="text-base font-bold" style="color: var(--text-base)">{{ title }}</h1>
      <p class="text-xs text-surface-400">{{ subtitle }}</p>
    </div> -->

    <!-- Right: theme toggle + api status + user -->
    <div class="flex items-center gap-5">

      <!-- API status
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-dot"></span>
        <span class="text-xs font-mono text-surface-400">{{ apiUrl }}</span>
      </div>
      -->
      <div class="h-5 w-px bg-surface-600"></div>

      <!-- User -->
      <div class="flex items-center gap-2.5 cursor-pointer">
        <div
          class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0"
          :style="{ background: avatarColor }"
        >
          {{ auth.userAvatar }}
        </div>
        <div class="hidden sm:block">
          <div class="text-sm font-semibold" style="color: var(--text-base)">{{ auth.userName }}</div>
          <div class="text-xs text-brand-500">{{ auth.roleName }}</div>
        </div>
      </div>

      <div class="h-5 w-px bg-surface-600"></div>

      <!-- Theme toggle -->
      <button
        @click="toggle"
        class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-600 transition-all"
        style="background-color: var(--surface-700); color: var(--surface-400);"
        :title="theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'"
      >
        <!-- Sun — shown in dark mode -->
        <svg v-if="theme === 'dark'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
        </svg>
        <!-- Moon — shown in light mode -->
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
        </svg>
      </button>

    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'
import { useTheme }     from '@/composables/useTheme.js'
import { useSidebar } from '@/composables/useSidebar.js'

const { isOpen: sidebarOpen, toggle: sidebarToggle } = useSidebar()
const { theme, toggle } = useTheme()
const auth  = useAuthStore()
const route = useRoute()

const pageMeta = {
  '/':           { title: 'Dashboard',           subtitle: 'Platform overview and key metrics' },
  '/posts':      { title: 'Posts',               subtitle: 'Moderate all marketplace listings' },
  '/categories': { title: 'Categories',          subtitle: 'Organize listings into categories' },
  '/banners':    { title: 'Banners',             subtitle: 'Manage promotional banners' },
  '/roles':      { title: 'Roles & Permissions', subtitle: 'Configure role-based access control' },
  '/clients':    { title: 'Client Users',        subtitle: 'Manage client accounts and post limits' },
  '/staff':      { title: 'Staff & Users',       subtitle: 'Manage admin and staff accounts' },
}

const title    = computed(() => pageMeta[route.path]?.title    || 'Admin Panel')
const subtitle = computed(() => pageMeta[route.path]?.subtitle || '')
const apiUrl   = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const avatarColor = computed(() => {
  const colors = ['#f59e0b', '#6366f1', '#10b981', '#ec4899', '#3b82f6', '#8b5cf6']
  return colors[(auth.userName?.charCodeAt(0) || 0) % colors.length]
})
</script>