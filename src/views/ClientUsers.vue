<template>
  <div class="flex h-screen overflow-hidden">
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      <main class="flex-1 overflow-y-auto p-8 animate-fade-in">

        <!-- ── Confirm Delete ──────────────────────────────────────────────── -->
        <ConfirmDelete
          v-model="deleteModal.open"
          title="Delete Client"
          :item-name="deleteModal.target?.name"
          :item-icon="deleteModal.target?.avatar"
          description="This client account will be permanently removed."
          warning="All their posts will also be deleted."
          confirm-label="Yes, Delete Client"
          :loading="deleteModal.loading"
          @confirm="confirmDelete"
        />

        <!-- ── Stats ──────────────────────────────────────────────────────── -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="card px-5 py-4 flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-xl">👤</div>
            <div>
              <div class="text-2xl font-bold text-gray-800 font-mono">{{ meta.total_items }}</div>
              <div class="text-xs text-gray-400 uppercase tracking-wider">Total Clients</div>
            </div>
          </div>
          <div class="card px-5 py-4 flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl">✅</div>
            <div>
              <div class="text-2xl font-bold text-emerald-600 font-mono">{{ activeCount }}</div>
              <div class="text-xs text-gray-400 uppercase tracking-wider">Active</div>
            </div>
          </div>
          <div class="card px-5 py-4 flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-xl">🚫</div>
            <div>
              <div class="text-2xl font-bold text-red-500 font-mono">{{ disabledCount }}</div>
              <div class="text-xs text-gray-400 uppercase tracking-wider">Disabled</div>
            </div>
          </div>
        </div>

        <!-- ── Table ──────────────────────────────────────────────────────── -->
        <DataTable
          :columns="columns"
          :rows="rows"
          :loading="loading"
          empty-text="No client users found"
          empty-icon="👤"
        >

          <template #header>
            <div class="flex items-center gap-2">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input v-model="search" @input="onSearch" placeholder="Search clients…" class="form-input pl-10 py-2 w-56" />
              </div>

              <select v-model="statusFilter" @change="setFilter('is_active', statusFilter)" class="form-select py-2 w-36">
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </select>

              <button
                v-if="statusFilter || search"
                @click="clearFilters"
                class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500
                       bg-surface-900 hover:bg-red-50 hover:text-red-500 hover:border-red-200
                       border border-surface-600 rounded-xl transition-all"
              >
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

              <button v-if="auth.canCreateClient" @click="openCreate" class="btn-primary">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add Client
              </button>
            </div>
          </template>

          <!-- Avatar + Name -->
          <template #cell-name="{ row }">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl border border-surface-600 overflow-hidden bg-surface-900 shrink-0 flex items-center justify-center"
                :class="row.avatar ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''"
                @click="row.avatar && openImagePopup(row.avatar, row.name)"
              >
                <img v-if="row.avatar" :src="row.avatar" :alt="row.name" class="w-full h-full object-cover" />
                <span v-else class="w-full h-full flex items-center justify-center font-bold text-sm text-black"
                  :style="{ background: avatarColor(row.name) }">{{ row.name?.[0] }}</span>
              </div>
              <div>
                <div class="font-semibold text-gray-800 text-sm">{{ row.name }}</div>
                <div class="text-xs text-gray-400 font-mono">{{ row.email }}</div>
              </div>
            </div>
          </template>

          <!-- Post usage bar -->
          <template #cell-post_count="{ row }">
            <div class="flex items-center gap-2.5 min-w-32">
              <div class="flex-1 h-1.5 bg-surface-700 rounded-full overflow-hidden">
                <div :class="['h-full rounded-full transition-all', usageColor(row)]" :style="{ width: usagePct(row) + '%' }"></div>
              </div>
              <span class="text-xs font-mono text-gray-500 shrink-0">{{ row.post_count }}/{{ row.post_limit }}</span>
            </div>
          </template>

          <!-- Inline limit editor -->
          <template #cell-post_limit="{ row }">
            <input
              type="number" :value="row.post_limit" min="0"
              @change="e => updateLimit(row.ID, e.target.value)"
              class="w-16 px-2 py-1.5 bg-surface-900 border border-surface-600 rounded-lg text-xs text-gray-800 font-mono text-center outline-none focus:border-brand-500 transition-all"
            />
          </template>

          <!-- Status badge -->
          <template #cell-is_active="{ row }">
            <span :class="['text-xs font-semibold px-2.5 py-1 rounded-lg', row.is_active ? 'badge-active' : 'badge-sold']">
              {{ row.is_active ? 'Active' : 'Disabled' }}
            </span>
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

              <!-- ── View Chats ───────────────────────────────────────────── -->
              <button @click="viewChats(row)" class="btn-ghost py-1.5 text-xs" title="View conversations">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                Chats
              </button>

              <button @click="toggleStatus(row)" :class="row.is_active ? 'btn-danger' : 'btn-success'">
                {{ row.is_active ? 'Disable' : 'Enable' }}
              </button>
              <button v-if="auth.isAdministrator" @click="openDelete(row)" class="btn-danger">
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

        <!-- ── Image popup ─────────────────────────────────────────────────── -->
        <transition name="modal">
          <div v-if="imagePopup.open" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click="closeImagePopup">
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            <div class="relative z-10 flex flex-col items-center" @click.stop>
              <button @click="closeImagePopup" class="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
              <img :src="imagePopup.url" :alt="imagePopup.name" class="max-w-sm max-h-[80vh] object-contain rounded-2xl shadow-2xl" />
              <p class="mt-3 text-sm text-white/60 font-medium">{{ imagePopup.name }}</p>
            </div>
          </div>
        </transition>

        <!-- ── Create Client Modal ─────────────────────────────────────────── -->
        <transition name="modal">
          <div v-if="createModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="createModal.open = false"></div>
            <div class="relative card w-full max-w-md p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
              <button @click="createModal.open = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>

              <h2 class="text-lg font-bold text-gray-800 mb-1">New Client</h2>
              <p class="text-sm text-gray-400 mb-6">Create a marketplace client account</p>

              <div v-if="createModal.error" class="mb-4 px-4 py-3 bg-red-100 border border-red-200 rounded-xl text-red-600 text-sm">
                {{ createModal.error }}
              </div>

              <form @submit.prevent="saveCreate" class="space-y-4">

                <!-- Profile Photo -->
                <div>
                  <label class="form-label">Profile Photo</label>
                  <div class="flex items-center gap-4">
                    <div
                      class="w-16 h-16 rounded-xl border-2 border-dashed border-surface-600 overflow-hidden bg-surface-900 shrink-0 flex items-center justify-center"
                      :class="createModal.preview ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''"
                      @click="createModal.preview && openImagePopup(createModal.preview, createModal.form.name || 'Preview')"
                    >
                      <img v-if="createModal.preview" :src="createModal.preview" class="w-full h-full object-cover" />
                      <svg v-else class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <div class="flex-1">
                      <input ref="createFileInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" @change="e => onFileChange(e, 'create')" />
                      <button type="button" @click="$refs.createFileInput.click()" :disabled="createModal.uploading" class="btn-ghost w-full justify-center text-xs py-2">
                        <svg v-if="createModal.uploading" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                        </svg>
                        {{ createModal.uploading ? 'Uploading…' : 'Choose Photo' }}
                      </button>
                      <p class="text-xs text-gray-400 mt-1.5 text-center">JPEG, PNG, WebP — max 5 MB</p>
                      <button v-if="createModal.preview" type="button" @click="removeImage('create')"
                        class="mt-1 text-xs text-red-500 hover:text-red-600 w-full text-center transition-colors">
                        Remove photo
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="form-label">Full Name *</label>
                  <input v-model="createModal.form.name" placeholder="John Smith" required class="form-input" />
                </div>
                <div>
                  <label class="form-label">Email *</label>
                  <input v-model="createModal.form.email" type="email" placeholder="john@example.com" required class="form-input" />
                </div>
                <div>
                  <label class="form-label">Password *</label>
                  <input v-model="createModal.form.password" type="password" placeholder="••••••••" required minlength="6" class="form-input" />
                </div>
                <div>
                  <label class="form-label">Phone</label>
                  <input v-model="createModal.form.phone" placeholder="+855 12 345 678" class="form-input" />
                </div>
                <div>
                  <label class="form-label">Post Limit</label>
                  <input v-model.number="createModal.form.post_limit" type="number" min="0" class="form-input" />
                </div>

                <div class="flex gap-3 pt-2">
                  <button type="submit" :disabled="createModal.saving || createModal.uploading" class="btn-primary flex-1 justify-center">
                    <svg v-if="createModal.saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    {{ createModal.saving ? 'Creating…' : 'Create Client' }}
                  </button>
                  <button type="button" @click="createModal.open = false" class="btn-ghost">Cancel</button>
                </div>

                <!-- Divider -->
                <div class="flex items-center gap-3">
                  <div class="flex-1 h-px bg-surface-600"></div>
                  <span class="text-xs text-surface-400">or register with</span>
                  <div class="flex-1 h-px bg-surface-600"></div>
                </div>

                <!-- Firebase Google Register -->
                <button
                  type="button"
                  @click="googleRegister"
                  :disabled="createModal.googleLoading"
                  class="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border
                         border-surface-600 hover:border-brand-500/40 bg-surface-950 hover:bg-surface-900
                         text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style="color: var(--text-base)"
                >
                  <svg v-if="createModal.googleLoading" class="w-4 h-4 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  <svg v-else class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {{ createModal.googleLoading ? 'Registering…' : 'Register with Google' }}
                </button>

                <!-- Phone Register -->
                <button
                  type="button"
                  @click="showPhoneModal = true"
                  class="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border
                        border-surface-600 hover:border-brand-500/40 bg-surface-950 hover:bg-surface-900
                        text-sm font-medium transition-all"
                  style="color: var(--text-base)"
                >
                  <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  Register with Phone (OTP)
                </button>

                <PhoneOTPModal
                  :open="showPhoneModal"
                  @success="onPhoneRegister"
                  @cancel="showPhoneModal = false"
                />

              </form>
            </div>
          </div>
        </transition>

        <!-- ── Edit Client Modal ───────────────────────────────────────────── -->
        <transition name="modal">
          <div v-if="editModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="editModal.open = false"></div>
            <div class="relative card w-full max-w-md p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
              <button @click="editModal.open = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>

              <div class="flex items-center gap-3 mb-5">
                <div
                  class="w-11 h-11 rounded-xl overflow-hidden border border-surface-600 shrink-0 flex items-center justify-center bg-surface-900"
                  :class="editModal.preview ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''"
                  @click="editModal.preview && openImagePopup(editModal.preview, editModal.user?.name)"
                >
                  <img v-if="editModal.preview" :src="editModal.preview" class="w-full h-full object-cover" />
                  <span v-else class="font-bold text-sm text-black w-full h-full flex items-center justify-center"
                    :style="{ background: avatarColor(editModal.user?.name) }">
                    {{ editModal.user?.name?.[0] }}
                  </span>
                </div>
                <div>
                  <h2 class="text-lg font-bold text-gray-800">{{ editModal.user?.name }}</h2>
                  <p class="text-xs text-gray-400 font-mono">{{ editModal.user?.email }}</p>
                </div>
              </div>

              <div v-if="editModal.error" class="mb-4 px-4 py-3 bg-red-100 border border-red-200 rounded-xl text-red-600 text-sm">
                {{ editModal.error }}
              </div>

              <form @submit.prevent="saveEdit" class="space-y-4">
                <div>
                  <label class="form-label">Profile Photo</label>
                  <div class="flex items-center gap-4">
                    <div
                      class="w-16 h-16 rounded-xl border-2 border-dashed border-surface-600 overflow-hidden bg-surface-900 shrink-0 flex items-center justify-center"
                      :class="editModal.preview ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''"
                      @click="editModal.preview && openImagePopup(editModal.preview, editModal.user?.name)"
                    >
                      <img v-if="editModal.preview" :src="editModal.preview" class="w-full h-full object-cover" />
                      <svg v-else class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <div class="flex-1">
                      <input ref="editFileInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" @change="e => onFileChange(e, 'edit')" />
                      <button type="button" @click="$refs.editFileInput.click()" :disabled="editModal.uploading" class="btn-ghost w-full justify-center text-xs py-2">
                        <svg v-if="editModal.uploading" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                        </svg>
                        {{ editModal.uploading ? 'Uploading…' : 'Change Photo' }}
                      </button>
                      <p class="text-xs text-gray-400 mt-1.5 text-center">JPEG, PNG, WebP — max 5 MB</p>
                      <button v-if="editModal.preview" type="button" @click="removeImage('edit')"
                        class="mt-1 text-xs text-red-500 hover:text-red-600 w-full text-center transition-colors">
                        Remove photo
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="form-label">Post Limit</label>
                  <input v-model.number="editModal.form.post_limit" type="number" min="0" class="form-input" />
                </div>

                <div>
                  <label class="form-label flex items-center justify-between">
                    <span>Image Limit per Post</span>
                    <span class="text-xs text-gray-400 font-normal">1 – 20</span>
                  </label>
                  <div class="flex items-center gap-3">
                    <input v-model.number="editModal.form.image_limit" type="number" min="1" max="20"
                      class="form-input w-24 text-center font-mono" />
                    <span class="text-xs text-gray-400">images allowed per listing</span>
                  </div>
                </div>

                <div>
                  <label class="form-label">
                    New Password
                    <span class="text-gray-400 normal-case font-normal">(leave blank to keep current)</span>
                  </label>
                  <input v-model="editModal.form.new_password" type="password" placeholder="••••••••" class="form-input" />
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
import { useRouter }     from 'vue-router'
import Sidebar           from '@/components/Sidebar.vue'
import Navbar            from '@/components/Navbar.vue'
import DataTable         from '@/components/DataTable.vue'
import ConfirmDelete     from '@/components/ConfirmDelete.vue'
import { usersApi, authApi, uploadApi } from '@/services/api.js'
import { useAuthStore }  from '@/store/auth.js'
import { usePagination } from '@/composables/usePagination.js'
import PhoneOTPModal     from '@/components/PhoneOTPModal.vue'

