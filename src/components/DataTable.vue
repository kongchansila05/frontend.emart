<template>
  <div class="card overflow-hidden">
    <!-- Header slot -->
    <div v-if="$slots.header" class="px-6 py-4 border-b border-surface-600 flex items-center justify-between gap-4 flex-wrap">
      <slot name="header" />
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-surface-600 bg-surface-950">
            <th
              v-for="col in columns"
              :key="col.key"
              :class="['px-6 py-3.5 text-xs font-semibold text-surface-400 uppercase tracking-wider', col.align === 'right' ? 'text-right' : 'text-left']"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-600">

          <!-- Loading state -->
          <tr v-if="loading">
            <td :colspan="columns.length" class="px-6 py-16 text-center">
              <div class="flex flex-col items-center gap-3 text-surface-400">
                <svg class="w-7 h-7 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <span class="text-sm">Loading data…</span>
              </div>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-else-if="!rows.length">
            <td :colspan="columns.length" class="px-6 py-16 text-center">
              <div class="flex flex-col items-center gap-3 text-surface-400">
                <div class="text-4xl">{{ emptyIcon }}</div>
                <div class="text-sm font-medium">{{ emptyText }}</div>
                <slot name="empty-action" />
              </div>
            </td>
          </tr>

          <!-- Data rows -->
          <tr v-else v-for="(row, i) in rows" :key="row.ID || row.id || i" class="hover:bg-surface-950/60 transition-colors">
            <td
              v-for="col in columns"
              :key="col.key"
              :class="['px-6 py-4', col.align === 'right' ? 'text-right' : 'text-left', col.class || '']"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                <span class="text-sm text-gray-700">{{ row[col.key] ?? '—' }}</span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer slot -->
    <div v-if="rows.length" class="px-6 py-3 border-t border-surface-600 flex items-center justify-between">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  columns:   { type: Array,   required: true },
  rows:      { type: Array,   default: () => [] },
  loading:   { type: Boolean, default: false },
  emptyText: { type: String,  default: 'No records found' },
  emptyIcon: { type: String,  default: '📭' },
})
</script>