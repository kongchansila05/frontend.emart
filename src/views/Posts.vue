<template>
  <div class="flex h-screen overflow-hidden">
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      <main class="flex-1 overflow-y-auto p-8 animate-fade-in">

        <DataTable :columns="columns" :rows="rows" :loading="loading" empty-text="No posts found" empty-icon="📦">

          <template #header>
            <div class="flex items-center gap-2">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input v-model="search" @input="onSearch" placeholder="Search posts…" class="form-input pl-10 py-2 w-56" />
              </div>
              <select v-model="statusFilter" @change="setFilter('status', statusFilter)" class="form-select py-2 w-36">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="sold">Sold</option>
                <option value="pending">Pending</option>
              </select>
              <button v-if="statusFilter || search" @click="clearFilters"
                class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500
                       bg-surface-900 hover:bg-red-50 hover:text-red-500 hover:border-red-200
                       border border-surface-600 rounded-xl transition-all">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Clear
              </button>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <select v-model="limitValue" @change="setLimit(limitValue)" class="form-select py-2 w-28">
                <option value="10">10 / page</option>
                <option value="25">25 / page</option>
                <option value="50">50 / page</option>
                <option value="100">100 / page</option>
              </select>
              <button @click="load(1)" class="btn-ghost py-2 text-xs">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Refresh
              </button>
              <button @click="openCreate" class="btn-primary">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Create Post
              </button>
            </div>
          </template>

          <!-- Title -->
          <template #cell-title="{ row }">
            <div class="max-w-xs">
              <div class="font-semibold text-gray-800 text-sm truncate">{{ row.title }}</div>
            </div>
          </template>

          <!-- Seller -->
          <template #cell-seller="{ row }">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-surface-600"
                :class="row.user?.avatar ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''"
                @click="row.user?.avatar && openImagePopup(row.user.avatar, row.user.name)">
                <img v-if="row.user?.avatar" :src="row.user.avatar" :alt="row.user.name" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center font-bold text-xs text-black"
                  :style="{ background: avatarColor(row.user?.name) }">{{ row.user?.name?.[0] }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-800">{{ row.user?.name }}</div>
                <div class="text-xs text-gray-400 font-mono">{{ row.user?.email }}</div>
              </div>
            </div>
          </template>

          <!-- Category + SubCategory -->
          <template #cell-category="{ row }">
            <div>
              <div class="text-sm text-gray-700">{{ row.category?.name || '—' }}</div>
              <div v-if="row.sub_category?.name" class="text-xs text-brand-500 mt-0.5">
                ↳ {{ row.sub_category.name }}
              </div>
            </div>
          </template>

          <!-- Price -->
          <template #cell-price="{ row }">
            <span class="text-sm font-bold text-brand-600 font-mono">${{ row.price?.toLocaleString() }}</span>
          </template>

          <!-- Engagement -->
          <template #cell-engagement="{ row }">
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1 text-xs text-gray-400 font-mono">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                {{ row.view_count ?? 0 }}
              </span>
              <span class="flex items-center gap-1 text-xs font-mono" :class="row.like_count > 0 ? 'text-red-400' : 'text-gray-400'">
                <svg class="w-3.5 h-3.5" :fill="row.like_count > 0 ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                {{ row.like_count ?? 0 }}
              </span>
            </div>
          </template>

          <!-- Status -->
          <template #cell-status="{ row }">
            <span :class="['text-xs font-semibold px-2.5 py-1 rounded-lg border',
              row.status === 'active'  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              row.status === 'sold'    ? 'bg-red-50 text-red-600 border-red-200' :
                                        'bg-brand-500/10 text-brand-600 border-brand-500/20']">
              {{ row.status }}
            </span>
          </template>

          <!-- Location -->
          <template #cell-location="{ row }">
            <div>
              <div class="text-xs text-gray-600">{{ row.location || '—' }}</div>
              <div v-if="row.condition" class="text-xs text-gray-400">{{ row.condition }}</div>
            </div>
          </template>

          <!-- Lat/Lng -->
          <template #cell-lat&lng="{ row }">
            <div>
              <a v-if="row.latitude && row.longitude"
                :href="`https://www.google.com/maps?q=${row.latitude},${row.longitude}`"
                target="_blank" rel="noopener noreferrer"
                class="text-xs text-brand-500 font-mono cursor-pointer inline-flex items-center gap-1">
                📍 {{ row.latitude?.toFixed(4) }}, {{ row.longitude?.toFixed(4) }}
              </a>
              <span v-else class="text-xs text-gray-400">—</span>
            </div>
          </template>

          <!-- Actions -->
          <template #cell-actions="{ row }">
            <div class="flex items-center justify-end gap-2">
              <button @click="openEdit(row)" class="btn-warning">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit
              </button>
              <button @click="openDetail(row)" class="btn-ghost py-1.5 text-xs">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                View
              </button>
              <button @click="openDelete(row)" class="btn-danger">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </template>

          <!-- Pagination footer -->
          <template #footer>
            <span class="text-xs text-gray-400">
              Showing <span class="font-semibold text-gray-700">{{ rangeFrom }}</span>
              to <span class="font-semibold text-gray-700">{{ rangeTo }}</span>
              of <span class="font-semibold text-gray-700">{{ meta.total_items }}</span> entries
            </span>
            <div class="flex items-center gap-1">
              <button @click="goToPage(meta.page - 1)" :disabled="!meta.has_prev"
                class="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-surface-600
                       text-gray-500 hover:bg-surface-900 hover:text-gray-800
                       disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <template v-for="p in pageNumbers" :key="p">
                <span v-if="p === '...'" class="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>
                <button v-else @click="goToPage(p)"
                  :class="['w-8 h-8 rounded-lg text-sm font-medium transition-all border',
                    p === meta.page
                      ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                      : 'border-surface-600 text-gray-600 hover:bg-surface-900 hover:text-gray-800']">
                  {{ p }}
                </button>
              </template>
              <button @click="goToPage(meta.page + 1)" :disabled="!meta.has_next"
                class="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-surface-600
                       text-gray-500 hover:bg-surface-900 hover:text-gray-800
                       disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </template>

        </DataTable>

        <!-- ── Detail Modal ────────────────────────────────────────────────── -->
        <transition name="modal">
          <div v-if="detail" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="detail = null"></div>
            <div class="relative card w-full max-w-lg p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
              <button @click="detail = null" class="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
              <div class="flex items-center gap-2 mb-5 flex-wrap">
                <span :class="['text-xs font-semibold px-2.5 py-1 rounded-lg',
                  detail.status === 'active' ? 'badge-active' :
                  detail.status === 'sold'   ? 'badge-sold'   : 'badge-pending']">{{ detail.status }}</span>
                <span class="text-xs text-gray-500 bg-surface-900 border border-surface-600 px-2.5 py-1 rounded-lg">
                  {{ detail.category?.name || '—' }}
                </span>
                <span v-if="detail.sub_category?.name"
                  class="text-xs text-brand-600 bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 rounded-lg">
                  ↳ {{ detail.sub_category.name }}
                </span>
              </div>
              <h2 class="text-xl font-bold text-gray-800 mb-2">{{ detail.title }}</h2>
              <p class="text-3xl font-bold text-brand-600 font-mono mb-4">${{ detail.price?.toLocaleString() }}</p>
              <div v-if="parseImages(detail.images).length" class="flex gap-2 flex-wrap mb-4">
                <img v-for="(url, i) in parseImages(detail.images)" :key="i" :src="url"
                  class="w-20 h-20 object-cover rounded-xl border border-surface-600 cursor-pointer hover:opacity-80"
                  @click="openImagePopup(url)" />
              </div>
              <div v-if="detail.description"
                class="prose prose-sm max-w-none text-gray-500 text-sm leading-relaxed mb-4"
                v-html="detail.description"></div>
              <p v-else class="text-gray-400 text-sm mb-4 italic">No description provided.</p>
              <div class="grid grid-cols-2 gap-4 bg-surface-900 rounded-xl p-4 text-sm border border-surface-600 mb-4">
                <div><span class="text-gray-400 text-xs block mb-1">SELLER</span><span class="font-medium text-gray-800">{{ detail.user?.name }}</span></div>
                <div><span class="text-gray-400 text-xs block mb-1">LOCATION</span><span class="font-medium text-gray-800">{{ detail.location || '—' }}</span></div>
                <div><span class="text-gray-400 text-xs block mb-1">CONDITION</span><span class="font-medium text-gray-800">{{ detail.condition || '—' }}</span></div>
                <div><span class="text-gray-400 text-xs block mb-1">POSTED</span><span class="font-medium text-gray-800">{{ formatDate(detail.CreatedAt) }}</span></div>
              </div>
              <div v-if="detail.latitude && detail.longitude"
                class="rounded-xl overflow-hidden border border-surface-600 h-48 mb-4">
                <iframe :src="`https://maps.google.com/maps?q=${detail.latitude},${detail.longitude}&z=15&output=embed`"
                  class="w-full h-full border-0" loading="lazy"></iframe>
              </div>
              <div class="flex items-center justify-between px-4 py-3 bg-surface-900 border border-surface-600 rounded-xl">
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-1.5 text-gray-500">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    <span class="text-sm font-mono font-semibold text-gray-700">{{ detail.view_count ?? 0 }}</span>
                    <span class="text-xs text-gray-400">views</span>
                  </div>
                  <div class="flex items-center gap-1.5" :class="detail.like_count > 0 ? 'text-red-400' : 'text-gray-400'">
                    <svg class="w-4 h-4" :fill="detail.like_count > 0 ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    <span class="text-sm font-mono font-semibold">{{ detail.like_count ?? 0 }}</span>
                    <span class="text-xs">likes</span>
                  </div>
                </div>
                <button @click="adminToggleLike(detail)"
                  :class="['flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
                    detail.is_liked
                      ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                      : 'bg-surface-900 border-surface-600 text-gray-500 hover:border-red-200 hover:text-red-400']">
                  <svg class="w-3.5 h-3.5" :fill="detail.is_liked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  {{ detail.is_liked ? 'Unlike' : 'Like' }}
                </button>
              </div>
            </div>
          </div>
        </transition>

        <!-- ── Create Post Modal ───────────────────────────────────────────── -->
        <transition name="modal">
          <div v-if="createModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="createModal.open = false"></div>
            <div class="relative card w-full max-w-lg p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
              <button @click="createModal.open = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
              <h2 class="text-lg font-bold text-gray-800 mb-1">Create Post</h2>
              <p class="text-sm text-gray-400 mb-6">Create a listing on behalf of a client</p>
              <div v-if="createModal.error" class="mb-4 px-4 py-3 bg-red-100 border border-red-200 rounded-xl text-red-600 text-sm">
                {{ createModal.error }}
              </div>
              <form @submit.prevent="saveCreate" class="space-y-4">

                <!-- Client selector -->
                <div>
                  <label class="form-label">Client User *</label>
                  <div class="relative">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input v-model="clientSearch" @input="onClientSearch" placeholder="Search client by name or email…" class="form-input pl-10" autocomplete="off" />
                  </div>
                  <div v-if="clientResults.length && !createModal.selectedClient"
                    class="mt-1 border border-surface-600 rounded-xl bg-white shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                    <button v-for="client in clientResults" :key="client.ID" type="button"
                      @click="selectClient(client)"
                      class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-900 transition-colors text-left">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-black shrink-0"
                        :style="{ background: avatarColor(client.name) }">{{ client.name?.[0] }}</div>
                      <div>
                        <div class="text-sm font-medium text-gray-800">{{ client.name }}</div>
                        <div class="text-xs text-gray-400 font-mono">{{ client.email }}</div>
                      </div>
                      <span class="ml-auto text-xs text-gray-400 font-mono">{{ client.post_count }}/{{ client.post_limit }} posts</span>
                    </button>
                  </div>
                  <div v-if="createModal.selectedClient"
                    class="mt-2 flex items-center gap-3 px-3 py-2 bg-brand-500/10 border border-brand-500/20 rounded-xl">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-black shrink-0"
                      :style="{ background: avatarColor(createModal.selectedClient.name) }">{{ createModal.selectedClient.name?.[0] }}</div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-semibold text-brand-600">{{ createModal.selectedClient.name }}</div>
                      <div class="text-xs text-gray-400 font-mono">{{ createModal.selectedClient.email }}</div>
                    </div>
                    <button type="button" @click="clearClient" class="text-gray-400 hover:text-red-500 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label class="form-label">Title *</label>
                  <input v-model="createModal.form.title" placeholder="e.g. iPhone 14 Pro Max" required class="form-input" />
                </div>
                <div>
                  <label class="form-label">Description</label>
                  <RichEditor v-model="createModal.form.description" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Price ($) *</label>
                    <input v-model.number="createModal.form.price" type="number" min="0" step="0.01" placeholder="0.00" required class="form-input" />
                  </div>
                  <div>
                    <label class="form-label">Status</label>
                    <select v-model="createModal.form.status" class="form-select">
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                </div>

                <!-- Category + SubCategory -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Category</label>
                    <select v-model="createModal.form.category_id" @change="onCreateCategoryChange" class="form-select">
                      <option :value="0">— None —</option>
                      <option v-for="cat in categories" :key="cat.ID" :value="cat.ID">{{ cat.name }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="form-label">
                      SubCategory
                      <span v-if="createModal.subsLoading" class="ml-1 inline-block w-3 h-3 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
                    </label>
                    <select v-model="createModal.form.sub_category_id" class="form-select"
                      :disabled="!createModal.form.category_id || createModal.subs.length === 0">
                      <option :value="null">— None —</option>
                      <option v-for="sub in createModal.subs" :key="sub.ID" :value="sub.ID">{{ sub.name }}</option>
                    </select>
                    <p v-if="createModal.form.category_id && createModal.subs.length === 0 && !createModal.subsLoading"
                      class="text-xs text-gray-400 mt-1">No subcategories for this category</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Location</label>
                    <input v-model="createModal.form.location" placeholder="Phnom Penh" class="form-input" />
                  </div>
                  <div>
                    <label class="form-label">Condition</label>
                    <select v-model="createModal.form.condition" class="form-select">
                      <option value="">— Select —</option>
                      <option value="new">New</option>
                      <option value="like_new">Like New</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                </div>

                <!-- Coordinates + MapPicker -->
                <div>
                  <label class="form-label">Coordinates</label>
                  <div class="grid grid-cols-2 gap-3">
                    <input v-model.number="createModal.form.latitude" type="number" step="any" placeholder="Latitude" class="form-input" />
                    <input v-model.number="createModal.form.longitude" type="number" step="any" placeholder="Longitude" class="form-input" />
                  </div>
                  <MapPicker
                    :model-value="{ lat: createModal.form.latitude, lng: createModal.form.longitude }"
                    @update:model-value="v => { createModal.form.latitude = v.lat; createModal.form.longitude = v.lng }"
                  />
                  <div v-if="createModal.form.latitude && createModal.form.longitude"
                    class="mt-2 rounded-xl overflow-hidden border border-surface-600 h-36">
                    <iframe :src="`https://maps.google.com/maps?q=${createModal.form.latitude},${createModal.form.longitude}&z=15&output=embed`"
                      class="w-full h-full border-0" loading="lazy"></iframe>
                  </div>
                </div>

                <!-- Images -->
                <div>
                  <label class="form-label flex items-center justify-between">
                    <span>Images</span>
                    <span class="text-xs text-gray-400 font-normal">{{ createModal.images.length }} uploaded</span>
                  </label>
                  <div v-if="createModal.images.length" class="flex flex-wrap gap-2 mb-2">
                    <div v-for="(url, idx) in createModal.images" :key="idx"
                      class="relative w-16 h-16 rounded-xl overflow-hidden border border-surface-600 group">
                      <img :src="url" class="w-full h-full object-cover" />
                      <button type="button" @click="removeImage('create', idx)"
                        class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <button type="button" @click="uploadImage('create')" :disabled="createModal.uploading" class="btn-ghost w-full justify-center text-xs py-2">
                    <svg v-if="createModal.uploading" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                    </svg>
                    {{ createModal.uploading ? 'Uploading…' : 'Add Image' }}
                  </button>
                  <p class="text-xs text-gray-400 text-center mt-1">JPEG, PNG, WebP — max 5 MB each</p>
                </div>

                <div class="flex gap-3 pt-2">
                  <button type="submit" :disabled="createModal.saving || !createModal.form.user_id"
                    class="btn-primary flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed">
                    <svg v-if="createModal.saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    {{ createModal.saving ? 'Creating…' : 'Create Post' }}
                  </button>
                  <button type="button" @click="createModal.open = false" class="btn-ghost">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </transition>

        <!-- ── Edit Post Modal ─────────────────────────────────────────────── -->
        <transition name="modal">
          <div v-if="editModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="editModal.open = false"></div>
            <div class="relative card w-full max-w-lg p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
              <button @click="editModal.open = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-black shrink-0"
                  :style="{ background: avatarColor(editModal.post?.user?.name) }">
                  {{ editModal.post?.user?.name?.[0] }}
                </div>
                <div>
                  <h2 class="text-lg font-bold text-gray-800">Edit Post</h2>
                  <p class="text-xs text-gray-400">Seller: {{ editModal.post?.user?.name }}</p>
                </div>
              </div>
              <div v-if="editModal.error" class="mb-4 px-4 py-3 bg-red-100 border border-red-200 rounded-xl text-red-600 text-sm">
                {{ editModal.error }}
              </div>
              <form @submit.prevent="saveEdit" class="space-y-4">

                <div>
                  <label class="form-label">Title *</label>
                  <input v-model="editModal.form.title" required class="form-input" />
                </div>
                <div>
                  <label class="form-label">Description</label>
                  <RichEditor v-model="editModal.form.description" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Price ($) *</label>
                    <input v-model.number="editModal.form.price" type="number" min="0" step="0.01" required class="form-input" />
                  </div>
                  <div>
                    <label class="form-label">Status</label>
                    <select v-model="editModal.form.status" class="form-select">
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                </div>

                <!-- Category + SubCategory -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Category</label>
                    <select v-model="editModal.form.category_id" @change="onEditCategoryChange" class="form-select">
                      <option :value="0">— None —</option>
                      <option v-for="cat in categories" :key="cat.ID" :value="cat.ID">{{ cat.name }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="form-label">
                      SubCategory
                      <span v-if="editModal.subsLoading" class="ml-1 inline-block w-3 h-3 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
                    </label>
                    <select v-model="editModal.form.sub_category_id" class="form-select"
                      :disabled="!editModal.form.category_id || editModal.subs.length === 0">
                      <option :value="null">— None —</option>
                      <option v-for="sub in editModal.subs" :key="sub.ID" :value="sub.ID">{{ sub.name }}</option>
                    </select>
                    <p v-if="editModal.form.category_id && editModal.subs.length === 0 && !editModal.subsLoading"
                      class="text-xs text-gray-400 mt-1">No subcategories for this category</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Location</label>
                    <input v-model="editModal.form.location" class="form-input" />
                  </div>
                  <div>
                    <label class="form-label">Condition</label>
                    <select v-model="editModal.form.condition" class="form-select">
                      <option value="">— Select —</option>
                      <option value="new">New</option>
                      <option value="like_new">Like New</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                </div>

                <!-- Coordinates + MapPicker -->
                <div>
                  <label class="form-label">Coordinates</label>
                  <div class="grid grid-cols-2 gap-3">
                    <input v-model.number="editModal.form.latitude" type="number" step="any" placeholder="Latitude" class="form-input" />
                    <input v-model.number="editModal.form.longitude" type="number" step="any" placeholder="Longitude" class="form-input" />
                  </div>
                  <MapPicker
                    :model-value="{ lat: editModal.form.latitude, lng: editModal.form.longitude }"
                    @update:model-value="v => { editModal.form.latitude = v.lat; editModal.form.longitude = v.lng }"
                  />
                  <div v-if="editModal.form.latitude && editModal.form.longitude"
                    class="mt-2 rounded-xl overflow-hidden border border-surface-600 h-36">
                    <iframe :src="`https://maps.google.com/maps?q=${editModal.form.latitude},${editModal.form.longitude}&z=15&output=embed`"
                      class="w-full h-full border-0" loading="lazy"></iframe>
                  </div>
                </div>

                <!-- Images -->
                <div>
                  <label class="form-label flex items-center justify-between">
                    <span>Images</span>
                    <span class="text-xs text-gray-400 font-normal">{{ editModal.images.length }} uploaded</span>
                  </label>
                  <div v-if="editModal.images.length" class="flex flex-wrap gap-2 mb-2">
                    <div v-for="(url, idx) in editModal.images" :key="idx"
                      class="relative w-16 h-16 rounded-xl overflow-hidden border border-surface-600 group">
                      <img :src="url" class="w-full h-full object-cover" />
                      <button type="button" @click="removeImage('edit', idx)"
                        class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <button type="button" @click="uploadImage('edit')" :disabled="editModal.uploading" class="btn-ghost w-full justify-center text-xs py-2">
                    <svg v-if="editModal.uploading" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                    </svg>
                    {{ editModal.uploading ? 'Uploading…' : 'Add Image' }}
                  </button>
                  <p class="text-xs text-gray-400 text-center mt-1">JPEG, PNG, WebP — max 5 MB each</p>
                </div>

                <div class="flex gap-3 pt-2">
                  <button type="submit" :disabled="editModal.saving || editModal.uploading" class="btn-primary flex-1 justify-center">
                    <svg v-if="editModal.saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    {{ editModal.saving ? 'Saving…' : 'Save Changes' }}
                  </button>
                  <button type="button" @click="editModal.open = false" class="btn-ghost">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </transition>

        <!-- ── Image Popup ─────────────────────────────────────────────────── -->
        <transition name="modal">
          <div v-if="imagePopup.open" class="fixed inset-0 z-[60] flex items-center justify-center p-4" @click="closeImagePopup">
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            <div class="relative z-10 flex flex-col items-center" @click.stop>
              <button @click="closeImagePopup" class="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
              <img :src="imagePopup.url" class="max-w-lg max-h-[80vh] object-contain rounded-2xl shadow-2xl" />
              <p v-if="imagePopup.name" class="mt-3 text-sm text-white/70 font-medium">{{ imagePopup.name }}</p>
            </div>
          </div>
        </transition>

        <!-- ── Confirm Delete ──────────────────────────────────────────────── -->
        <ConfirmDelete
          v-model="deleteModal.open"
          title="Delete Post"
          :item-name="deleteModal.target?.title"
          description="This post will be permanently removed from the marketplace."
          warning="This action cannot be undone."
          confirm-label="Yes, Delete Post"
          :loading="deleteModal.loading"
          @confirm="confirmDelete"
        />

        <!-- ── Toast ──────────────────────────────────────────────────────── -->
        <transition name="toast">
          <div v-if="toast" :class="['fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium',
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600']">
            {{ toast.msg }}
          </div>
        </transition>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import Sidebar       from '@/components/Sidebar.vue'
import Navbar        from '@/components/Navbar.vue'
import DataTable     from '@/components/DataTable.vue'
import ConfirmDelete from '@/components/ConfirmDelete.vue'
import MapPicker     from '@/components/MapPicker.vue'
import RichEditor    from '@/components/RichEditor.vue'
import { postsApi, usersApi, categoriesApi, uploadApi } from '@/services/api.js'
import { usePagination } from '@/composables/usePagination.js'

const { rows, meta, loading, search, pageNumbers, load, goToPage, onSearch, setFilter, setLimit } =
  usePagination((params) => postsApi.list(params))

const statusFilter  = ref('')
const limitValue    = ref(10)
const detail        = ref(null)
const toast         = ref(null)
const deleteModal   = reactive({ open: false, target: null, loading: false })
const imagePopup    = reactive({ open: false, url: '', name: '' })
const clientSearch  = ref('')
const clientResults = ref([])
const categories    = ref([])
let   clientTimer   = null

const columns = [
  { key: 'title',      label: 'Post' },
  { key: 'seller',     label: 'Seller' },
  { key: 'category',   label: 'Category' },
  { key: 'price',      label: 'Price' },
  { key: 'engagement', label: '👁 / ❤️' },
  { key: 'location',   label: 'Location' },
  { key: 'lat&lng',    label: 'Lat/Lng' },
  { key: 'status',     label: 'Status' },
  { key: 'actions',    label: 'Actions', align: 'right' },
]

const rangeFrom = computed(() => meta.total_items === 0 ? 0 : (meta.page - 1) * meta.limit + 1)
const rangeTo   = computed(() => Math.min(meta.page * meta.limit, meta.total_items))

const COLORS = ['#f59e0b','#6366f1','#10b981','#ec4899','#3b82f6','#8b5cf6']
const avatarColor = name => COLORS[(name?.charCodeAt(0) || 0) % COLORS.length]

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
function parseImages(raw) {
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}
function showToast(msg, type = 'success') {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 3000)
}
function clearFilters() {
  search.value = ''; statusFilter.value = ''
  setFilter('status', undefined); load(1)
}
function openImagePopup(url, name = '') { imagePopup.url = url; imagePopup.name = name; imagePopup.open = true }
function closeImagePopup() { imagePopup.open = false }
function openDetail(post) { detail.value = post }

function onKeyDown(e) {
  if (e.key === 'Escape') {
    detail.value = null; deleteModal.open = false
    createModal.open = false; editModal.open = false
    imagePopup.open = false; clientResults.value = []
  }
}

async function loadCategories() {
  try {
    const { data } = await categoriesApi.list({ limit: 100 })
    categories.value = data?.data ?? data ?? []
  } catch { /* silent */ }
}

// ── Load subs for a given category ───────────────────────────────────────────
async function loadSubs(catId, target) {
  if (!catId) { target.subs = []; return }
  target.subsLoading = true
  try {
    const { data } = await categoriesApi.listSubs(catId, { limit: 100 })
    target.subs = data?.data ?? data ?? []
  } catch { target.subs = [] }
  finally { target.subsLoading = false }
}

// ── Category change handlers ──────────────────────────────────────────────────
async function onCreateCategoryChange() {
  createModal.form.sub_category_id = null
  await loadSubs(createModal.form.category_id, createModal)
}

async function onEditCategoryChange() {
  editModal.form.sub_category_id = null
  await loadSubs(editModal.form.category_id, editModal)
}

// ── Client search ─────────────────────────────────────────────────────────────
function onClientSearch() {
  clearTimeout(clientTimer)
  if (!clientSearch.value.trim()) {
    clientTimer = setTimeout(async () => {
      try { const { data } = await usersApi.list({ role: 'client', limit: 5, page: 1 }); clientResults.value = data?.data ?? [] }
      catch { clientResults.value = [] }
    }, 150)
    return
  }
  clientTimer = setTimeout(async () => {
    try { const { data } = await usersApi.list({ role: 'client', search: clientSearch.value, limit: 10, page: 1 }); clientResults.value = data?.data ?? [] }
    catch { clientResults.value = [] }
  }, 300)
}
function selectClient(c) {
  createModal.form.user_id = c.ID
  createModal.selectedClient = c
  clientSearch.value = c.name
  clientResults.value = []
}
function clearClient() {
  createModal.form.user_id = null
  createModal.selectedClient = null
  clientSearch.value = ''
  clientResults.value = []
}

async function adminToggleLike(post) {
  try {
    const { data } = await postsApi.toggleLike(post.ID)
    post.is_liked = data.liked; post.like_count = data.like_count
    const row = rows.value.find(r => r.ID === post.ID)
    if (row) { row.is_liked = data.liked; row.like_count = data.like_count }
  } catch { showToast('Failed to toggle like', 'error') }
}

async function uploadImage(target) {
  const input = document.createElement('input')
  input.type = 'file'; input.accept = 'image/jpeg,image/png,image/webp,image/gif'
  input.onchange = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    const m = target === 'create' ? createModal : editModal
    m.uploading = true
    try { const { data } = await uploadApi.image(file, 'posts'); m.images.push(data.url) }
    catch { showToast('Image upload failed', 'error') }
    finally { m.uploading = false }
  }
  input.click()
}
function removeImage(target, idx) { (target === 'create' ? createModal : editModal).images.splice(idx, 1) }