// ── Firebase ──────────────────────────────────────────────────────────────────
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const auth   = useAuthStore()
const router = useRouter()
const showPhoneModal = ref(false)

// ── Pagination ────────────────────────────────────────────────────────────────
const { rows, meta, loading, search, pageNumbers, load, goToPage, onSearch, setFilter, setLimit } =
  usePagination((params) => usersApi.list(params))

setFilter('role', 'client')

// ── State ─────────────────────────────────────────────────────────────────────
const statusFilter    = ref('')
const limitValue      = ref(10)
const toast           = ref(null)
const createFileInput = ref(null)
const editFileInput   = ref(null)
const imagePopup      = reactive({ open: false, url: '', name: '' })

const columns = [
  { key: 'name',       label: 'Client' },
  { key: 'post_count', label: 'Post Usage' },
  { key: 'post_limit', label: 'Limit' },
  { key: 'is_active',  label: 'Status' },
  { key: 'actions',    label: 'Actions', align: 'right' },
]

const rangeFrom = computed(() => meta.total_items === 0 ? 0 : (meta.page - 1) * meta.limit + 1)
const rangeTo   = computed(() => Math.min(meta.page * meta.limit, meta.total_items))

const activeCount   = computed(() => rows.value.filter(u =>  u.is_active).length)
const disabledCount = computed(() => rows.value.filter(u => !u.is_active).length)

