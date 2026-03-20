<template>
  <div class="flex h-screen overflow-hidden">
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      <main class="flex-1 overflow-y-auto p-8 animate-fade-in">

        <!-- ── Confirm Delete ──────────────────────────────────────────────── -->
        <ConfirmDelete
          v-model="deleteModal.open"
          title="Delete Banner"
          :item-name="deleteModal.target?.title"
          :item-icon="deleteModal.target?.image"
          description="This banner will be permanently removed."
          warning="This action cannot be undone."
          confirm-label="Yes, Delete Banner"
          :loading="deleteModal.loading"
          @confirm="confirmDelete"
        />

        <!-- ── Stats ──────────────────────────────────────────────────────── -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="card px-5 py-4 flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-xl">🎯</div>
            <div>
              <div class="text-2xl font-bold text-gray-800 font-mono">{{ meta.total_items }}</div>
              <div class="text-xs text-gray-400 uppercase tracking-wider">Total Banners</div>
            </div>
          </div>
          <div class="card px-5 py-4 flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl">✅</div>
            <div>
              <div class="text-2xl font-bold text-emerald-600 font-mono">{{ activeCount }}</div>
              <div class="text-xs text-gray-400 uppercase tracking-wider">Active</div>
            </div>
          </div>
        </div>

        <!-- ── Table ──────────────────────────────────────────────────────── -->
        <DataTable :columns="columns" :rows="rows" :loading="loading" empty-text="No banners yet" empty-icon="🎯">

          <template #header>
            <div class="flex items-center gap-2">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input v-model="search" @input="onSearch" placeholder="Search banners…" class="form-input pl-10 py-2 w-56" />
              </div>

              <select v-model="positionFilter" @change="setFilter('position', positionFilter)" class="form-select py-2 w-36">
                <option value="">All Positions</option>
                <option value="top">Top</option>
                <option value="middle">Middle</option>
                <option value="bottom">Bottom</option>
                <option value="sidebar">Sidebar</option>
              </select>

              <select v-model="statusFilter" @change="setFilter('is_active', statusFilter)" class="form-select py-2 w-32">
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Hidden</option>
              </select>

              <button
                v-if="positionFilter || statusFilter || search"
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
              </select>
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
                Add Banner
              </button>
            </div>
          </template>

          <!-- Banner preview + title -->
          <template #cell-title="{ row }">
            <div class="flex items-center gap-3">
              <div
                class="w-16 h-10 rounded-lg overflow-hidden border border-surface-600 bg-surface-900 shrink-0 cursor-pointer hover:opacity-75 transition-opacity"
                @click="openImagePopup(row.image)"
              >
                <img v-if="row.image" :src="row.image" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-lg">🎯</div>
              </div>
              <div>
                <div class="font-semibold text-gray-800 text-sm">{{ row.title }}</div>
              </div>
            </div>
          </template>

          <!-- Position badge -->
          <template #cell-position="{ row }">
            <span :class="['text-xs font-semibold px-2.5 py-1 rounded-lg border', positionClass(row.position)]">
              {{ row.position }}
            </span>
          </template>

          <!-- Schedule -->
          <template #cell-schedule="{ row }">
            <div class="text-xs text-gray-500">
              <div v-if="row.starts_at">From {{ formatDate(row.starts_at) }}</div>
              <div v-if="row.ends_at">Until {{ formatDate(row.ends_at) }}</div>
              <span v-if="!row.starts_at && !row.ends_at" class="text-gray-400">Always</span>
            </div>
          </template>

          <!-- Status toggle -->
          <template #cell-is_active="{ row }">
            <button
              @click="toggleStatus(row)"
              :class="['relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                row.is_active ? 'bg-emerald-500' : 'bg-surface-500']"
            >
              <span :class="['inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
                row.is_active ? 'translate-x-[18px]' : 'translate-x-0.5']"></span>
            </button>
          </template>

          <!-- Sort order -->
          <template #cell-sort_order="{ row }">
            <input
              type="number" :value="row.sort_order" min="0"
              @change="e => updateSortOrder(row, e.target.value)"
              class="w-14 px-2 py-1.5 bg-surface-900 border border-surface-600 rounded-lg text-xs text-gray-800 font-mono text-center outline-none focus:border-brand-500 transition-all"
            />
          </template>

          <!-- Actions -->
          <template #cell-actions="{ row }">
            <div class="flex items-center justify-end gap-2">
              <button @click="openModal(row)" class="btn-warning">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit
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

        <!-- ── Create / Edit Modal ─────────────────────────────────────────── -->
        <transition name="modal">
          <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>
            <div class="relative card w-full max-w-lg p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
              <button @click="closeModal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>

              <h2 class="text-lg font-bold text-gray-800 mb-1">{{ modal.editing ? 'Edit Banner' : 'New Banner' }}</h2>
              <p class="text-sm text-gray-400 mb-6">{{ modal.editing ? 'Update promotion details' : 'Create a new promotional banner' }}</p>

              <div v-if="modal.error" class="mb-4 px-4 py-3 bg-red-100 border border-red-200 rounded-xl text-red-600 text-sm">
                {{ modal.error }}
              </div>

              <form @submit.prevent="save" class="space-y-4">

                <!-- Banner image upload -->
                <div>
                  <label class="form-label">Banner Image *</label>
                  <div class="flex items-center gap-4">
                    <div
                      class="w-24 h-14 rounded-xl border-2 border-dashed border-surface-600 overflow-hidden bg-surface-900 shrink-0 flex items-center justify-center"
                      :class="modal.preview ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''"
                      @click="modal.preview && openImagePopup(modal.preview)"
                    >
                      <img v-if="modal.preview" :src="modal.preview" class="w-full h-full object-cover" />
                      <svg v-else class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <div class="flex-1">
                      <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" @change="onFileChange" />
                      <button type="button" @click="$refs.fileInput.click()" :disabled="modal.uploading" class="btn-ghost w-full justify-center text-xs py-2">
                        <svg v-if="modal.uploading" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                        </svg>
                        {{ modal.uploading ? 'Uploading…' : 'Choose Image' }}
                      </button>
                      <p class="text-xs text-gray-400 mt-1 text-center">JPEG, PNG, WebP — max 5 MB</p>
                      <button v-if="modal.preview" type="button" @click="removeImage"
                        class="mt-1 text-xs text-red-500 hover:text-red-600 w-full text-center transition-colors">
                        Remove image
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="form-label">Title *</label>
                  <input v-model="modal.form.title" placeholder="Summer Sale — Up to 50% Off" required class="form-input" />
                </div>

                <div>
                  <label class="form-label">Link URL</label>
                  <input v-model="modal.form.link_url" placeholder="https://example.com/sale" class="form-input" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Position</label>
                    <select v-model="modal.form.position" class="form-select">
                      <option value="top">Top</option>
                      <option value="middle">Middle</option>
                      <option value="bottom">Bottom</option>
                      <option value="sidebar">Sidebar</option>
                    </select>
                  </div>
                  <div>
                    <label class="form-label">Sort Order</label>
                    <input v-model.number="modal.form.sort_order" type="number" min="0" class="form-input" />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Starts At</label>
                    <input v-model="modal.form.starts_at" type="datetime-local" class="form-input" />
                  </div>
                  <div>
                    <label class="form-label">Ends At</label>
                    <input v-model="modal.form.ends_at" type="datetime-local" class="form-input" />
                  </div>
                </div>

                <div class="flex items-center justify-between p-4 bg-surface-900 rounded-xl border border-surface-600">
                  <div>
                    <div class="text-sm font-medium text-gray-800">Active</div>
                    <div class="text-xs text-gray-400">Visible to marketplace users</div>
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
                    {{ modal.saving ? 'Saving…' : (modal.editing ? 'Update Banner' : 'Create Banner') }}
                  </button>
                  <button type="button" @click="closeModal" class="btn-ghost">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </transition>

        <!-- ── Image Popup ─────────────────────────────────────────────────── -->
        <transition name="modal">
          <div v-if="imagePopup.open" class="fixed inset-0 z-[60] flex items-center justify-center p-4" @click="imagePopup.open = false">
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            <img :src="imagePopup.url" class="relative z-10 max-w-2xl max-h-[80vh] object-contain rounded-2xl shadow-2xl" @click.stop />
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
import { bannersApi, uploadApi } from '@/services/api.js'
import { usePagination }         from '@/composables/usePagination.js'