// ── Create ────────────────────────────────────────────────────────────────────
const createModal = reactive({
  open: false, saving: false, uploading: false, error: '',
  selectedClient: null, images: [], subs: [], subsLoading: false,
  form: {
    user_id: null, title: '', description: '', price: null,
    category_id: 0, sub_category_id: null,
    location: '', latitude: null, longitude: null,
    condition: '', status: 'active'
  }
})

function openCreate() {
  Object.assign(createModal, {
    open: true, saving: false, uploading: false, error: '',
    selectedClient: null, images: [], subs: [], subsLoading: false
  })
  createModal.form = {
    user_id: null, title: '', description: '', price: null,
    category_id: 0, sub_category_id: null,
    location: '', latitude: null, longitude: null,
    condition: '', status: 'active'
  }
  clientSearch.value = ''; clientResults.value = []
  usersApi.list({ role: 'client', limit: 5, page: 1 })
    .then(({ data }) => { clientResults.value = data?.data ?? [] })
    .catch(() => {})
}

async function saveCreate() {
  if (!createModal.form.user_id) { createModal.error = 'Please select a client first'; return }
  createModal.saving = true; createModal.error = ''
  try {
    await postsApi.adminCreate({ ...createModal.form, images: createModal.images })
    await load(1)
    createModal.open = false
    showToast('Post created successfully')
  } catch (e) {
    createModal.error = e.response?.data?.error || 'Failed to create post'
  } finally { createModal.saving = false }
}

