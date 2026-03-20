<template>
  <div class="flex h-screen overflow-hidden">
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      <main class="flex-1 overflow-y-auto p-8 animate-fade-in">

        <!-- ── Confirm Delete Category ────────────────────────────────────── -->
        <ConfirmDelete
          v-model="deleteModal.open"
          title="Delete Category"
          :item-name="deleteModal.target?.name"
          description="This category will be permanently removed."
          warning="All subcategories and posts will also be affected."
          confirm-label="Yes, Delete Category"
          :loading="deleteModal.loading"
          @confirm="confirmDelete"
        />

        <!-- ── Confirm Delete SubCategory ─────────────────────────────────── -->
        <ConfirmDelete
          v-model="deleteSubModal.open"
          title="Delete SubCategory"
          :item-name="deleteSubModal.target?.name"
          description="This subcategory will be permanently removed."
          warning="This action cannot be undone."
          confirm-label="Yes, Delete SubCategory"
          :loading="deleteSubModal.loading"
          @confirm="confirmDeleteSub"
        />

        <!-- ── Category Table ─────────────────────────────────────────────── -->
        <DataTable
          :columns="columns"
          :rows="rows"
          :loading="loading"
          empty-text="No categories yet"
          empty-icon="🗂️"
        >
          <template #header>
            <div class="flex items-center gap-2">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input v-model="search" @input="onSearch" placeholder="Search categories…" class="form-input pl-10 py-2 w-56" />
              </div>
              <button v-if="search" @click="clearSearch"
                class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500
                       bg-surface-900 hover:bg-red-50 hover:text-red-500 border border-surface-600 rounded-xl transition-all">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Clear
              </button>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button @click="load(1)" class="btn-ghost py-2 text-xs">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Refresh
              </button>
              <button @click="openModal()" class="btn-primary">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add Category
              </button>
            </div>
          </template>

          <!-- Name + image -->
          <template #cell-name="{ row }">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl border border-surface-600 overflow-hidden bg-surface-900 shrink-0 flex items-center justify-center">
                <img v-if="row.image" :src="row.image" class="w-full h-full object-cover" />
                <span v-else class="text-lg">📦</span>
              </div>
              <div>
                <div class="font-semibold text-gray-800 text-sm">{{ row.name }}</div>
                <div class="text-xs text-gray-400 max-w-xs truncate">{{ row.description }}</div>
              </div>
            </div>
          </template>

          <!-- SubCategory count -->
          <template #cell-sub_count="{ row }">
            <button
              @click="openSubPanel(row)"
              :class="['text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all hover:opacity-80',
                (row.sub_categories?.length ?? 0) > 0
                  ? 'bg-brand-500/10 text-brand-600 border-brand-500/20'
                  : 'bg-surface-800 text-surface-400 border-surface-600']"
            >
              {{ row.sub_categories?.length ?? 0 }} subs
            </button>
          </template>

          <!-- Post count -->
          <template #cell-post_count="{ row }">
            <span class="text-sm font-bold font-mono text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
              {{ row.post_count ?? 0 }}
            </span>
          </template>

          <!-- Status toggle -->
          <template #cell-is_active="{ row }">
            <button
              @click="toggleActive(row)"
              :class="['relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                row.is_active ? 'bg-emerald-500' : 'bg-surface-500']"
            >
              <span :class="['inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
                row.is_active ? 'translate-x-[18px]' : 'translate-x-0.5']"></span>
            </button>
          </template>

          <!-- Actions -->
          <template #cell-actions="{ row }">
            <div class="flex items-center justify-end gap-2">
              <button @click="openSubPanel(row)" class="btn-ghost py-1.5 text-xs">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16"/>
                </svg>
                Subs
              </button>
              <button @click="openModal(row)" class="btn-warning">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit
              </button>
              <button
                @click="openDelete(row)"
                :disabled="(row.post_count ?? 0) > 0"
                class="btn-danger disabled:opacity-30 disabled:cursor-not-allowed"
                :title="(row.post_count ?? 0) > 0 ? `Cannot delete — has ${row.post_count} post(s)` : 'Delete category'"
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

        <!-- ── SubCategory Side Panel ──────────────────────────────────────── -->
        <transition name="slide-panel">
          <div v-if="subPanel.open" class="fixed inset-0 z-40 flex">
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="subPanel.open = false"></div>
            <div class="relative ml-auto w-full max-w-md h-full flex flex-col shadow-2xl z-10"
              style="background-color: var(--surface-950)">

              <!-- Panel header -->
              <div class="flex items-center justify-between px-6 py-5 border-b border-surface-600">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg border border-surface-600 overflow-hidden bg-surface-900 flex items-center justify-center">
                    <img v-if="subPanel.category?.image" :src="subPanel.category.image" class="w-full h-full object-cover" />
                    <span v-else class="text-sm">📦</span>
                  </div>
                  <div>
                    <h2 class="text-sm font-bold" style="color: var(--text-base)">{{ subPanel.category?.name }}</h2>
                    <p class="text-xs text-surface-400">{{ subPanel.subs.length }} subcategories</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button @click="openSubModal()" class="btn-primary py-1.5 text-xs">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Add Sub
                  </button>
                  <button @click="subPanel.open = false" class="text-surface-400 hover:text-red-500 transition-colors p-1">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- SubCategory list -->
              <div class="flex-1 overflow-y-auto p-4">
                <div v-if="subPanel.loading" class="flex items-center justify-center py-12">
                  <svg class="w-6 h-6 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                </div>

                <div v-else-if="subPanel.subs.length === 0"
                  class="flex flex-col items-center justify-center py-12 text-center">
                  <div class="text-4xl mb-3">🗂️</div>
                  <p class="text-sm text-surface-400">No subcategories yet</p>
                  <button @click="openSubModal()" class="mt-3 btn-primary py-1.5 text-xs">Add First SubCategory</button>
                </div>

                <div v-else class="space-y-2">
                  <div v-for="sub in subPanel.subs" :key="sub.ID"
                    class="flex items-center gap-3 p-3 rounded-xl border border-surface-600 transition-all hover:border-surface-500"
                    style="background-color: var(--surface-800)">

                    <!-- Sub image -->
                    <div class="w-10 h-10 rounded-lg border border-surface-600 overflow-hidden bg-surface-900 shrink-0 flex items-center justify-center">
                      <img v-if="sub.image" :src="sub.image" class="w-full h-full object-cover" />
                      <span v-else class="text-sm">📁</span>
                    </div>

                    <!-- Sub info -->
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-semibold truncate" style="color: var(--text-base)">{{ sub.name }}</div>
                      <div class="text-xs text-surface-400 truncate">{{ sub.description || '—' }}</div>
                    </div>

                    <!-- Post count -->
                    <span class="text-xs font-mono text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg shrink-0">
                      {{ sub.post_count ?? 0 }}
                    </span>

                    <!-- Toggle -->
                    <button @click="toggleSubActive(sub)"
                      :class="['relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0',
                        sub.is_active ? 'bg-emerald-500' : 'bg-surface-500']">
                      <span :class="['inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
                        sub.is_active ? 'translate-x-[18px]' : 'translate-x-0.5']"></span>
                    </button>

                    <!-- Actions -->
                    <div class="flex items-center gap-1 shrink-0">
                      <button @click="openSubModal(sub)" class="btn-warning py-1 px-2 text-xs">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        @click="openDeleteSub(sub)"
                        :disabled="(sub.post_count ?? 0) > 0"
                        class="btn-danger py-1 px-2 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                        :title="(sub.post_count ?? 0) > 0 ? `Cannot delete — has ${sub.post_count} post(s)` : 'Delete'"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </transition>

        <!-- ── Category Create/Edit Modal ─────────────────────────────────── -->
        <transition name="modal">
          <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>
            <div class="relative card w-full max-w-md p-7 shadow-2xl z-10">
              <button @click="closeModal" class="absolute top-4 right-4 text-surface-400 hover:text-red-500 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>

              <h2 class="text-lg font-bold mb-1" style="color: var(--text-base)">
                {{ modal.editing ? 'Edit Category' : 'New Category' }}
              </h2>
              <p class="text-sm text-surface-400 mb-6">
                {{ modal.editing ? 'Update category details' : 'Add a new marketplace category' }}
              </p>

              <div v-if="modal.error" class="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {{ modal.error }}
              </div>

              <form @submit.prevent="save" class="space-y-4">
                <div>
                  <label class="form-label">Name *</label>
                  <input v-model="modal.form.name" placeholder="Electronics" required class="form-input" />
                </div>

                <div>
                  <label class="form-label">Description</label>
                  <input v-model="modal.form.description" placeholder="Brief description…" class="form-input" />
                </div>

                <!-- Image upload -->
                <div>
                  <label class="form-label">Image</label>
                  <div class="flex items-center gap-3">
                    <div class="w-14 h-14 rounded-xl border-2 border-dashed border-surface-600 overflow-hidden bg-surface-900 shrink-0 flex items-center justify-center">
                      <img v-if="modal.preview" :src="modal.preview" class="w-full h-full object-cover" />
                      <span v-else class="text-xl">📦</span>
                    </div>
                    <div class="flex-1">
                      <input ref="catFileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onCatImageChange" />
                      <button type="button" @click="$refs.catFileInput.click()" :disabled="modal.uploading" class="btn-ghost w-full justify-center text-xs py-2">
                        <svg v-if="modal.uploading" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                        </svg>
                        {{ modal.uploading ? 'Uploading…' : 'Choose Image' }}
                      </button>
                      <button v-if="modal.preview" type="button" @click="modal.preview = ''; modal.form.image = ''"
                        class="mt-1 text-xs text-red-500 hover:text-red-600 w-full text-center">Remove</button>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-between p-4 bg-surface-900 rounded-xl border border-surface-600">
                  <div>
                    <div class="text-sm font-medium" style="color: var(--text-base)">Active</div>
                    <div class="text-xs text-surface-400">Visible to marketplace users</div>
                  </div>
                  <button type="button" @click="modal.form.is_active = !modal.form.is_active"
                    :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      modal.form.is_active ? 'bg-emerald-500' : 'bg-surface-500']">
                    <span :class="['inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                      modal.form.is_active ? 'translate-x-6' : 'translate-x-1']"></span>
                  </button>
                </div>

                <div class="flex gap-3 pt-2">
                  <button type="submit" :disabled="modal.saving || modal.uploading" class="btn-primary flex-1 justify-center">
                    <svg v-if="modal.saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    {{ modal.saving ? 'Saving…' : (modal.editing ? 'Update Category' : 'Create Category') }}
                  </button>
                  <button type="button" @click="closeModal" class="btn-ghost">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </transition>

        <!-- ── SubCategory Create/Edit Modal ──────────────────────────────── -->
        <transition name="modal">
          <div v-if="subModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeSubModal"></div>
            <div class="relative card w-full max-w-md p-7 shadow-2xl z-10">
              <button @click="closeSubModal" class="absolute top-4 right-4 text-surface-400 hover:text-red-500 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>

              <div class="flex items-center gap-2 mb-1">
                <h2 class="text-lg font-bold" style="color: var(--text-base)">
                  {{ subModal.editing ? 'Edit SubCategory' : 'New SubCategory' }}
                </h2>
              </div>
              <p class="text-sm text-surface-400 mb-6">
                Under <span class="font-semibold text-brand-500">{{ subPanel.category?.name }}</span>
              </p>

              <div v-if="subModal.error" class="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {{ subModal.error }}
              </div>

              <form @submit.prevent="saveSub" class="space-y-4">
                <div>
                  <label class="form-label">Name *</label>
                  <input v-model="subModal.form.name" placeholder="Smartphones" required class="form-input" />
                </div>

                <div>
                  <label class="form-label">Description</label>
                  <input v-model="subModal.form.description" placeholder="Brief description…" class="form-input" />
                </div>

                <!-- Image upload -->
                <div>
                  <label class="form-label">Image</label>
                  <div class="flex items-center gap-3">
                    <div class="w-14 h-14 rounded-xl border-2 border-dashed border-surface-600 overflow-hidden bg-surface-900 shrink-0 flex items-center justify-center">
                      <img v-if="subModal.preview" :src="subModal.preview" class="w-full h-full object-cover" />
                      <span v-else class="text-xl">📁</span>
                    </div>
                    <div class="flex-1">
                      <input ref="subFileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onSubImageChange" />
                      <button type="button" @click="$refs.subFileInput.click()" :disabled="subModal.uploading" class="btn-ghost w-full justify-center text-xs py-2">
                        <svg v-if="subModal.uploading" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                        </svg>
                        {{ subModal.uploading ? 'Uploading…' : 'Choose Image' }}
                      </button>
                      <button v-if="subModal.preview" type="button" @click="subModal.preview = ''; subModal.form.image = ''"
                        class="mt-1 text-xs text-red-500 hover:text-red-600 w-full text-center">Remove</button>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-between p-4 bg-surface-900 rounded-xl border border-surface-600">
                  <div>
                    <div class="text-sm font-medium" style="color: var(--text-base)">Active</div>
                    <div class="text-xs text-surface-400">Visible to marketplace users</div>
                  </div>
                  <button type="button" @click="subModal.form.is_active = !subModal.form.is_active"
                    :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      subModal.form.is_active ? 'bg-emerald-500' : 'bg-surface-500']">
                    <span :class="['inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                      subModal.form.is_active ? 'translate-x-6' : 'translate-x-1']"></span>
                  </button>
                </div>

                <div class="flex gap-3 pt-2">
                  <button type="submit" :disabled="subModal.saving || subModal.uploading" class="btn-primary flex-1 justify-center">
                    <svg v-if="subModal.saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    {{ subModal.saving ? 'Saving…' : (subModal.editing ? 'Update SubCategory' : 'Create SubCategory') }}
                  </button>
                  <button type="button" @click="closeSubModal" class="btn-ghost">Cancel</button>
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
import { categoriesApi, uploadApi } from '@/services/api.js'
import { usePagination } from '@/composables/usePagination.js'

