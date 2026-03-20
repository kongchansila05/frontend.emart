import { ref, reactive, computed } from 'vue'

/**
 * usePagination — reusable pagination composable
 *
 * @param {Function} fetchFn        - async (params) => axios response with { data: [], meta: {} }
 * @param {Object}   options
 * @param {number}   options.defaultLimit - items per page (default 10)
 *
 * Usage:
 *   const { rows, meta, loading, pageNumbers, load, goToPage, search, onSearch, setFilter } =
 *     usePagination((params) => categoriesApi.list(params))
 *
 *   // pass extra filters (status, limit, etc.)
 *   setFilter('is_active', true)
 *   setFilter('limit', 25)
 */
export function usePagination(fetchFn, { defaultLimit = 10 } = {}) {
  const rows        = ref([])
  const loading     = ref(false)
  const search      = ref('')
  const extraParams = reactive({})   // holds any additional filters e.g. { is_active: true }

  const meta = reactive({
    page:        1,
    limit:       defaultLimit,
    total_items: 0,
    total_pages: 1,
    has_next:    false,
    has_prev:    false,
  })

  // ── Fetch ──────────────────────────────────────────────────────────────────
  async function load(page = meta.page) {
    loading.value = true
    try {
      const { data } = await fetchFn({
        page,
        limit:  meta.limit,
        search: search.value || undefined,
        ...extraParams,             // spread any extra filters
      })

      rows.value       = data.data          ?? []
      meta.page        = data.meta?.page        ?? page
      meta.limit       = data.meta?.limit       ?? defaultLimit
      meta.total_items = data.meta?.total_items ?? 0
      meta.total_pages = data.meta?.total_pages ?? 1
      meta.has_next    = data.meta?.has_next    ?? false
      meta.has_prev    = data.meta?.has_prev    ?? false
    } finally {
      loading.value = false
    }
  }

  function goToPage(page) {
    if (page < 1 || page > meta.total_pages) return
    load(page)
  }

  // ── Set a filter value then reload from page 1 ─────────────────────────────
  function setFilter(key, value) {
    if (value === '' || value === null || value === undefined) {
      delete extraParams[key]
    } else {
      extraParams[key] = value
    }
    load(1)
  }

  // ── Change limit then reload from page 1 ──────────────────────────────────
  function setLimit(value) {
    meta.limit = Number(value)
    load(1)
  }

  // ── Search (debounced) ─────────────────────────────────────────────────────
  let searchTimer = null
  function onSearch() {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => load(1), 350)
  }

  // ── Page numbers with ellipsis ─────────────────────────────────────────────
  const pageNumbers = computed(() => {
    const total = meta.total_pages
    const cur   = meta.page
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

    if (cur <= 4)         return [1, 2, 3, 4, 5, '...', total]
    if (cur >= total - 3) return [1, '...', total-4, total-3, total-2, total-1, total]
    return [1, '...', cur - 1, cur, cur + 1, '...', total]
  })

  return {
    rows,
    meta,
    loading,
    search,
    pageNumbers,
    load,
    goToPage,
    onSearch,
    setFilter,
    setLimit,
  }
}