// ── Edit ──────────────────────────────────────────────────────────────────────
const editModal = reactive({
  open: false, saving: false, uploading: false, error: '',
  post: null, images: [], subs: [], subsLoading: false,
  form: {
    title: '', description: '', price: null,
    category_id: 0, sub_category_id: null,
    location: '', latitude: null, longitude: null,
    condition: '', status: 'active'
  }
})

async function openEdit(post) {
  editModal.post     = post
  editModal.error    = ''
  editModal.uploading = false
  editModal.images   = parseImages(post.images)
  editModal.subs     = []
  editModal.subsLoading = false
  editModal.form = {
    title:           post.title        || '',
    description:     post.description  || '',
    price:           post.price        || null,
    category_id:     post.category_id  || 0,
    sub_category_id: post.sub_category_id ?? null,
    location:        post.location     || '',
    latitude:        post.latitude     || null,
    longitude:       post.longitude    || null,
    condition:       post.condition    || '',
    status:          post.status       || 'active',
  }
  editModal.open = true

  // Load subs for the existing category
  if (post.category_id) {
    await loadSubs(post.category_id, editModal)
  }
}

async function saveEdit() {
  editModal.saving = true; editModal.error = ''
  try {
    await postsApi.adminUpdate(editModal.post.ID, { ...editModal.form, images: editModal.images })
    await load(meta.page)
    editModal.open = false
    showToast('Post updated')
  } catch (e) {
    editModal.error = e.response?.data?.error || 'Failed to update post'
  } finally { editModal.saving = false }
}

// ── Delete ────────────────────────────────────────────────────────────────────
function openDelete(post) { deleteModal.target = post; deleteModal.loading = false; deleteModal.open = true }

async function confirmDelete() {
  deleteModal.loading = true
  try {
    await postsApi.remove(deleteModal.target.ID)
    const newPage = rows.value.length === 1 && meta.page > 1 ? meta.page - 1 : meta.page
    await load(newPage); deleteModal.open = false; showToast('Post deleted')
  } catch { showToast('Failed to delete post', 'error'); deleteModal.open = false }
  finally { deleteModal.loading = false }
}

onMounted(() => { load(1); loadCategories(); window.addEventListener('keydown', onKeyDown) })
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>