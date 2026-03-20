import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
})

// ── Attach JWT on every request ───────────────────────────────────────────────
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('mp_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Auto-logout on 401 ────────────────────────────────────────────────────────
http.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const url = err.config?.url || ''
      // Don't redirect if it's an auth endpoint failing
      if (!url.includes('/auth/')) {
        localStorage.removeItem('mp_token')
        localStorage.removeItem('mp_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)
// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login:                (payload) => http.post('/auth/login',           payload),
  register:             (payload) => http.post('/auth/register',        payload),  // ← public client register
  registerClient:       (payload) => http.post('/auth/register/client', payload),
  registerStaff:        (payload) => http.post('/auth/register/staff',  payload),
  googleLogin:          (token)   => http.post('/auth/google',          { token }),
  googleRegisterClient: (token)   => http.post('/auth/google/register', { token }),
  googleRegisterStaff: (token, role) => http.post('/auth/google/register/staff', { token, role }),
  phoneLogin:           (token, phone, name) => http.post('/auth/phone',      { token, phone, name }),  // ← add
  me:                   ()        => http.get('/me'),
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashApi = {
  stats: () => http.get('/admin/stats'),
}

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  list:         (params)        => http.get('/admin/users',                    { params }),
  update:       (id, data)      => http.put(`/admin/users/${id}`,              data),
  remove:       (id)            => http.delete(`/admin/users/${id}`),
  setLimit:     (id, limit)     => http.patch(`/admin/users/${id}/limit`,      { post_limit:  Number(limit) }),
  setImageLimit:(id, limit)     => http.patch(`/admin/users/${id}/image-limit`,{ image_limit: Number(limit) }),
  toggleStatus: (id)            => http.patch(`/admin/users/${id}/status`),
}

// ─── Posts ────────────────────────────────────────────────────────────────────
export const postsApi = {
  list:         (params)        => http.get('/admin/posts',              { params }),
  adminCreate:  (data)          => http.post('/admin/posts',             data),
  adminUpdate:  (id, data)      => http.put(`/admin/posts/${id}`,        data),
  updateStatus: (id, status)    => http.patch(`/admin/posts/${id}/status`, { status }),
  remove:       (id)            => http.delete(`/admin/posts/${id}`),
  toggleLike:   (id)            => http.post(`/posts/${id}/like`),
}

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoriesApi = {
  list:   (params)       => http.get('/admin/categories',                              { params }),
  create: (data)         => http.post('/admin/categories',                             data),
  update: (id, data)     => http.put(`/admin/categories/${id}`,                        data),
  remove: (id)           => http.delete(`/admin/categories/${id}`),

  // SubCategories
  listSubs:         (catId, params) => http.get(`/admin/categories/${catId}/sub-categories`,              { params }),
  createSub:        (catId, data)   => http.post(`/admin/categories/${catId}/sub-categories`,             data),
  updateSub:        (catId, subId, data) => http.put(`/admin/categories/${catId}/sub-categories/${subId}`, data),
  removeSub:        (catId, subId)  => http.delete(`/admin/categories/${catId}/sub-categories/${subId}`),
  toggleSubStatus:  (catId, subId)  => http.patch(`/admin/categories/${catId}/sub-categories/${subId}/status`),
}

// ─── Roles ────────────────────────────────────────────────────────────────────
export const rolesApi = {
  list:   ()            => http.get('/admin/roles'),
  listStaff: ()         => http.get('/admin/roles/staff'), // For staff registration
  create: (data)        => http.post('/admin/roles',        data),
  update: (id, data)    => http.put(`/admin/roles/${id}`,   data),
  remove: (id)          => http.delete(`/admin/roles/${id}`),
}

// ─── Permissions ──────────────────────────────────────────────────────────────
export const permissionsApi = {
  list:   ()     => http.get('/admin/permissions'),
  create: (data) => http.post('/admin/permissions',      data),
  remove: (id)   => http.delete(`/admin/permissions/${id}`),
}

// ─── Upload ───────────────────────────────────────────────────────────────────
export const uploadApi = {
  image: (file, folder = 'uploads') => {
    const form = new FormData()
    form.append('file',   file)
    form.append('folder', folder)
    return http.post('/admin/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// ─── Banners ──────────────────────────────────────────────────────────────────
export const bannersApi = {
  // Public
  getActive:    (params)   => http.get('/banners',              { params }),

  // Admin
  list:         (params)   => http.get('/admin/banners',        { params }),
  create:       (data)     => http.post('/admin/banners',       data),
  update:       (id, data) => http.put(`/admin/banners/${id}`,  data),
  toggleStatus: (id)       => http.patch(`/admin/banners/${id}/status`),
  remove:       (id)       => http.delete(`/admin/banners/${id}`),
}

export default http