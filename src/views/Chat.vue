<template>
  <div class="flex h-screen overflow-hidden">
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Navbar />

      <div class="flex-1 flex overflow-hidden">

        <!-- ── Left: Conversation List ───────────────────────────────────── -->
        <div class="w-96 shrink-0 flex flex-col border-r border-surface-600"
          style="background-color: var(--surface-900)">

          <!-- Header -->
          <div class="px-4 py-4 border-b border-surface-600">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h2 class="text-sm font-bold" style="color: var(--text-base)">Chat Monitor</h2>
                <p class="text-xs text-surface-400">{{ conversations.length }} conversations</p>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="text-xs text-emerald-500 font-medium">{{ onlineCount }} online</span>
              </div>
            </div>

            <!-- Search -->
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input v-model="search" @input="onSearch" placeholder="Search conversations…"
                class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-surface-600 outline-none focus:border-brand-500 transition-colors"
                style="background-color: var(--surface-800); color: var(--text-base)" />
            </div>

            <!-- User filter banner -->
            <div v-if="filterUserName"
              class="mt-2 flex items-center gap-2 px-3 py-2 bg-brand-500/10 border border-brand-500/20 rounded-xl">
              <svg class="w-3.5 h-3.5 text-brand-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span class="text-xs text-brand-600 font-medium flex-1 truncate">{{ filterUserName }}</span>
              <button @click="clearUserFilter" class="text-brand-400 hover:text-red-500 transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Conversation list -->
          <div class="flex-1 overflow-y-auto">
            <div v-if="loading && conversations.length === 0"
              class="flex items-center justify-center py-12">
              <svg class="w-5 h-5 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>

            <div v-else-if="filteredConversations.length === 0"
              class="flex flex-col items-center justify-center py-16 text-center px-4">
              <div class="text-4xl mb-3">💬</div>
              <p class="text-sm text-surface-400">No conversations</p>
              <button v-if="filterUserName" @click="clearUserFilter"
                class="mt-2 text-xs text-brand-500 hover:underline">Clear filter</button>
            </div>

            <button v-for="conv in filteredConversations" :key="conv.ID"
              @click="openConversation(conv)"
              :class="['w-full text-left px-4 py-3 border-b border-surface-600/40 transition-all',
                selectedConv?.ID === conv.ID
                  ? 'bg-violet-500/10 border-l-2 border-l-violet-500'
                  : 'hover:bg-surface-800']">

              <!-- Badge + time -->
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400">
                  💬 Direct
                </span>
                <span class="text-[10px] text-surface-400 ml-2 shrink-0">
                  {{ formatTime(conv.last_message_at) }}
                </span>
              </div>

              <!-- Users row -->
              <div class="flex items-center gap-2">
                <!-- User 1 -->
                <div class="flex items-center gap-1.5">
                  <div class="relative">
                    <div class="w-6 h-6 rounded-lg overflow-hidden border border-surface-600 flex items-center justify-center text-[10px] font-bold text-black shrink-0"
                      :style="{ background: avatarColor(conv.user1?.name) }">
                      <img v-if="conv.user1?.avatar" :src="conv.user1.avatar" class="w-full h-full object-cover" />
                      <span v-else>{{ conv.user1?.name?.[0] }}</span>
                    </div>
                    <div v-if="isOnline(conv.user1_id)"
                      class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-surface-900"></div>
                  </div>
                  <span class="text-xs truncate max-w-[70px]" style="color: var(--text-base)">
                    {{ conv.user1?.name }}
                  </span>
                </div>

                <svg class="w-3 h-3 text-surface-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                </svg>

                <!-- User 2 -->
                <div class="flex items-center gap-1.5">
                  <div class="relative">
                    <div class="w-6 h-6 rounded-lg overflow-hidden border border-surface-600 flex items-center justify-center text-[10px] font-bold text-black shrink-0"
                      :style="{ background: avatarColor(conv.user2?.name) }">
                      <img v-if="conv.user2?.avatar" :src="conv.user2.avatar" class="w-full h-full object-cover" />
                      <span v-else>{{ conv.user2?.name?.[0] }}</span>
                    </div>
                    <div v-if="isOnline(conv.user2_id)"
                      class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-surface-900"></div>
                  </div>
                  <span class="text-xs truncate max-w-[70px]" style="color: var(--text-base)">
                    {{ conv.user2?.name }}
                  </span>
                </div>
              </div>

              <!-- Last message preview -->
              <p class="text-[11px] text-surface-400 truncate mt-1.5 pl-1 flex items-center gap-1">
                <svg v-if="conv.last_message === '📷 Image'" class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                {{ conv.last_message || 'No messages yet' }}
              </p>
            </button>
          </div>
        </div>

        <!-- ── Right: Messages ───────────────────────────────────────────── -->
        <div class="flex-1 flex flex-col overflow-hidden">

          <!-- Empty state -->
          <div v-if="!selectedConv" class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <div class="text-6xl mb-4">💬</div>
              <p class="text-sm font-medium" style="color: var(--text-base)">Select a conversation</p>
              <p class="text-xs text-surface-400 mt-1">Direct messages between users</p>
            </div>
          </div>

          <template v-else>
            <!-- Chat header -->
            <div class="px-6 py-4 border-b border-surface-600 flex items-center gap-4 flex-wrap"
              style="background-color: var(--surface-900)">

              <div class="flex items-center gap-2">
                <div class="w-10 h-10 rounded-xl border border-violet-500/30 bg-violet-500/10 flex items-center justify-center text-lg">💬</div>
                <div>
                  <div class="text-sm font-bold" style="color: var(--text-base)">Direct Message</div>
                  <div class="text-xs text-violet-400">Private conversation</div>
                </div>
              </div>

              <div class="h-8 w-px bg-surface-600 shrink-0"></div>

              <UserChip :user="selectedConv.user1" :online="isOnline(selectedConv.user1_id)" :avatarColor="avatarColor" />

              <svg class="w-4 h-4 text-surface-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>

              <UserChip :user="selectedConv.user2" :online="isOnline(selectedConv.user2_id)" :avatarColor="avatarColor" />

              <button @click="confirmDelete = true"
                class="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500
                       hover:bg-red-50 border border-red-200 rounded-xl transition-all shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Delete
              </button>
            </div>

            <!-- Messages -->
            <div ref="messagesEl" class="flex-1 overflow-y-auto px-6 py-4 space-y-2"
              style="background-color: var(--surface-950)">

              <div v-if="msgLoading" class="flex justify-center py-8">
                <svg class="w-5 h-5 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              </div>

              <div v-else-if="messages.length === 0"
                class="flex flex-col items-center justify-center py-16 text-center">
                <div class="text-4xl mb-2">🕊️</div>
                <p class="text-sm text-surface-400">No messages yet</p>
              </div>

              <template v-else>
                <template v-for="(msg, idx) in messages" :key="msg.ID">

                  <!-- Date separator -->
                  <div v-if="showDateSep(idx)" class="flex items-center gap-3 py-1">
                    <div class="flex-1 h-px bg-surface-700"></div>
                    <span class="text-[11px] text-surface-400 px-2">{{ formatDateSep(msg.CreatedAt) }}</span>
                    <div class="flex-1 h-px bg-surface-700"></div>
                  </div>

                  <!-- Message row: user1 = left, user2 = right -->
                  <div :class="['flex items-end gap-2', isLeftSide(msg) ? 'justify-start' : 'justify-end']">

                    <!-- Left avatar -->
                    <div v-if="isLeftSide(msg)"
                      class="w-6 h-6 rounded-lg shrink-0 overflow-hidden border border-surface-600 flex items-center justify-center mb-0.5 text-[9px] font-bold text-black"
                      :style="{ background: avatarColor(selectedConv.user1?.name) }">
                      <img v-if="selectedConv.user1?.avatar" :src="selectedConv.user1.avatar" class="w-full h-full object-cover" />
                      <span v-else>{{ selectedConv.user1?.name?.[0] }}</span>
                    </div>

                    <!-- Bubble -->
                    <div :class="['flex flex-col max-w-sm', isLeftSide(msg) ? 'items-start' : 'items-end']">
                      <span class="text-[10px] text-surface-400 mb-0.5 px-1">
                        {{ isLeftSide(msg) ? selectedConv.user1?.name : selectedConv.user2?.name }}
                      </span>

                      <!-- Image -->
                      <div v-if="msg.image_url"
                        :class="['rounded-2xl overflow-hidden cursor-pointer border-2 transition-opacity hover:opacity-90',
                          isLeftSide(msg) ? 'rounded-tl-sm border-surface-600' : 'rounded-tr-sm border-violet-500/40']"
                        @click="openLightbox(msg.image_url)">
                        <img :src="msg.image_url" alt="Image"
                          class="max-w-[240px] max-h-[240px] object-cover block" />
                      </div>

                      <!-- Text content -->
                      <div v-if="msg.content"
                        :class="['px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words',
                          msg.image_url ? 'mt-1' : '',
                          isLeftSide(msg)
                            ? 'rounded-tl-sm bg-surface-700 text-surface-100'
                            : 'rounded-tr-sm bg-violet-500 text-white']">
                        {{ msg.content }}
                      </div>

                      <!-- Time + read tick -->
                      <div class="flex items-center gap-1 mt-1 px-1">
                        <span class="text-[10px] text-surface-400">{{ formatMsgTime(msg.CreatedAt) }}</span>
                        <svg v-if="msg.is_read && !isLeftSide(msg)"
                          class="w-3 h-3 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                      </div>
                    </div>

                    <!-- Right avatar -->
                    <div v-if="!isLeftSide(msg)"
                      class="w-6 h-6 rounded-lg shrink-0 overflow-hidden border border-surface-600 flex items-center justify-center mb-0.5 text-[9px] font-bold text-black"
                      :style="{ background: avatarColor(selectedConv.user2?.name) }">
                      <img v-if="selectedConv.user2?.avatar" :src="selectedConv.user2.avatar" class="w-full h-full object-cover" />
                      <span v-else>{{ selectedConv.user2?.name?.[0] }}</span>
                    </div>
                  </div>
                </template>
              </template>
            </div>

            <!-- Footer -->
            <div class="px-6 py-3 border-t border-surface-600 flex items-center gap-2"
              style="background-color: var(--surface-900)">
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400">
                💬 Direct
              </span>
              <span class="text-xs text-surface-400">Admin view — read only</span>
              <div class="ml-auto flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="text-xs text-emerald-500">Live</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Image Lightbox ──────────────────────────────────────────────────────── -->
  <transition name="modal">
    <div v-if="lightbox" class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click="lightbox = null">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      <div class="relative z-10 flex flex-col items-center" @click.stop>
        <button @click="lightbox = null"
          class="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <img :src="lightbox" class="max-w-2xl max-h-[80vh] object-contain rounded-2xl shadow-2xl" />
        <a :href="lightbox" target="_blank"
          class="mt-3 text-xs text-white/60 hover:text-white underline transition-colors">
          Open original ↗
        </a>
      </div>
    </div>
  </transition>

  <!-- ── Confirm Delete ──────────────────────────────────────────────────────── -->
  <transition name="modal">
    <div v-if="confirmDelete" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="confirmDelete = false"></div>
      <div class="relative card w-full max-w-sm p-7 shadow-2xl z-10">
        <h3 class="text-base font-bold mb-2" style="color: var(--text-base)">Delete Conversation?</h3>
        <p class="text-sm text-surface-400 mb-5">All messages will be permanently deleted.</p>
        <div class="flex gap-3">
          <button @click="doDelete" :disabled="deleting" class="btn-danger flex-1 justify-center">
            <svg v-if="deleting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            {{ deleting ? 'Deleting…' : 'Yes, Delete' }}
          </button>
          <button @click="confirmDelete = false" class="btn-ghost">Cancel</button>
        </div>
      </div>
    </div>
  </transition>

  <!-- ── Toast ──────────────────────────────────────────────────────────────── -->
  <transition name="toast">
    <div v-if="toast" :class="['fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium',
      toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600']">
      {{ toast.msg }}
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import Navbar  from '@/components/Navbar.vue'
import http    from '@/services/api.js'

