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

export function isImageBlob(blob) {
  if (!blob) return false
  if (blob.type?.startsWith('image/')) return true
  const name = blob.name?.toLowerCase() || ''
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].some((ext) => name.endsWith(ext))
}

export async function materializeUploadFile(file) {
  const blob = extractUploadBlob(file)
  if (!blob) {
    throw new Error('Не удалось прочитать файл. Выберите его снова.')
  }

  const name = blob.name || 'upload'
  const type = blob.type || 'application/octet-stream'

  let buffer
  try {
    buffer = await blob.arrayBuffer()
  } catch {
    buffer = null
  }

  if (!buffer?.byteLength) {
    throw new Error('Файл пустой или недоступен. Выберите файл снова на устройстве.')
  }

  return new File([buffer], name, { type })
}

export function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Не удалось создать превью изображения.'))
    reader.readAsDataURL(blob)
  })
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
