<template>
  <Transition name="sidebar">
    <aside v-show="isOpen" class="w-64 shrink-0 h-screen sticky top-0 flex flex-col border-r border-surface-600 overflow-y-auto shadow-sm"
      style="background-color: var(--surface-800)">

      <!-- Brand -->
      <div class="px-5 py-5 border-b border-surface-600 h-16">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30 shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div>
            <div class="text-sm font-bold tracking-tight" style="color: var(--text-base)">
              Market<span class="text-brand-500">Place</span>
            </div>
            <div class="text-xs font-mono text-surface-400">Admin Panel</div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-0.5">
        <template v-for="group in navGroups" :key="group.label">
          <template v-if="group.items.some(i => !i.hidden)">
            <p class="text-xs font-bold text-surface-100 uppercase tracking-widest px-3 pt-4 pb-2">
              {{ group.label }}
            </p>

            <template v-for="item in group.items" :key="item.to">
              <router-link v-if="!item.hidden" :to="item.to" custom v-slot="{ isActive, navigate }">
                <button
                  @click="navigate"
                  :class="[
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-150 border',
                    isActive
                      ? 'bg-brand-500 text-white border-brand-500/25'
                      : 'border-transparent text-surface-300 hover:text-brand-500'
                  ]"
                  :style="!isActive ? { ':hover': { backgroundColor: 'var(--surface-700)' } } : {}"
                  @mouseenter="e => !isActive && (e.currentTarget.style.backgroundColor = 'var(--surface-700)')"
                  @mouseleave="e => !isActive && (e.currentTarget.style.backgroundColor = '')"
                >
                  <component :is="item.icon" class="w-4 h-4 shrink-0" />
                  {{ item.label }}
                  <span v-if="item.badge" class="ml-auto text-xs bg-brand-500/15 text-brand-600 px-2 py-0.5 rounded-full font-mono">
                    {{ item.badge }}
                  </span>
                </button>
              </router-link>
            </template>
          </template>
        </template>
      </nav>

      <!-- Role badge -->
      <div class="px-4 pb-2">
        <div :class="[
          'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border',
          auth.isAdministrator
            ? 'bg-brand-500/10 border-brand-500/20 text-brand-500'
            : 'bg-violet-500/10 border-violet-500/20 text-violet-500'
        ]">
          <span>{{ auth.isAdministrator ? '👑' : '🛡️' }}</span>
          <span>{{ auth.isAdministrator ? 'Super Administrator' : 'Staff Admin' }}</span>
        </div>
      </div>

      <!-- User Card -->
      <div class="p-3 border-t border-surface-600">
        <div class="flex items-center gap-3 px-3 py-3 rounded-xl border border-surface-600"
          style="background-color: var(--surface-1000)">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white shrink-0"
            :style="{ background: avatarColor }"
          >
            {{ auth.userAvatar }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold truncate" style="color: var(--text-base)">
              {{ auth.userName }}
            </div>
            <div class="text-xs text-surface-300 font-mono truncate">{{ auth.userEmail }}</div>
          </div>
          <button
            @click="auth.logout"
            class="text-surface-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
            title="Sign out"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>

    </aside>
  </Transition>
</template>

<script setup>
import { computed, h } from 'vue'
import { useAuthStore } from '@/store/auth.js'
import { useSidebar } from '@/composables/useSidebar.js'

const { isOpen } = useSidebar()

const auth = useAuthStore()

const avatarColor = computed(() => {
  const colors = ['#f59e0b', '#6366f1', '#10b981', '#ec4899', '#3b82f6', '#8b5cf6']
  return colors[(auth.userName?.charCodeAt(0) || 0) % colors.length]
})

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconDashboard = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
    d: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' })
])
const IconClients = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
    d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
])
const IconStaff = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
    d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' })
])
const IconPosts = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
    d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' })
])
const IconCategories = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
    d: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' })
])
const IconRoles = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
    d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' })
])
const IconBanners = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
    d: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' })
])
// ── Chat icon ─────────────────────────────────────────────────────────────────
const IconChat = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
    d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' })
])
// ── Nav groups ────────────────────────────────────────────────────────────────
const navGroups = computed(() => [
  {
    label: 'Overview',
    items: [
      { to: '/',      label: 'Dashboard', icon: IconDashboard, hidden: false }
    ]
  },
  {
    label: 'Marketplace',
    items: [
      { to: '/posts',      label: 'Posts',      icon: IconPosts,      hidden: false },
      { to: '/categories', label: 'Categories', icon: IconCategories, hidden: !auth.isAdministrator },
      { to: '/banners',    label: 'Banners',    icon: IconBanners,    hidden: !auth.isAdministrator },
    ]
  },
  {
    label: 'Users',
    items: [
      { to: '/clients', label: 'Client Users',  icon: IconClients, hidden: false },
      { to: '/staff',   label: 'Staff & Users', icon: IconStaff,   hidden: !auth.isAdministrator },
    ]
  },
  {
    label: 'Communication',        // ← new group
    items: [
      { to: '/chat', label: 'Chat Monitor', icon: IconChat, hidden: false }, // ← visible to both roles
    ]
  },
  {
    label: 'Access Control',
    items: [
      { to: '/roles', label: 'Roles & Permissions', icon: IconRoles, hidden: !auth.isAdministrator },
    ]
  }
])
</script>

<style scoped>
.sidebar-enter-active,
.sidebar-leave-active {
  transition: width 0.25s ease, opacity 0.2s ease;
  overflow: hidden;
}
.sidebar-enter-from,
.sidebar-leave-to {
  width: 0;
  opacity: 0;
}
.sidebar-enter-to,
.sidebar-leave-from {
  width: 16rem; /* 256px = w-64 */
  opacity: 1;
}
</style>