// ── Pagination ────────────────────────────────────────────────────────────────
const { rows, meta, loading, search, pageNumbers, load, goToPage, onSearch, setFilter, setLimit } =
  usePagination((params) => bannersApi.list(params))

// ── State ─────────────────────────────────────────────────────────────────────
const positionFilter = ref('')
const statusFilter   = ref('')
const limitValue     = ref(10)
const toast          = ref(null)
const fileInput      = ref(null)
const imagePopup     = reactive({ open: false, url: '' })

const columns = [
  { key: 'title',      label: 'Banner' },
  { key: 'position',   label: 'Position' },
  { key: 'sort_order', label: 'Order' },
  { key: 'schedule',   label: 'Schedule' },
  { key: 'is_active',  label: 'Active' },
  { key: 'actions',    label: 'Actions', align: 'right' },
]

// ── Stats ─────────────────────────────────────────────────────────────────────
const activeCount = computed(() => rows.value.filter(b => b.is_active).length)

// ── Pagination helpers ────────────────────────────────────────────────────────
const rangeFrom = computed(() =>
  meta.total_items === 0 ? 0 : (meta.page - 1) * meta.limit + 1
)
const rangeTo = computed(() =>
  Math.min(meta.page * meta.limit, meta.total_items)
)

// ── Helpers ───────────────────────────────────────────────────────────────────
function positionClass(pos) {
  const map = {
    top:     'bg-brand-500/10 text-brand-600 border-brand-500/20',
    middle:  'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    bottom:  'bg-violet-500/10 text-violet-600 border-violet-500/20',
    sidebar: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  }
  return map[pos] || 'bg-gray-100 text-gray-600 border-gray-200'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function showToast(msg, type = 'success') {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 3000)
}

