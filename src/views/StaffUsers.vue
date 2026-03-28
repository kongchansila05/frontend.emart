<template>
  <div class="flex h-screen overflow-hidden">
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      <main class="flex-1 overflow-y-auto p-8 animate-fade-in">

        <!-- ── Confirm Delete ──────────────────────────────────────────────── -->
        <ConfirmDelete
          v-model="deleteModal.open"
          title="Delete Staff User"
          :item-name="deleteModal.target?.name"
          :item-icon="deleteModal.target?.avatar"
          description="This staff account will be permanently removed."
          warning="This action cannot be undone."
          confirm-label="Yes, Delete Staff"
          :loading="deleteModal.loading"
          @confirm="confirmDelete"
        />

        <!-- ── Stats ──────────────────────────────────────────────────────── -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="card px-5 py-4 flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-xl">👥</div>
            <div>
              <div class="text-2xl font-bold text-gray-800 font-mono">{{ meta.total_items }}</div>
              <div class="text-xs text-gray-400 uppercase tracking-wider">Total Staff</div>
            </div>
          </div>
          <div class="card px-5 py-4 flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-xl">🔑</div>
            <div>
              <div class="text-2xl font-bold text-brand-400 font-mono">{{ adminCount }}</div>
              <div class="text-xs text-gray-400 uppercase tracking-wider">Admins</div>
            </div>
          </div>
          <div class="card px-5 py-4 flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-xl">🛡️</div>
            <div>
              <div class="text-2xl font-bold text-violet-400 font-mono">{{ otherCount }}</div>
              <div class="text-xs text-gray-400 uppercase tracking-wider">Other Roles</div>
            </div>
          </div>
        </div>

        <!-- ── Table ──────────────────────────────────────────────────────── -->
        <DataTable :columns="columns" :rows="rows" :loading="loading" empty-text="No staff users found" empty-icon="👥">

          <template #header>
            <div class="flex items-center gap-2">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input v-model="search" @input="onSearch" placeholder="Search staff…" class="form-input pl-10 py-2 w-56" />
              </div>

              <select v-model="roleFilter" @change="setFilter('role', roleFilter)" class="form-select py-2 w-40">
                <option value="">All Roles</option>
                <option v-for="r in roles" :key="r.ID" :value="r.name">{{ r.name }}</option>
              </select>

              <button v-if="roleFilter || search" @click="clearFilters"
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
                Add Staff
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

          <!-- Role badge -->
          <template #cell-role="{ row }">
            <span :class="['text-xs font-semibold px-2.5 py-1 rounded-lg',
              row.role?.name === 'administrator'
                ? 'bg-brand-500/10 text-brand-600 border border-brand-500/20'
                : 'bg-violet-500/10 text-violet-600 border border-violet-500/20']">
              {{ row.role?.name || '—' }}
            </span>
          </template>

          <!-- Permissions count -->
          <template #cell-permissions="{ row }">
            <span class="text-xs font-mono text-gray-500 bg-surface-900 border border-surface-600 px-2.5 py-1 rounded-lg">
              {{ row.role?.permissions?.length ?? 0 }} perms
            </span>
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
              <button
                @click="openEdit(row)"
                class="btn-warning"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit
              </button>
              <button @click="toggleStatus(row)" :class="row.is_active ? 'btn-danger' : 'btn-success'"
                :disabled="row.role?.name === 'administrator'"
                class="btn-warning disabled:opacity-30 disabled:cursor-not-allowed"
                :title="row.role?.name === 'administrator' ? 'Cannot edit the super administrator' : ''">
                {{ row.is_active ? 'Disable' : 'Enable' }}
              </button>
              <button
                @click="openDelete(row)"
                :disabled="row.role?.name === 'administrator'"
                class="btn-danger disabled:opacity-30 disabled:cursor-not-allowed"
                :title="row.role?.name === 'administrator' ? 'Cannot delete the super administrator' : ''"
              >
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

        <!-- ── Create Staff Modal ─────────────────────────────────────────── -->
        <transition name="modal">
          <div v-if="createModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="createModal.open = false"></div>
            <div class="relative card w-full max-w-md p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
              <button @click="createModal.open = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>

              <h2 class="text-lg font-bold text-gray-800 mb-1">New Staff Member</h2>
              <p class="text-sm text-gray-400 mb-6">Create an admin or staff account</p>

              <div v-if="createModal.error" class="mb-4 px-4 py-3 bg-red-100 border border-red-200 rounded-xl text-red-600 text-sm">
                {{ createModal.error }}
              </div>

              <form @submit.prevent="saveCreate" class="space-y-4">

                <!-- Profile photo -->
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
                  <input v-model="createModal.form.name" placeholder="Jane Smith" required class="form-input" />
                </div>
                <div>
                  <label class="form-label">Email *</label>
                  <input v-model="createModal.form.email" type="email" placeholder="jane@example.com" required class="form-input" />
                </div>
                <div>
                  <label class="form-label">Password *</label>
                  <input v-model="createModal.form.password" type="password" placeholder="••••••••" required minlength="6" class="form-input" />
                </div>

                <!-- Role selector -->
                <div>
                  <label class="form-label">Role *</label>
                  <select v-model="createModal.form.role_name" class="form-select">
                    <option v-for="r in roles" :key="r.ID" :value="r.name">{{ r.name }}</option>
                  </select>
                </div>

                <!-- Submit buttons -->
                <div class="flex gap-3 pt-2">
                  <button type="submit" :disabled="createModal.saving || createModal.uploading" class="btn-primary flex-1 justify-center">
                    <svg v-if="createModal.saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    {{ createModal.saving ? 'Creating…' : 'Create Staff' }}
                  </button>
                  <button type="button" @click="createModal.open = false" class="btn-ghost">Cancel</button>
                </div>

                <!-- Divider -->
                <div class="flex items-center gap-3">
                  <div class="flex-1 h-px bg-surface-600"></div>
                  <span class="text-xs text-surface-400">or register with</span>
                  <div class="flex-1 h-px bg-surface-600"></div>
                </div>

                <!-- Google Register via Firebase -->
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
                  {{ createModal.googleLoading ? 'Registering…' : `Register with Google as ${createModal.form.role_name}` }}
                </button>

                <!-- Role hint -->
                <p class="text-xs text-surface-400 text-center -mt-2">
                  Google account will be assigned the <span class="font-semibold text-brand-500">{{ createModal.form.role_name }}</span> role
                </p>

              </form>
            </div>
          </div>
        </transition>

        <!-- ── Edit Staff Modal ───────────────────────────────────────────── -->
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
                <!-- Profile photo -->
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
                  <label class="form-label">Role</label>
                  <div v-if="editModal.user?.role?.name === 'administrator'"
                    class="flex items-center gap-2 px-4 py-2.5 bg-surface-800 border border-surface-600
                          rounded-xl text-sm text-surface-400 cursor-not-allowed">
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-600 border border-brand-500/20">
                      administrator
                    </span>
                    <span class="text-xs text-surface-400">— Super administrator role cannot be changed</span>
                  </div>
                  <select v-else v-model="editModal.form.role_id" class="form-select">
                    <option v-for="r in roles" :key="r.ID" :value="r.ID">{{ r.name }}</option>
                  </select>
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
import Sidebar       from '@/components/Sidebar.vue'
import Navbar        from '@/components/Navbar.vue'
import DataTable     from '@/components/DataTable.vue'
import ConfirmDelete from '@/components/ConfirmDelete.vue'
import { usersApi, rolesApi, authApi, uploadApi } from '@/services/api.js'
import { useAuthStore }  from '@/store/auth.js'
import { usePagination } from '@/composables/usePagination.js'