const route  = useRoute()
const router = useRouter()

// ── Inline UserChip ───────────────────────────────────────────────────────────
const UserChip = {
  props: ['user', 'online', 'avatarColor'],
  template: `
    <div class="flex items-center gap-2 shrink-0">
      <div class="relative">
        <div class="w-8 h-8 rounded-xl overflow-hidden border border-surface-600 flex items-center justify-center text-xs font-bold text-black"
          :style="{ background: avatarColor(user?.name) }">
          <img v-if="user?.avatar" :src="user.avatar" class="w-full h-full object-cover" />
          <span v-else>{{ user?.name?.[0] }}</span>
        </div>
        <div v-if="online" class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2"
          style="border-color: var(--surface-900)"></div>
      </div>
      <div>
        <div class="text-xs font-semibold" style="color: var(--text-base)">{{ user?.name }}</div>
      </div>
    </div>
  `
}

// ── State ─────────────────────────────────────────────────────────────────────
const conversations  = ref([])
const selectedConv   = ref(null)
const messages       = ref([])
const loading        = ref(false)
const msgLoading     = ref(false)
const search         = ref('')
const confirmDelete  = ref(false)
const deleting       = ref(false)
const toast          = ref(null)
const messagesEl     = ref(null)
const onlineUserIds  = ref([])
const filterUserId   = ref(null)
const filterUserName = ref('')
const lightbox       = ref(null) // ← image lightbox URL

