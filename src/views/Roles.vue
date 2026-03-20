<template>
  <div class="flex h-screen overflow-hidden">
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      <main class="flex-1 overflow-y-auto p-8 animate-fade-in">

        <div class="grid grid-cols-1 xl:grid-cols-5 gap-6">

          <!-- ── Roles table (left 3 cols) ───────────────────────────────── -->
          <div class="xl:col-span-3">
            <DataTable :columns="roleColumns" :rows="roles" :loading="loading" empty-text="No roles found" empty-icon="🔐">

              <template #header>
                <h2 class="font-semibold text-gray-800">Roles</h2>
                <button @click="openRoleModal()" class="btn-primary text-xs">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  New Role
                </button>
              </template>

              <!-- Role name -->
              <template #cell-name="{ row }">
                <span :class="['text-xs font-bold px-2.5 py-1 rounded-lg',
                  row.name === 'admin'  ? 'badge-admin' :
                  row.name === 'client' ? 'badge-client' :
                  'bg-violet-100 text-violet-700 border border-violet-500/20']">
                  {{ row.name }}
                </span>
              </template>

              <!-- Description -->
              <template #cell-description="{ row }">
                <span class="text-sm text-gray-600">{{ row.description || '—' }}</span>
              </template>

              <!-- Permissions as tags -->
              <template #cell-permissions="{ row }">
                <div class="flex flex-wrap gap-1 max-w-xs">
                  <span
                    v-for="p in (row.permissions || []).slice(0, 3)"
                    :key="p.ID"
                    class="text-xs px-2 py-0.5 bg-surface-900 border border-surface-500 text-gray-600 rounded-md font-mono"
                  >
                    {{ p.name }}
                  </span>
                  <span
                    v-if="(row.permissions || []).length > 3"
                    class="text-xs px-2 py-0.5 bg-surface-900 text-gray-400 rounded-md"
                  >
                    +{{ row.permissions.length - 3 }}
                  </span>
                  <span v-if="!(row.permissions || []).length" class="text-xs text-gray-400">None</span>
                </div>
              </template>

              <!-- Actions -->
              <template #cell-actions="{ row }">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openRoleModal(row)" class="btn-warning">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Edit
                  </button>
                  <button
                    @click="removeRole(row)"
                    :disabled="row.name === 'admin' || row.name === 'client'"
                    class="btn-danger disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </template>

            </DataTable>
          </div>

          <!-- ── Permissions panel (right 2 cols) ───────────────────────── -->
          <div class="xl:col-span-2">
            <div class="card overflow-hidden">
              <div class="px-6 py-4 border-b border-surface-600 flex items-center justify-between">
                <h2 class="font-semibold text-gray-800">Permissions</h2>
                <button @click="openPermModal()" class="btn-primary text-xs py-1.5">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Add
                </button>
              </div>

              <div v-if="loadingPerms" class="flex items-center justify-center py-12">
                <svg class="w-6 h-6 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              </div>

              <div v-else class="divide-y divide-surface-700">
                <div
                  v-for="p in permissions"
                  :key="p.ID"
                  class="flex items-center justify-between px-6 py-3.5 hover:bg-surface-950/60 transition-colors group"
                >
                  <div>
                    <div class="text-xs font-mono text-brand-600 bg-indigo-500/20 border border-brand-500/20 px-2.5 py-0.5 rounded-md inline-block mb-1">
                      {{ p.name }}
                    </div>
                    <div class="text-xs text-gray-400">{{ p.description || 'No description' }}</div>
                  </div>
                  <button
                    @click="removePermission(p)"
                    class="opacity-0 group-hover:opacity-100 btn-danger transition-opacity"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <div v-if="!permissions.length" class="px-6 py-10 text-center text-gray-400 text-sm">
                  No permissions defined
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Role Modal ──────────────────────────────────────────────────── -->
        <transition name="modal">
          <div v-if="roleModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="roleModal.open = false"></div>
            <div class="relative card w-full max-w-lg p-7 shadow-2xl z-10">
              <button @click="roleModal.open = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>

              <h2 class="text-lg font-bold text-gray-800 mb-1">
                {{ roleModal.editing ? 'Edit Role' : 'New Role' }}
              </h2>
              <p class="text-sm text-gray-400 mb-6">Configure role name and assign permissions</p>

              <div v-if="roleModal.error" class="mb-4 px-4 py-3 bg-red-100 border border-red-500/30 rounded-xl text-red-600 text-sm">
                {{ roleModal.error }}
              </div>

              <form @submit.prevent="saveRole" class="space-y-5">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Role Name *</label>
                    <input v-model="roleModal.form.name" placeholder="moderator" required class="form-input" />
                  </div>
                  <div>
                    <label class="form-label">Description</label>
                    <input v-model="roleModal.form.description" placeholder="Brief description" class="form-input" />
                  </div>
                </div>

                <div>
                  <label class="form-label">Permissions</label>
                  <div class="flex flex-wrap gap-2 p-3 bg-surface-900 border border-surface-600 rounded-xl min-h-16">
                    <button
                      v-for="p in permissions"
                      :key="p.ID"
                      type="button"
                      @click="togglePerm(p.ID)"
                      :class="['text-xs px-3 py-1.5 rounded-lg font-mono font-medium transition-all border',
                        roleModal.form.permissions.includes(p.ID)
                          ? 'bg-brand-500/20 text-brand-600 border-brand-500/40'
                          : 'bg-surface-900 text-gray-400 border-surface-500 hover:border-surface-400']"
                    >
                      {{ p.name }}
                    </button>
                    <span v-if="!permissions.length" class="text-xs text-gray-400 self-center">No permissions available</span>
                  </div>
                  <p class="text-xs text-gray-400 mt-1.5">
                    {{ roleModal.form.permissions.length }} of {{ permissions.length }} selected
                  </p>
                </div>

                <div class="flex gap-3 pt-2">
                  <button type="submit" :disabled="roleModal.saving" class="btn-primary flex-1 justify-center">
                    <svg v-if="roleModal.saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    {{ roleModal.saving ? 'Saving…' : (roleModal.editing ? 'Update Role' : 'Create Role') }}
                  </button>
                  <button type="button" @click="roleModal.open = false" class="btn-ghost">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </transition>

        <!-- ── Permission Modal ────────────────────────────────────────────── -->
        <transition name="modal">
          <div v-if="permModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="permModal.open = false"></div>
            <div class="relative card w-full max-w-md p-7 shadow-2xl z-10">
              <button @click="permModal.open = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>

              <h2 class="text-lg font-bold text-gray-800 mb-1">New Permission</h2>
              <p class="text-sm text-gray-400 mb-6">Add a granular access control key</p>

              <div v-if="permModal.error" class="mb-4 px-4 py-3 bg-red-100 border border-red-500/30 rounded-xl text-red-600 text-sm">
                {{ permModal.error }}
              </div>

              <form @submit.prevent="savePermission" class="space-y-4">
                <div>
                  <label class="form-label">Key Name *</label>
                  <input
                    v-model="permModal.form.name"
                    placeholder="manage_reports"
                    required
                    class="form-input font-mono"
                    pattern="[a-z_]+"
                    title="Lowercase letters and underscores only"
                  />
                  <p class="text-xs text-gray-400 mt-1.5">snake_case only — e.g. <code class="text-brand-500">view_analytics</code></p>
                </div>
                <div>
                  <label class="form-label">Description</label>
                  <input v-model="permModal.form.description" placeholder="What does this allow?" class="form-input" />
                </div>
                <div class="flex gap-3 pt-2">
                  <button type="submit" :disabled="permModal.saving" class="btn-primary flex-1 justify-center">
                    <svg v-if="permModal.saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    {{ permModal.saving ? 'Saving…' : 'Add Permission' }}
                  </button>
                  <button type="button" @click="permModal.open = false" class="btn-ghost">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </transition>

        <!-- Toast -->
        <transition name="toast">
          <div v-if="toast" :class="['fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium',
            toast.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600' : 'bg-red-500/15 border-red-500/30 text-red-600']">
            {{ toast.msg }}
          </div>
        </transition>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import Sidebar   from '@/components/Sidebar.vue'