// ── Firebase imports ──────────────────────────────────────────────────────────
// Make sure you have firebase installed: npm install firebase
// and that you have a firebase.js config file at @/firebase.js
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import '@/firebase.js' // ensure Firebase app is initialized

const auth = useAuthStore()

// ── Pagination ────────────────────────────────────────────────────────────────
const { rows, meta, loading, search, pageNumbers, load, goToPage, onSearch, setFilter, setLimit } =
  usePagination((params) => usersApi.list(params))

setFilter('is_staff', 'true')

// ── State ─────────────────────────────────────────────────────────────────────
const roles           = ref([])
const roleFilter      = ref('')
const limitValue      = ref(10)
const toast           = ref(null)
const createFileInput = ref(null)
const editFileInput   = ref(null)
const imagePopup      = reactive({ open: false, url: '', name: '' })

const columns = [
  { key: 'name',        label: 'Staff Member' },
  { key: 'role',        label: 'Role' },
  { key: 'permissions', label: 'Permissions' },
  { key: 'is_active',   label: 'Status' },
  { key: 'actions',     label: 'Actions', align: 'right' },
]

const rangeFrom   = computed(() => meta.total_items === 0 ? 0 : (meta.page - 1) * meta.limit + 1)
const rangeTo     = computed(() => Math.min(meta.page * meta.limit, meta.total_items))
const adminCount  = computed(() => rows.value.filter(u => u.role?.name === 'admin').length)
const otherCount  = computed(() => rows.value.filter(u => u.role?.name !== 'admin').length)

