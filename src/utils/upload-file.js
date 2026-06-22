import { toRaw } from 'vue'

export function extractUploadBlob(file) {
  const raw = toRaw(file?.raw ?? file)
  if (raw instanceof Blob) return raw
  return null
}

export function isUploadableBlob(file) {
  const blob = extractUploadBlob(file)
  return Boolean(blob && blob.size > 0)
}

export async function resolveUploadFile(file, label = 'файл') {
  const blob = extractUploadBlob(file)
  if (!blob) {
    const error = new Error(`«${label}»: не удалось подготовить файл. Выберите файл снова.`)
    error.code = 'UPLOAD_FILE_INVALID'
    throw error
  }

  const name = blob.name || 'upload'
  const type = blob.type || 'application/octet-stream'

  if (blob instanceof File && blob.size > 0) return blob

  let buffer
  try {
    buffer = await blob.arrayBuffer()
  } catch {
    buffer = null
  }

  if (!buffer?.byteLength) {
    const error = new Error(`«${label}»: файл пустой или недоступен. Выберите файл снова на устройстве.`)
    error.code = 'UPLOAD_FILE_INVALID'
    throw error
  }

  return new File([buffer], name, { type })
}