// ── Pagination ────────────────────────────────────────────────────────────────
const { rows, meta, loading, search, pageNumbers, load, goToPage, onSearch } =
  usePagination((params) => categoriesApi.list(params))

// ── State ─────────────────────────────────────────────────────────────────────
const toast       = ref(null)
const catFileInput = ref(null)
const subFileInput = ref(null)

const columns = [
  { key: 'name',       label: 'Category' },
  { key: 'sub_count',  label: 'SubCategories' },
  { key: 'post_count', label: 'Posts' },
  { key: 'is_active',  label: 'Active' },
  { key: 'actions',    label: 'Actions', align: 'right' },
]

const rangeFrom = computed(() => meta.total_items === 0 ? 0 : (meta.page - 1) * meta.limit + 1)
const rangeTo   = computed(() => Math.min(meta.page * meta.limit, meta.total_items))

function showToast(msg, type = 'success') {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 3000)
}

function clearSearch() { search.value = ''; load(1) }

function onKeyDown(e) {
  if (e.key === 'Escape') {
    modal.open       = false
    subModal.open    = false
    subPanel.open    = false
    deleteModal.open = false
    deleteSubModal.open = false
  }
}

// ── Category Modal ────────────────────────────────────────────────────────────
const modal = reactive({
  open: false, editing: null, saving: false, uploading: false, error: '', preview: '',
  form: { name: '', description: '', image: '', is_active: true }
})