// ── Helpers ───────────────────────────────────────────────────────────────────
const COLORS = ['#f59e0b','#6366f1','#10b981','#ec4899','#3b82f6','#8b5cf6']
const avatarColor = name => COLORS[(name?.charCodeAt(0) || 0) % COLORS.length]

function showToast(msg, type = 'success') {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 3000)
}

function clearFilters() {
  search.value = ''; roleFilter.value = ''
  setFilter('role', undefined); load(1)
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

// ── Roles ─────────────────────────────────────────────────────────────────────
async function loadRoles() {
  try {
    const { data } = await rolesApi.listStaff()
    roles.value = (data || [])
  } catch { /* silent */ }
}

// ── Upload ────────────────────────────────────────────────────────────────────
async function onFileChange(e, target) {
  const file = e.target.files?.[0]
  if (!file) return
  const m = target === 'create' ? createModal : editModal
  m.preview = URL.createObjectURL(file); m.uploading = true; m.error = ''
  try {
    const { data } = await uploadApi.image(file, 'staff')
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
  form: { name: '', email: '', password: '', avatar: '', role_name: 'admin' }
})

function openCreate() {
  Object.assign(createModal, {
    open: true, saving: false, uploading: false,
    googleLoading: false, error: '', preview: ''
  })
  createModal.form = {
    name: '', email: '', password: '', avatar: '',
    role_name: roles.value[0]?.name || 'admin'
  }
}

async function saveCreate() {
  createModal.saving = true; createModal.error = ''
  try {
    await authApi.registerStaff(createModal.form)
    await load(1)
    createModal.open = false
    showToast('Staff member created')
  } catch (e) {
    createModal.error = e.response?.data?.error || 'Failed to create staff'
  } finally { createModal.saving = false }
}

// ── Google Register Staff — Firebase Popup ────────────────────────────────────
// Uses Firebase signInWithPopup to get a real Firebase ID token (JWT),
// which matches what the backend's verifyFirebaseGoogleToken() expects.
async function googleRegister() {
  createModal.googleLoading = true
  createModal.error = ''

  try {
    const firebaseAuth = getAuth()
    const provider     = new GoogleAuthProvider()

    // Force account picker every time so admin can choose any Google account
    provider.setCustomParameters({ prompt: 'select_account' })

    // Opens Firebase Google sign-in popup
    const result  = await signInWithPopup(firebaseAuth, provider)

    // getIdToken() returns the Firebase ID token — exactly what the backend validates
    const idToken = await result.user.getIdToken()

    // Send Firebase ID token + chosen role to backend
    const { data } = await authApi.googleRegisterStaff(idToken, createModal.form.role_name)

    createModal.open          = false
    createModal.googleLoading = false

    await load(1)
    showToast(
      data.is_new
        ? `✅ "${data.user.name}" registered as ${createModal.form.role_name} via Google`
        : `ℹ️ "${data.user.name}" already exists — role updated to ${createModal.form.role_name}`
    )
  } catch (e) {
    // Firebase popup cancelled by user
    if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
      createModal.googleLoading = false
      return
    }
    createModal.error         = e.response?.data?.error || e.message || 'Google registration failed'
    createModal.googleLoading = false
  }
}

// ── Edit ──────────────────────────────────────────────────────────────────────
const editModal = reactive({
  open: false, saving: false, uploading: false, error: '', preview: '', user: null,
  form: { role_id: null, new_password: '', avatar: '' }
})

function openEdit(user) {
  editModal.user              = user
  editModal.form.role_id      = user.role?.ID
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
    const payload = { role_id: editModal.form.role_id, avatar: editModal.form.avatar }
    if (editModal.form.new_password) payload.new_password = editModal.form.new_password
    await usersApi.update(editModal.user.ID, payload)
    await load(meta.page)
    editModal.open = false
    showToast('Staff updated')
  } catch (e) {
    editModal.error = e.response?.data?.error || 'Update failed'
  } finally { editModal.saving = false }
}

// ── Toggle status ─────────────────────────────────────────────────────────────
async function toggleStatus(user) {
  try {
    await usersApi.toggleStatus(user.ID)
    user.is_active = !user.is_active
    showToast(`User ${user.is_active ? 'enabled' : 'disabled'}`)
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
    showToast('Staff deleted')
  } catch {
    showToast('Failed to delete', 'error')
    deleteModal.open = false
  } finally { deleteModal.loading = false }
}

onMounted(() => { load(1); loadRoles(); window.addEventListener('keydown', onKeyDown) })
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>