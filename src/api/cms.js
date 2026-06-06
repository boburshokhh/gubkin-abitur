import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: API_BASE })

function getToken() {
  try {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token') || ''
  } catch {
    return ''
  }
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ---- Public ----

export async function fetchCmsPage(slug) {
  const res = await api.get(`/cms/pages/${slug}`)
  return res.data.data
}

export async function fetchPublicNews({ limit = 10, offset = 0 } = {}) {
  const res = await api.get('/cms/news', { params: { limit, offset } })
  return res.data
}

export async function fetchPublicNewsItem(slug) {
  const res = await api.get(`/cms/news/${slug}`)
  return res.data.data
}

export async function fetchContacts() {
  const res = await api.get('/cms/contacts')
  return res.data.data
}

// ---- Admin: pages/sections ----

export async function adminListPages() {
  const res = await api.get('/admin/cms/pages', { headers: authHeaders() })
  return res.data.data
}

export async function adminGetSections(slug) {
  const res = await api.get(`/admin/cms/pages/${slug}/sections`, { headers: authHeaders() })
  return res.data.data
}

export async function adminCreateSection(slug, payload) {
  const res = await api.post(`/admin/cms/pages/${slug}/sections`, payload, { headers: authHeaders() })
  return res.data.data
}

export async function adminUpdateSection(id, payload) {
  const res = await api.put(`/admin/cms/sections/${id}`, payload, { headers: authHeaders() })
  return res.data.data
}

export async function adminDeleteSection(id) {
  await api.delete(`/admin/cms/sections/${id}`, { headers: authHeaders() })
}

export async function adminReorderSections(items) {
  await api.post('/admin/cms/sections/reorder', { items }, { headers: authHeaders() })
}

// ---- Admin: news ----

export async function adminListNews({ limit = 20, offset = 0 } = {}) {
  const res = await api.get('/admin/cms/news', { headers: authHeaders(), params: { limit, offset } })
  return res.data
}

export async function adminGetNews(id) {
  const res = await api.get(`/admin/cms/news/${id}`, { headers: authHeaders() })
  return res.data.data
}

export async function adminCreateNews(payload) {
  const res = await api.post('/admin/cms/news', payload, { headers: authHeaders() })
  return res.data.data
}

export async function adminUpdateNews(id, payload) {
  const res = await api.put(`/admin/cms/news/${id}`, payload, { headers: authHeaders() })
  return res.data.data
}

export async function adminDeleteNews(id) {
  await api.delete(`/admin/cms/news/${id}`, { headers: authHeaders() })
}

// ---- Admin: site settings ----

export async function adminGetSettings() {
  const res = await api.get('/admin/cms/settings', { headers: authHeaders() })
  return res.data.data
}

export async function adminUpdateSetting(category, key, value, label) {
  const res = await api.put('/admin/cms/settings', { category, key, value, label }, { headers: authHeaders() })
  return res.data.data
}

// ---- Admin: assets ----

export async function adminListAssets({ limit = 20, offset = 0 } = {}) {
  const res = await api.get('/admin/cms/assets', { headers: authHeaders(), params: { limit, offset } })
  return res.data
}

export async function adminUploadAsset(file, altText = '') {
  const form = new FormData()
  form.append('file', file)
  if (altText) form.append('alt_text', altText)
  const res = await api.post('/admin/cms/assets', form, {
    headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' }
  })
  return res.data.data
}

export async function adminDeleteAsset(id) {
  await api.delete(`/admin/cms/assets/${id}`, { headers: authHeaders() })
}

// ---- Helpers ----

export function getSectionByType(sections, type) {
  return sections?.find(s => s.type === type) || null
}

export function getSectionByAnchor(sections, anchor) {
  return sections?.find(s => s.anchor === anchor) || null
}