let searchTimer  = null
let refreshTimer = null
let ws           = null

// ── Computed ──────────────────────────────────────────────────────────────────
const onlineCount = computed(() => onlineUserIds.value.length)

const filteredConversations = computed(() => {
  let list = conversations.value
  if (filterUserId.value) {
    list = list.filter(c =>
      c.user1_id === filterUserId.value ||
      c.user2_id === filterUserId.value
    )
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(c => {
      const names = [c.user1?.name, c.user2?.name]
        .filter(Boolean).join(' ').toLowerCase()
      return names.includes(q)
    })
  }
  return list
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function isLeftSide(msg) {
  return msg.sender_id === selectedConv.value?.user1_id
}

// Open image lightbox
function openLightbox(url) {
  lightbox.value = url
}

const COLORS = ['#f59e0b','#6366f1','#10b981','#ec4899','#3b82f6','#8b5cf6']
const avatarColor = name => COLORS[(name?.charCodeAt(0) || 0) % COLORS.length]
const isOnline    = id   => id && onlineUserIds.value.includes(id)

function showToast(msg, type = 'success') {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 3000)
}

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts), now = new Date(), diff = now - d
  if (diff < 60000)    return 'just now'
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}
function formatMsgTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
}
function formatDateSep(ts) {
  if (!ts) return ''
  const d = new Date(ts), today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString())     return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })
}
function showDateSep(idx) {
  if (idx === 0) return true
  return new Date(messages.value[idx - 1].CreatedAt).toDateString() !==
         new Date(messages.value[idx].CreatedAt).toDateString()
}