import Navbar    from '@/components/Navbar.vue'
import DataTable from '@/components/DataTable.vue'
import { rolesApi, permissionsApi } from '@/services/api.js'

const roles       = ref([])
const permissions = ref([])
const loading     = ref(false)
const loadingPerms = ref(false)
const toast       = ref(null)

const roleModal = reactive({
  open: false, editing: null, saving: false, error: '',
  form: { name: '', description: '', permissions: [] }
})

const permModal = reactive({
  open: false, saving: false, error: '',
  form: { name: '', description: '' }
})

const roleColumns = [
  { key: 'name',        label: 'Role' },
  { key: 'description', label: 'Description' },
  { key: 'permissions', label: 'Permissions' },
  { key: 'actions',     label: 'Actions', align: 'right' },
]

function showToast(msg, type = 'success') {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 3000)
}

async function load() {
  loading.value = true
  loadingPerms.value = true
  try {
    const [rRes, pRes] = await Promise.all([rolesApi.list(), permissionsApi.list()])
    roles.value       = rRes.data || []
    permissions.value = pRes.data || []
  } finally {
    loading.value      = false
    loadingPerms.value = false
  }
}

// ── Roles ──────────────────────────────────────────────────────────────────

function openRoleModal(role = null) {
  roleModal.editing = role
  roleModal.error   = ''
  if (role) {
    roleModal.form = {
      name:        role.name,
      description: role.description,
      permissions: (role.permissions || []).map(p => p.ID)
    }
  } else {
    roleModal.form = { name: '', description: '', permissions: [] }
  }
  roleModal.open = true
}

