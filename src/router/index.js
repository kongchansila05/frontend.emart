import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'

import Login       from '@/views/Login.vue'
import Dashboard   from '@/views/Dashboard.vue'
import ClientUsers from '@/views/ClientUsers.vue'
import StaffUsers  from '@/views/StaffUsers.vue'
import Posts       from '@/views/Posts.vue'
import Categories  from '@/views/Categories.vue'
import Roles       from '@/views/Roles.vue'
import Banners from '@/views/Banners.vue'
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, title: 'Dashboard' }
  },
  {
    path: '/clients',
    name: 'ClientUsers',
    component: ClientUsers,
    meta: {
      requiresAuth: true,
      title: 'Client & Users',
      // Both administrator + admin can access
    }
  },
  {
    path: '/staff',
    name: 'StaffUsers',
    component: StaffUsers,
    meta: {
      requiresAuth: true,
      title: 'Staff & Users',
      administratorOnly: true   // administrator only
    }
  },
  {
    path: '/posts',
    name: 'Posts',
    component: Posts,
    meta: {
      requiresAuth: true,
      title: 'Posts',
      // Both administrator + admin can access
    }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: Categories,
    meta: {
      requiresAuth: true,
      title: 'Categories',
      administratorOnly: true   // administrator only
    }
  },
  {
    path: '/banners',
    name: 'Banners',
    component: Banners,
    meta: { requiresAuth: true, title: 'Banners', administratorOnly: true }
  },
  {
    path: '/roles',
    name: 'Roles',
    component: Roles,
    meta: {
      requiresAuth: true,
      title: 'Roles & Permissions',
      administratorOnly: true   // administrator only
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ── Navigation guard ──────────────────────────────────────────────────────────
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth) {

    // 1. No token → send to login
    if (!auth.token) return { name: 'Login' }

    // 2. No user in memory → must fetch (e.g. page reload)
    if (!auth.user) {
      await auth.fetchMe()
      if (!auth.user) return { name: 'Login' }
    } else {
      // User already loaded — silently refresh in background (non-blocking)
      auth.fetchMe()
    }

    // 3. Must be staff (administrator or admin) to enter the panel
    if (!auth.isStaff) {
      auth.logout()
      return { name: 'Login' }
    }

    // 4. Some routes are administrator-only — redirect admin to Dashboard
    if (to.meta.administratorOnly && !auth.isAdministrator) {
      return { name: 'Dashboard' }
    }
  }

  // 5. Already logged in → skip login page
  if (to.meta.guest && auth.token && auth.user) {
    return { name: 'Dashboard' }
  }
})

export default router