// ── Helpers ───────────────────────────────────────────────────────────────────
const COLORS = ['#f59e0b','#6366f1','#10b981','#ec4899','#3b82f6','#8b5cf6']
const avatarColor = name => COLORS[(name?.charCodeAt(0) || 0) % COLORS.length]
const usagePct    = row  => Math.min(100, ((row.post_count / row.post_limit) * 100) || 0)
const usageColor  = row  => (row.post_count / row.post_limit) > 0.8 ? 'bg-red-400' : 'bg-brand-500'

function showToast(msg, type = 'success') {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 3000)
}

function clearFilters() {
  search.value = ''; statusFilter.value = ''
  setFilter('is_active', undefined); load(1)
}

function openImagePopup(url, name) { imagePopup.url = url; imagePopup.name = name; imagePopup.open = true }
function closeImagePopup()         { imagePopup.open = false }

function onKeyDown(e) {
  if (e.key === 'Escape') {
    closeImagePopup()
    deleteModal.open = false
    createModal.open = false
    editModal.open   = false
  }
}

// ── View Chats ────────────────────────────────────────────────────────────────
function viewChats(user) {
  router.push({ path: '/chat', query: { user_id: user.ID, name: user.name } })
}

// ── Phone Register ────────────────────────────────────────────────────────────
async function onPhoneRegister({ idToken, phone, name }) {
  showPhoneModal.value      = false
  createModal.googleLoading = true
  try {
    const { data } = await authApi.phoneLogin(idToken, phone, name)
    createModal.open = false
    if (data.is_new) {
      await load(1)
      showToast(`✅ Client "${data.user.name || phone}" registered via Phone`)
    } else {
      showToast(`ℹ️ "${data.user.name}" already exists`)
    }
  } catch (e) {
    createModal.error = e.response?.data?.error || 'Phone registration failed'
  } finally {
    createModal.googleLoading = false
  }
}