function togglePerm(id) {
  const idx = roleModal.form.permissions.indexOf(id)
  if (idx > -1) roleModal.form.permissions.splice(idx, 1)
  else           roleModal.form.permissions.push(id)
}

async function saveRole() {
  roleModal.saving = true
  roleModal.error  = ''
  try {
    if (roleModal.editing) {
      await rolesApi.update(roleModal.editing.ID, roleModal.form)
    } else {
      await rolesApi.create(roleModal.form)
    }
    await load()
    roleModal.open = false
    showToast(roleModal.editing ? 'Role updated' : 'Role created')
  } catch (e) {
    roleModal.error = e.response?.data?.error || 'Failed to save role'
  } finally { roleModal.saving = false }
}

async function removeRole(role) {
  if (!confirm(`Delete role "${role.name}"?`)) return
  try {
    await rolesApi.remove(role.ID)
    roles.value = roles.value.filter(r => r.ID !== role.ID)
    showToast('Role deleted')
  } catch { showToast('Failed to delete role', 'error') }
}

// ── Permissions ───────────────────────────────────────────────────────────

function openPermModal() {
  permModal.form  = { name: '', description: '' }
  permModal.error = ''
  permModal.open  = true
}

async function savePermission() {
  permModal.saving = true
  permModal.error  = ''
  try {
    await permissionsApi.create(permModal.form)
    await load()
    permModal.open = false
    showToast('Permission added')
  } catch (e) {
    permModal.error = e.response?.data?.error || 'Failed to add permission'
  } finally { permModal.saving = false }
}

async function removePermission(perm) {
  if (!confirm(`Delete permission "${perm.name}"? It will be removed from all roles.`)) return
  try {
    await permissionsApi.remove(perm.ID)
    permissions.value = permissions.value.filter(p => p.ID !== perm.ID)
    showToast('Permission deleted')
  } catch { showToast('Failed to delete permission', 'error') }
}

onMounted(load)
</script>