function clearFilters() {
  search.value         = ''
  positionFilter.value = ''
  statusFilter.value   = ''
  setFilter('position',  undefined)
  setFilter('is_active', undefined)
  load(1)
}

function openImagePopup(url) { imagePopup.url = url; imagePopup.open = true }

function onKeyDown(e) {
  if (e.key === 'Escape') {
    imagePopup.open  = false
    deleteModal.open = false
    modal.open       = false
  }
}

// ── Image upload ──────────────────────────────────────────────────────────────
async function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  modal.preview   = URL.createObjectURL(file)
  modal.uploading = true
  modal.error     = ''
  try {
    const { data } = await uploadApi.image(file, 'banners')
    modal.form.image = data.url
  } catch {
    modal.error   = 'Image upload failed'
    modal.preview = modal.form.image || ''
  } finally {
    modal.uploading = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function removeImage() {
  modal.preview    = ''
  modal.form.image = ''
  if (fileInput.value) fileInput.value.value = ''
}

// ── Modal ─────────────────────────────────────────────────────────────────────
const modal = reactive({
  open: false, editing: null, saving: false, uploading: false, error: '', preview: '',
  form: {
    title: '', image: '', link_url: '',
    position: 'top', sort_order: 0, is_active: true,
    starts_at: '', ends_at: '',
  }
})

function openModal(banner = null) {
  modal.editing   = banner
  modal.error     = ''
  modal.uploading = false
  if (banner) {
    modal.preview = banner.image || ''
    modal.form = {
      title:      banner.title      || '',
      image:      banner.image      || '',
      link_url:   banner.link_url   || '',
      position:   banner.position   || 'top',
      sort_order: banner.sort_order ?? 0,
      is_active:  banner.is_active  ?? true,
      starts_at:  banner.starts_at ? banner.starts_at.slice(0, 16) : '',
      ends_at:    banner.ends_at   ? banner.ends_at.slice(0, 16)   : '',
    }
  } else {
    modal.preview = ''
    modal.form = {
      title: '', image: '', link_url: '',
      position: 'top', sort_order: 0, is_active: true,
      starts_at: '', ends_at: '',
    }
  }
  modal.open = true
}

function closeModal() { modal.open = false }

async function save() {
  if (!modal.form.image) {
    modal.error = 'Please upload a banner image'
    return
  }
  modal.saving = true
  modal.error  = ''
  try {
    const payload = { ...modal.form }
    if (!payload.starts_at) delete payload.starts_at
    if (!payload.ends_at)   delete payload.ends_at

    if (modal.editing) {
      await bannersApi.update(modal.editing.ID, payload)
    } else {
      await bannersApi.create(payload)
    }
    await load(modal.editing ? meta.page : 1)
    modal.open = false
    showToast(modal.editing ? 'Banner updated' : 'Banner created')
  } catch (e) {
    modal.error = e.response?.data?.error || 'Failed to save banner'
  } finally { modal.saving = false }
}

// ── Toggle status ─────────────────────────────────────────────────────────────
async function toggleStatus(banner) {
  try {
    await bannersApi.toggleStatus(banner.ID)
    banner.is_active = !banner.is_active
    showToast(`Banner ${banner.is_active ? 'activated' : 'hidden'}`)
  } catch { showToast('Failed to update status', 'error') }
}

// ── Sort order inline ─────────────────────────────────────────────────────────
async function updateSortOrder(banner, val) {
  try {
    await bannersApi.update(banner.ID, { sort_order: Number(val) })
    banner.sort_order = Number(val)
    showToast('Sort order updated')
  } catch { showToast('Failed to update order', 'error') }
}

// ── Delete ────────────────────────────────────────────────────────────────────
const deleteModal = reactive({ open: false, target: null, loading: false })

function openDelete(banner) { deleteModal.target = banner; deleteModal.loading = false; deleteModal.open = true }

async function confirmDelete() {
  deleteModal.loading = true
  try {
    await bannersApi.remove(deleteModal.target.ID)
    const newPage = rows.value.length === 1 && meta.page > 1 ? meta.page - 1 : meta.page
    await load(newPage)
    deleteModal.open = false
    showToast('Banner deleted')
  } catch {
    showToast('Failed to delete', 'error')
    deleteModal.open = false
  } finally { deleteModal.loading = false }
}

onMounted(() => { load(1); window.addEventListener('keydown', onKeyDown) })
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>