// ── Upload ────────────────────────────────────────────────────────────────────
async function onFileChange(e, target) {
  const file = e.target.files?.[0]
  if (!file) return
  const m = target === 'create' ? createModal : editModal
  m.preview = URL.createObjectURL(file); m.uploading = true; m.error = ''
  try {
    const { data } = await uploadApi.image(file, 'clients')
    m.form.avatar = data.url
  } catch {
    m.error = 'Image upload failed — please try again'
    m.preview = m.form.avatar || ''
  } finally {
    m.uploading = false
    if (target === 'create' && createFileInput.value) createFileInput.value.value = ''
    if (target === 'edit'   && editFileInput.value)   editFileInput.value.value   = ''
  }
}

function removeImage(target) {
  const m = target === 'create' ? createModal : editModal
  m.preview = ''; m.form.avatar = ''
  if (target === 'create' && createFileInput.value) createFileInput.value.value = ''
  if (target === 'edit'   && editFileInput.value)   editFileInput.value.value   = ''
}

// ── Create ────────────────────────────────────────────────────────────────────
const createModal = reactive({
  open: false, saving: false, uploading: false, googleLoading: false, error: '', preview: '',
  form: { name: '', email: '', password: '', phone: '', post_limit: 10, avatar: '' }
})

function openCreate() {
  Object.assign(createModal, { open: true, saving: false, uploading: false, googleLoading: false, error: '', preview: '' })
  createModal.form = { name: '', email: '', password: '', phone: '', post_limit: 10, avatar: '' }
}