async function scrollToBottom() {
  await nextTick()
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}

// ── Load conversations ────────────────────────────────────────────────────────
async function loadAll() {
  loading.value = true
  try {
    const params = { limit: 100 }
    if (filterUserId.value)  params.user_id = filterUserId.value
    if (search.value.trim()) params.search  = search.value.trim()
    const { data } = await http.get('/admin/direct-conversations', { params })
    conversations.value = data?.data ?? []
  } catch { /* silent */ }
  finally { loading.value = false }
}

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(loadAll, 300)
}

function clearUserFilter() {
  filterUserId.value   = null
  filterUserName.value = ''
  router.replace({ path: '/chat' })
  loadAll()
}

// ── Open conversation ─────────────────────────────────────────────────────────
async function openConversation(conv) {
  selectedConv.value = conv
  messages.value     = []
  msgLoading.value   = true
  try {
    const { data } = await http.get(`/admin/direct-conversations/${conv.ID}/messages`)
    messages.value = data.messages ?? []
    await scrollToBottom()
  } catch { messages.value = [] }
  finally { msgLoading.value = false }
}

// ── Refresh messages ──────────────────────────────────────────────────────────
async function refreshMessages() {
  if (!selectedConv.value) return
  try {
    const { data } = await http.get(`/admin/direct-conversations/${selectedConv.value.ID}/messages`)
    const fresh = data.messages ?? []
    if (fresh.length !== messages.value.length) {
      messages.value = fresh
      await scrollToBottom()
    }
  } catch { /* silent */ }
}