function openModal(cat = null) {
  modal.editing  = cat
  modal.error    = ''
  modal.uploading = false
  if (cat) {
    modal.preview = cat.image || ''
    modal.form = { name: cat.name, description: cat.description || '', image: cat.image || '', is_active: cat.is_active }
  } else {
    modal.preview = ''
    modal.form = { name: '', description: '', image: '', is_active: true }
  }
  modal.open = true
}

function closeModal() { modal.open = false }

async function onCatImageChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  modal.preview   = URL.createObjectURL(file)
  modal.uploading = true
  try {
    const { data } = await uploadApi.image(file, 'categories')
    modal.form.image = data.url
  } catch { modal.error = 'Image upload failed' }
  finally { modal.uploading = false; if (catFileInput.value) catFileInput.value.value = '' }
}

async function save() {
  modal.saving = true; modal.error = ''
  try {
    if (modal.editing) {
      await categoriesApi.update(modal.editing.ID, modal.form)
    } else {
      await categoriesApi.create(modal.form)
    }
    await load(meta.page)
    modal.open = false
    showToast(modal.editing ? 'Category updated' : 'Category created')
  } catch (e) {
    modal.error = e.response?.data?.error || 'Failed to save category'
  } finally { modal.saving = false }
}

async function toggleActive(cat) {
  try {
    await categoriesApi.update(cat.ID, { is_active: !cat.is_active })
    cat.is_active = !cat.is_active
    showToast(`Category ${cat.is_active ? 'activated' : 'hidden'}`)
  } catch { showToast('Failed to update', 'error') }
}

