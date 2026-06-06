import { apiClient } from '@/api/app-api'

// ---- Public ----

export async function fetchCmsPage(slug) {
  const res = await apiClient.get(`/cms/pages/${slug}`)
  return res.data.data
}

export async function fetchPublicNews({ limit = 10, offset = 0 } = {}) {
  const res = await apiClient.get('/cms/news', { params: { limit, offset } })
  return res.data
}

export async function fetchPublicNewsItem(slug) {
  const res = await apiClient.get(`/cms/news/${slug}`)
  return res.data.data
}

export async function fetchContacts() {
  const res = await apiClient.get('/cms/contacts')
  return res.data.data
}

export async function fetchAdmissionStatus() {
  const res = await apiClient.get('/cms/admission-status')
  return res.data.data
}

export async function fetchRegistrationStatus() {
  const res = await apiClient.get('/cms/registration-status')
  return res.data.data
}

// ---- Admin: pages/sections ----

export async function adminListPages() {
  const res = await apiClient.get('/admin/cms/pages')
  return res.data.data
}

export async function adminGetSections(slug) {
  const res = await apiClient.get(`/admin/cms/pages/${slug}/sections`)
  return res.data.data
}

export async function adminCreateSection(slug, payload) {
  const res = await apiClient.post(`/admin/cms/pages/${slug}/sections`, payload)
  return res.data.data
}

export async function adminUpdateSection(id, payload) {
  const res = await apiClient.put(`/admin/cms/sections/${id}`, payload)
  return res.data.data
}

export async function adminDeleteSection(id) {
  await apiClient.delete(`/admin/cms/sections/${id}`)
}

export async function adminReorderSections(items) {
  await apiClient.post('/admin/cms/sections/reorder', { items })
}

// ---- Admin: news ----

export async function adminListNews({ limit = 20, offset = 0 } = {}) {
  const res = await apiClient.get('/admin/cms/news', { params: { limit, offset } })
  return res.data
}

export async function adminGetNews(id) {
  const res = await apiClient.get(`/admin/cms/news/${id}`)
  return res.data.data
}

export async function adminCreateNews(payload) {
  const res = await apiClient.post('/admin/cms/news', payload)
  return res.data.data
}

export async function adminUpdateNews(id, payload) {
  const res = await apiClient.put(`/admin/cms/news/${id}`, payload)
  return res.data.data
}

export async function adminDeleteNews(id) {
  await apiClient.delete(`/admin/cms/news/${id}`)
}

// ---- Admin: site settings ----

export async function adminGetSettings() {
  const res = await apiClient.get('/admin/cms/settings')
  return res.data.data
}

export async function adminUpdateSetting(category, key, value, label) {
  const res = await apiClient.put('/admin/cms/settings', { category, key, value, label })
  return res.data.data
}

// ---- Admin: assets ----

export async function adminListAssets({ limit = 20, offset = 0 } = {}) {
  const res = await apiClient.get('/admin/cms/assets', { params: { limit, offset } })
  return res.data
}

export async function adminUploadAsset(file, altText = '') {
  const form = new FormData()
  form.append('file', file)
  if (altText) form.append('alt_text', altText)
  const res = await apiClient.post('/admin/cms/assets', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data.data
}

export async function adminDeleteAsset(id) {
  await apiClient.delete(`/admin/cms/assets/${id}`)
}

// ---- Helpers ----

export function getSectionByType(sections, type) {
  return sections?.find(s => s.type === type) || null
}

export function getSectionByAnchor(sections, anchor) {
  return sections?.find(s => s.anchor === anchor) || null
}
