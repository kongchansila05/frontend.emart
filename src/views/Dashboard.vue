<template>
  <div class="flex h-screen overflow-hidden">
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      <main class="flex-1 overflow-y-auto p-8 animate-fade-in">

        <!-- Stat cards -->
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <div
            v-for="card in statCards"
            :key="card.key"
            class="card p-5 hover:border-surface-500 transition-all group"
          >
            <div class="flex items-start justify-between mb-4">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center text-xl', card.bg]">
                {{ card.icon }}
              </div>
              <span :class="['text-xs font-semibold px-2.5 py-1 rounded-lg', card.badgeClass]">
                {{ card.badge }}
              </span>
            </div>
            <div :class="['text-4xl font-bold mb-1 font-mono', card.valueClass]">
              {{ stats[card.key] ?? '—' }}
            </div>
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {{ card.label }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-5 gap-5">

          <!-- Quick Actions -->
          <div class="xl:col-span-2 card p-6">
            <h3 class="font-semibold text-gray-800 mb-5">Quick Actions</h3>
            <div class="space-y-2">
              <router-link
                v-for="q in quickActions"
                :key="q.to"
                :to="q.to"
                class="flex items-center gap-4 px-4 py-3.5 bg-surface-950 hover:bg-surface-900 border border-surface-600 hover:border-surface-500 rounded-xl transition-all group cursor-pointer"
              >
                <div :class="['w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0', q.bg]">
                  {{ q.icon }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-semibold text-gray-800 group-hover:text-brand-600 transition-colors">
                    {{ q.label }}
                  </div>
                  <div class="text-xs text-gray-400 truncate">{{ q.desc }}</div>
                </div>
                <svg class="w-4 h-4 text-gray-400 group-hover:text-brand-600 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </router-link>
            </div>
          </div>

          <!-- Platform Summary -->
          <div class="xl:col-span-3 card p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-semibold text-gray-800">Platform Summary</h3>
              <span class="text-xs text-gray-400 bg-surface-900 px-2.5 py-1 rounded-lg">Live data</span>
            </div>
            <div class="space-y-5">
              <div v-for="row in summaryRows" :key="row.label" class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 font-medium">{{ row.label }}</span>
                  <span :class="['text-sm font-bold font-mono', row.textColor]">
                    {{ stats[row.key] ?? 0 }}
                  </span>
                </div>
                <div class="h-1.5 bg-surface-900 rounded-full overflow-hidden">
                  <div
                    :class="['h-full rounded-full transition-all duration-1000', row.barColor]"
                    :style="{ width: barWidth(row) + '%' }"
                  ></div>
                </div>
              </div>
            </div>

            <div class="mt-6 pt-5 border-t border-surface-600 grid grid-cols-3 gap-4">
              <div v-for="m in miniStats" :key="m.label" class="text-center">
                <div :class="['text-2xl font-bold font-mono mb-0.5', m.color]">{{ stats[m.key] ?? 0 }}</div>
                <div class="text-xs text-gray-400">{{ m.label }}</div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Navbar  from '@/components/Navbar.vue'
import { dashApi } from '@/services/api.js'

const stats = ref({})

const statCards = [
  { key: 'total_users',      label: 'Total Users',      icon: '👥', badge: 'Members',  badgeClass: 'bg-indigo-100 text-indigo-700 border border-indigo-200', valueClass: 'text-indigo-600',  bg: 'bg-indigo-100' },
  { key: 'total_posts',      label: 'Total Posts',      icon: '📦', badge: 'Listings', badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200',   valueClass: 'text-amber-600',   bg: 'bg-amber-100'  },
  { key: 'active_posts',     label: 'Active Posts',     icon: '✅', badge: 'Live',     badgeClass: 'bg-emerald-100 text-emerald-700 border border-emerald-200', valueClass: 'text-emerald-700', bg: 'bg-emerald-100' },
  { key: 'total_categories', label: 'Categories',       icon: '🗂️', badge: 'Sections', badgeClass: 'bg-violet-100 text-violet-700 border border-violet-200', valueClass: 'text-violet-700', bg: 'bg-violet-100'  },
]

const quickActions = [
  { to: '/users',      label: 'Manage Users',      desc: 'Set limits, roles, and status',         icon: '👥', bg: 'bg-indigo-100' },
  { to: '/posts',      label: 'Moderate Posts',    desc: 'Review and update listing status',       icon: '📋', bg: 'bg-amber-100'  },
  { to: '/categories', label: 'Edit Categories',   desc: 'Add, update, or remove categories',     icon: '🗂️', bg: 'bg-violet-100' },
  { to: '/roles',      label: 'Roles & Perms',     desc: 'Configure role-based access control',   icon: '🔐', bg: 'bg-emerald-100' },
]

const summaryRows = [
  { label: 'Active Listings',  key: 'active_posts',     barColor: 'bg-emerald-400', textColor: 'text-emerald-700', relKey: 'total_posts' },
  { label: 'Sold Items',       key: 'sold_posts',        barColor: 'bg-red-400',     textColor: 'text-red-600',    relKey: 'total_posts' },
  { label: 'Registered Users', key: 'total_users',       barColor: 'bg-indigo-400',  textColor: 'text-indigo-700', relKey: 'total_users' },
]

const miniStats = [
  { label: 'Total Posts',  key: 'total_posts',  color: 'text-amber-600'   },
  { label: 'Sold',         key: 'sold_posts',    color: 'text-red-600'     },
  { label: 'Categories',   key: 'total_categories', color: 'text-violet-700' },
]

function barWidth(row) {
  const val = stats.value[row.key] || 0
  const max = stats.value[row.relKey] || 1
  return Math.min(100, Math.round((val / max) * 100))
}

onMounted(async () => {
  try {
    const { data } = await dashApi.stats()
    stats.value = data
  } catch {}
})
</script>
