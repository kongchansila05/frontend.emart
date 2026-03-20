# MarketPlace — Admin Panel

> Vue 3 · Vue Router 4 · Pinia · Tailwind CSS · Vite

---

## 📁 Project Structure

```
src/
├── assets/
│   └── main.css            ← Tailwind + global component classes
├── components/
│   ├── Sidebar.vue         ← Navigation sidebar
│   ├── Navbar.vue          ← Top header bar
│   └── DataTable.vue       ← Reusable table with slots
├── views/
│   ├── Login.vue           ← Auth page
│   ├── Dashboard.vue       ← Stats overview
│   ├── Users.vue           ← User management
│   ├── Posts.vue           ← Post moderation
│   ├── Categories.vue      ← Category CRUD
│   └── Roles.vue           ← Roles & Permissions CRUD
├── store/
│   └── auth.js             ← Pinia auth store (JWT)
├── router/
│   └── index.js            ← Vue Router + auth guard
├── services/
│   └── api.js              ← Axios instance + all API calls
└── main.js
```

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Production build
npm run build
```

---

## 🔧 Environment Variables

Create `.env` in the root:

```env
VITE_API_URL=http://localhost:8080/api
```

Make sure the Go backend is running before starting the admin panel.

---

## 🔑 Default Login

| Email               | Password   |
|---------------------|------------|
| admin@market.com    | admin123   |

---

## ✨ Features

| Page          | Features |
|---------------|----------|
| **Login**     | JWT auth, demo credentials, password toggle |
| **Dashboard** | Stats cards, quick actions, progress bars |
| **Users**     | Search, filter by role, inline limit editor, enable/disable, edit modal |
| **Posts**     | Status filter, inline status change dropdown, detail modal, delete |
| **Categories**| Search, create/edit modal, toggle active switch |
| **Roles**     | Role CRUD with permission assignment, permission CRUD |

---

## 🎨 Design System

All reusable classes are defined in `src/assets/main.css`:

```css
.btn-primary   /* amber action button */
.btn-ghost     /* subtle bordered button */
.btn-danger    /* red destructive action */
.btn-success   /* green positive action */
.btn-warning   /* amber edit action */
.form-input    /* dark styled input */
.form-select   /* dark styled select */
.form-label    /* uppercase label */
.card          /* dark surface card */
```