async function saveCreate() {
  createModal.saving = true; createModal.error = ''
  try {
    await authApi.register(createModal.form)
    await load(1)
    createModal.open = false
    showToast('Client created successfully')
  } catch (e) {
    createModal.error = e.response?.data?.error || 'Failed to create client'
  } finally { createModal.saving = false }
}

// ── Firebase Google Register ──────────────────────────────────────────────────
// Uses signInWithPopup so Firebase handles the OAuth flow and issues a proper
// ID token (with iss=securetoken.google.com, sign_in_provider=google.com)
// that the backend's verifyFirebaseGoogleToken can validate.
async function googleRegister() {
  createModal.googleLoading = true
  createModal.error         = ''

  try {
    const firebaseAuth = getAuth()
    const provider     = new GoogleAuthProvider()
    provider.addScope('email')
    provider.addScope('profile')
    provider.setCustomParameters({ prompt: 'select_account' })

    const result  = await signInWithPopup(firebaseAuth, provider)
    const idToken = await result.user.getIdToken()

    await handleGoogleToken(idToken)
  } catch (e) {
    // user closed the popup or Firebase error
    if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
      createModal.error = e.message || 'Google sign-in failed'
    }
    createModal.googleLoading = false
  }
}

async function handleGoogleToken(idToken) {
  try {
    const { data } = await authApi.googleRegisterClient(idToken)
    createModal.open          = false
    createModal.googleLoading = false

    if (data.is_new) {
      await load(1)
      showToast(`✅ "${data.user.name}" registered via Google`)
    } else {
      await load(1)
      showToast(`ℹ️ "${data.user.name}" already exists — account linked`)
    }
  } catch (e) {
    createModal.error         = e.response?.data?.error || 'Google registration failed'
    createModal.googleLoading = false
  }
}