// ── Category Delete ───────────────────────────────────────────────────────────
const deleteModal = reactive({ open: false, target: null, loading: false })

function openDelete(cat) { deleteModal.target = cat; deleteModal.loading = false; deleteModal.open = true }

async function confirmDelete() {
  deleteModal.loading = true
  try {
    await categoriesApi.remove(deleteModal.target.ID)
    await load(meta.page)
    deleteModal.open = false
    showToast('Category deleted')
  } catch {
    showToast('Failed to delete', 'error')
    deleteModal.open = false
  } finally { deleteModal.loading = false }
}

// ── SubCategory Panel ─────────────────────────────────────────────────────────
const subPanel = reactive({ open: false, category: null, subs: [], loading: false })

async function openSubPanel(cat) {
  subPanel.category = cat
  subPanel.open     = true
  subPanel.loading  = true
  try {
    const { data } = await categoriesApi.listSubs(cat.ID, { limit: 100 })
    subPanel.subs = data?.data ?? data ?? []
  } catch { subPanel.subs = [] }
  finally { subPanel.loading = false }
}

async function toggleSubActive(sub) {
  try {
    await categoriesApi.toggleSubStatus(subPanel.category.ID, sub.ID)
    sub.is_active = !sub.is_active
    showToast(`SubCategory ${sub.is_active ? 'activated' : 'hidden'}`)
  } catch { showToast('Failed to update', 'error') }
}