// ── Online users ──────────────────────────────────────────────────────────────
async function refreshOnline() {
  try {
    const { data } = await http.get('/admin/online-users')
    onlineUserIds.value = data.online_user_ids ?? []
  } catch { /* silent */ }
}

// ── WebSocket ─────────────────────────────────────────────────────────────────
function connectWS() {
  const token = localStorage.getItem('mp_token')
  if (!token) return

  const base = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api')
    .replace(/\/api\/?$/, '')
    .replace('https://', 'wss://')
    .replace('http://',  'ws://')

  ws = new WebSocket(`${base}/ws?token=${token}`)
  ws.onopen = () => console.log('[WS Admin] Connected ✅')

  ws.onmessage = async (e) => {
    try {
      const msg = JSON.parse(e.data)
      if (msg.type === 'direct_message') {
        // Update last_message preview in conversation list
        const conv = conversations.value.find(c => c.ID === msg.conversation_id)
        if (conv) {
          conv.last_message    = msg.image_url && !msg.content ? '📷 Image' : msg.content
          conv.last_message_at = msg.created_at
        }
        // Append to open conversation
        if (selectedConv.value?.ID === msg.conversation_id) {
          if (!messages.value.find(m => m.ID === msg.id)) {
            messages.value.push({
              ID:        msg.id,
              sender_id: msg.sender_id,
              content:   msg.content,
              image_url: msg.image_url,  // ← include image_url
              is_read:   false,
              CreatedAt: msg.created_at,
            })
            await scrollToBottom()
          }
        }
      }
    } catch { /* silent */ }
  }

  ws.onclose = () => {
    console.log('[WS Admin] Disconnected — reconnecting…')
    setTimeout(connectWS, 3000)
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
async function doDelete() {
  deleting.value = true
  try {
    await http.delete(`/admin/direct-conversations/${selectedConv.value.ID}`)
    conversations.value = conversations.value.filter(c => c.ID !== selectedConv.value.ID)
    selectedConv.value  = null
    messages.value      = []
    confirmDelete.value = false
    showToast('Conversation deleted')
  } catch {
    showToast('Failed to delete', 'error')
  } finally {
    deleting.value = false
  }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  if (route.query.user_id) {
    filterUserId.value   = Number(route.query.user_id)
    filterUserName.value = decodeURIComponent(route.query.name || '') || `User #${route.query.user_id}`
  }
  await loadAll()
  await refreshOnline()
  connectWS()
  refreshTimer = setInterval(() => {
    refreshMessages()
    refreshOnline()
  }, 5000)
})

onUnmounted(() => {
  clearInterval(refreshTimer)
  clearTimeout(searchTimer)
  ws?.close()
})

watch(selectedConv, scrollToBottom)
</script>