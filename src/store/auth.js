import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/api.js'
import router from '@/router/index.js'

export const useAuthStore = defineStore('auth', () => {

  const user  = ref(JSON.parse(localStorage.getItem('mp_user') || 'null'))
  const token = ref(localStorage.getItem('mp_token') || null)

  // ── Role helpers ──────────────────────────────────────────────────────────
  const roleName = computed(() => {
    const role = user.value?.role
    return (typeof role === 'string' ? role : role?.name) || ''
  })

  /** Single super-user — has access to everything */
  const isAdministrator = computed(() => roleName.value === 'administrator')

  /** Staff admin — can manage clients and posts only */
  const isAdmin = computed(() => roleName.value === 'admin')

  /** Either administrator or admin — used for route guard */
  const isStaff = computed(() => isAdministrator.value || isAdmin.value)

  // ── Permission helpers ────────────────────────────────────────────────────
  const permissions = computed(() =>
    (user.value?.role?.permissions || []).map(p =>
      typeof p === 'string' ? p : p.name
    )
  )

  /** Check if user has a specific permission key */
  const can = (perm) => {
    // administrator always has everything
    if (isAdministrator.value) return true
    return permissions.value.includes(perm)
  }

  // Granular permission flags
  const canCreateClient   = computed(() => isAdministrator.value || can('create_client'))
  const canCreatePost     = computed(() => isAdministrator.value || can('create_post'))
  const canManagePosts    = computed(() => isAdministrator.value || can('manage_posts'))
  const canManageUsers    = computed(() => isAdministrator.value || can('manage_users'))
  const canManageCategories = computed(() => isAdministrator.value || can('manage_categories'))
  const canManageRoles    = computed(() => isAdministrator.value || can('manage_roles'))
  const canViewReports    = computed(() => isAdministrator.value || can('view_reports'))

  // ── Profile helpers ───────────────────────────────────────────────────────
  const isAuthed   = computed(() => !!token.value && !!user.value)
  const userName   = computed(() => user.value?.name   || '')
  const userEmail  = computed(() => user.value?.email  || '')
  const userAvatar = computed(() => user.value?.name?.[0]?.toUpperCase() || 'A')

  // ── Login ─────────────────────────────────────────────────────────────────
  async function login(email, password) {
    const { data } = await authApi.login({ email, password })

    const role = data.user.role
    const name = typeof role === 'string' ? role : role?.name

    if (name !== 'administrator' && name !== 'admin') {
      throw new Error('Access denied — admin accounts only')
    }

    token.value = data.token
    user.value  = data.user
    localStorage.setItem('mp_token', data.token)
    localStorage.setItem('mp_user',  JSON.stringify(data.user))
    router.push('/')
  }

  // ── Fetch current user ────────────────────────────────────────────────────
  async function fetchMe() {
    try {
      const { data } = await authApi.me()
      user.value = data.user
      localStorage.setItem('mp_user', JSON.stringify(data.user))
    } catch {
      logout()
    }
  }
  function setAuth(newToken, newUser) {
    token.value = newToken
    user.value  = newUser
    localStorage.setItem('mp_token', newToken)
    localStorage.setItem('mp_user',  JSON.stringify(newUser))
    router.push('/')
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  function logout() {
    token.value = null
    user.value  = null
    localStorage.removeItem('mp_token')
    localStorage.removeItem('mp_user')
    router.push('/login')
  }

  return {
    // State
    user,
    token,

    // Role flags
    roleName,
    isAuthed,
    isAdministrator,
    isAdmin,
    isStaff,

    // Profile
    userName,
    userEmail,
    userAvatar,

    // Permissions
    permissions,
    can,
    canCreateClient,
    canCreatePost,
    canManagePosts,
    canManageUsers,
    canManageCategories,
    canManageRoles,
    canViewReports,

    // Actions
    login,
    fetchMe,
    logout,
    setAuth,   // ← add
  }
})