// ── Edit ──────────────────────────────────────────────────────────────────────
const editModal = reactive({
  open: false, saving: false, uploading: false, error: '', preview: '', user: null,
  form: { post_limit: 10, image_limit: 5, new_password: '', avatar: '' }
})

function openEdit(user) {
  editModal.user              = user
  editModal.form.post_limit   = user.post_limit
  editModal.form.image_limit  = user.image_limit || 5
  editModal.form.new_password = ''
  editModal.form.avatar       = user.avatar || ''
  editModal.preview           = user.avatar || ''
  editModal.error             = ''
  editModal.uploading         = false
  editModal.open              = true
}

async function saveEdit() {
  editModal.saving = true; editModal.error = ''
  try {
    const payload = { post_limit: editModal.form.post_limit, image_limit: editModal.form.image_limit, avatar: editModal.form.avatar }
    if (editModal.form.new_password) payload.new_password = editModal.form.new_password
    await usersApi.update(editModal.user.ID, payload)
    await load(meta.page)
    editModal.open = false
    showToast('Client updated')
  } catch (e) {
    editModal.error = e.response?.data?.error || 'Update failed'
  } finally { editModal.saving = false }
}

// ── Inline limit ──────────────────────────────────────────────────────────────
async function updateLimit(id, val) {
  try {
    await usersApi.setLimit(id, val)
    const u = rows.value.find(u => u.ID === id)
    if (u) u.post_limit = Number(val)
    showToast('Post limit updated')
  } catch { showToast('Failed to update limit', 'error') }
}

// ── Toggle status ─────────────────────────────────────────────────────────────
async function toggleStatus(user) {
  try {
    await usersApi.toggleStatus(user.ID)
    user.is_active = !user.is_active
    showToast(`Client ${user.is_active ? 'enabled' : 'disabled'}`)
  } catch { showToast('Failed to update status', 'error') }
}

// ── Delete ────────────────────────────────────────────────────────────────────
const deleteModal = reactive({ open: false, target: null, loading: false })

function openDelete(user) { deleteModal.target = user; deleteModal.loading = false; deleteModal.open = true }

async function confirmDelete() {
  deleteModal.loading = true
  try {
    await usersApi.remove(deleteModal.target.ID)
    const newPage = rows.value.length === 1 && meta.page > 1 ? meta.page - 1 : meta.page
    await load(newPage)
    deleteModal.open = false
    showToast('Client deleted')
  } catch {
    showToast('Failed to delete', 'error')
    deleteModal.open = false
  } finally { deleteModal.loading = false }
}

onMounted(() => { load(1); window.addEventListener('keydown', onKeyDown) })
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>