// ── SubCategory Modal ─────────────────────────────────────────────────────────
const subModal = reactive({
  open: false, editing: null, saving: false, uploading: false, error: '', preview: '',
  form: { name: '', description: '', image: '', is_active: true }
})

function openSubModal(sub = null) {
  subModal.editing  = sub
  subModal.error    = ''
  subModal.uploading = false
  if (sub) {
    subModal.preview = sub.image || ''
    subModal.form = { name: sub.name, description: sub.description || '', image: sub.image || '', is_active: sub.is_active }
  } else {
    subModal.preview = ''
    subModal.form = { name: '', description: '', image: '', is_active: true }
  }
  subModal.open = true
}

function closeSubModal() { subModal.open = false }

async function onSubImageChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  subModal.preview   = URL.createObjectURL(file)
  subModal.uploading = true
  try {
    const { data } = await uploadApi.image(file, 'categories')
    subModal.form.image = data.url
  } catch { subModal.error = 'Image upload failed' }
  finally { subModal.uploading = false; if (subFileInput.value) subFileInput.value.value = '' }
}

async function saveSub() {
  subModal.saving = true; subModal.error = ''
  const catId = subPanel.category.ID
  try {
    if (subModal.editing) {
      await categoriesApi.updateSub(catId, subModal.editing.ID, subModal.form)
      const idx = subPanel.subs.findIndex(s => s.ID === subModal.editing.ID)
      if (idx !== -1) subPanel.subs[idx] = { ...subPanel.subs[idx], ...subModal.form }
    } else {
      const { data } = await categoriesApi.createSub(catId, subModal.form)
      subPanel.subs.push(data)
    }
    // Update sub_categories count on parent row
    const parentRow = rows.value.find(r => r.ID === catId)
    if (parentRow) {
      parentRow.sub_categories = subPanel.subs
    }
    subModal.open = false
    showToast(subModal.editing ? 'SubCategory updated' : 'SubCategory created')
  } catch (e) {
    subModal.error = e.response?.data?.error || 'Failed to save subcategory'
  } finally { subModal.saving = false }
}

// ── SubCategory Delete ────────────────────────────────────────────────────────
const deleteSubModal = reactive({ open: false, target: null, loading: false })

function openDeleteSub(sub) { deleteSubModal.target = sub; deleteSubModal.loading = false; deleteSubModal.open = true }

async function confirmDeleteSub() {
  deleteSubModal.loading = true
  try {
    await categoriesApi.removeSub(subPanel.category.ID, deleteSubModal.target.ID)
    subPanel.subs = subPanel.subs.filter(s => s.ID !== deleteSubModal.target.ID)
    const parentRow = rows.value.find(r => r.ID === subPanel.category.ID)
    if (parentRow) parentRow.sub_categories = subPanel.subs
    deleteSubModal.open = false
    showToast('SubCategory deleted')
  } catch {
    showToast('Failed to delete', 'error')
    deleteSubModal.open = false
  } finally { deleteSubModal.loading = false }
}

onMounted(() => { load(1); window.addEventListener('keydown', onKeyDown) })
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<style scoped>
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: all 0.3s ease;
}
.slide-panel-enter-from .relative,
.slide-panel-leave-to .relative {
  transform: translateX(100%);
}
.slide-panel-enter-from .absolute,
.slide-panel-leave-to .absolute {
  opacity: 0;
}
</style>