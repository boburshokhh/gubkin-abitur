import { toRaw } from 'vue'

const PHOTO_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/webp'
])

const PHOTO_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.jfif']

const PHOTO_COMPRESS_MAX_SIDE = 1920
const PHOTO_COMPRESS_QUALITY = 0.82
const LARGE_FILE_BYTES = 1024 * 1024
const READ_RETRY_DELAYS_MS = [200, 400, 700, 1200]

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function extractUploadBlob(file) {
  const raw = toRaw(file?.raw ?? file)
  if (raw instanceof Blob) return raw
  return null
}

export function isUploadableBlob(file) {
  const blob = extractUploadBlob(file)
  return Boolean(blob && blob.size > 0)
}

export function getBlobExtension(blob) {
  const name = blob?.name?.toLowerCase() || ''
  const match = PHOTO_EXTENSIONS.find((ext) => name.endsWith(ext))
  return match ? match.slice(1) : ''
}

export function inferMimeFromExtension(blob) {
  const ext = getBlobExtension(blob)
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'jpg' || ext === 'jpeg' || ext === 'jfif') return 'image/jpeg'
  return ''
}

export function normalizePhotoMimeType(blob) {
  const type = (blob?.type || '').toLowerCase()
  if (type === 'image/jpg' || type === 'image/pjpeg') return 'image/jpeg'
  if (PHOTO_MIME_TYPES.has(type)) return type === 'image/jpg' ? 'image/jpeg' : type
  return inferMimeFromExtension(blob) || type
}

export function isAcceptedPhotoFile(file) {
  const blob = extractUploadBlob(file)
  if (!blob || !blob.size) return false

  const type = normalizePhotoMimeType(blob)
  if (type && PHOTO_MIME_TYPES.has(type)) return true

  const name = blob.name?.toLowerCase() || ''
  return PHOTO_EXTENSIONS.some((ext) => name.endsWith(ext))
}

export function isImageBlob(blob) {
  if (!blob) return false
  if (blob.type?.startsWith('image/')) return true
  const name = blob.name?.toLowerCase() || ''
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.jfif'].some((ext) => name.endsWith(ext))
}

function isLikelyCameraPhoto(blob) {
  if (!blob) return false
  if (blob.size >= LARGE_FILE_BYTES) return true
  const name = blob.name?.toLowerCase() || ''
  return /^(img_|dsc|photo|camera|picsart|snap)/.test(name) || !getBlobExtension(blob)
}

async function readBlobBufferOnce(blob) {
  try {
    const buffer = await blob.arrayBuffer()
    if (buffer && buffer.byteLength > 0) {
      return buffer
    }
    if (buffer && buffer.byteLength === 0) {
      const err = new Error('Empty buffer')
      err.name = 'EmptyBufferError'
      throw err
    }
  } catch (err) {
    if (err.name === 'SecurityError' || err.name === 'NotReadableError' || err.name === 'EmptyBufferError') {
      throw err
    }
    // Android иногда отдаёт файл только через FileReader
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const res = reader.result
      if (res && res.byteLength > 0) {
        resolve(res)
      } else {
        const err = new Error('Empty file')
        err.name = 'EmptyBufferError'
        reject(err)
      }
    }
    reader.onerror = () => {
      reject(reader.error || new Error('FileReader failed'))
    }
    reader.readAsArrayBuffer(blob)
  })
}

async function readBlobBuffer(blob, { retryForCamera = false } = {}) {
  const delays = retryForCamera || isLikelyCameraPhoto(blob)
    ? READ_RETRY_DELAYS_MS
    : [0]

  let lastError = null
  for (const delayMs of delays) {
    if (delayMs > 0) {
      await sleep(delayMs)
    }
    try {
      const buffer = await readBlobBufferOnce(blob)
      if (buffer) return buffer
    } catch (err) {
      lastError = err
      if (err.name === 'SecurityError' || err.name === 'NotReadableError') {
        // Логгируем для отладки, но продолжаем попытки в случае задержки синхронизации ОС
        console.warn('Read attempt failed with security/permission error:', err.name)
      }
    }
  }

  if (lastError) {
    throw lastError
  }
  return null
}

export async function materializeUploadFile(file, { retryForCamera = false } = {}) {
  const blob = extractUploadBlob(file)
  if (!blob) {
    throw new Error('Не удалось прочитать файл. Выберите его снова.')
  }

  const name = blob.name || 'upload'
  const type = blob.type || inferMimeFromExtension(blob) || 'application/octet-stream'
  const shouldRetry = retryForCamera || isLikelyCameraPhoto(blob)

  try {
    const buffer = await readBlobBuffer(blob, { retryForCamera: shouldRetry })
    if (!buffer) {
      throw new Error('Файл пустой или недоступен.')
    }
    return new File([buffer], name, { type })
  } catch (err) {
    console.error('Materialization of file failed:', err)
    
    if (shouldRetry || isLikelyCameraPhoto(blob) || err.name === 'SecurityError' || err.name === 'NotReadableError') {
      throw new Error(
        'Не удалось получить доступ к фото на Android из-за ограничений разрешений системы. Пожалуйста, сделайте снимок через стандартную Камеру телефона, а затем выберите готовый файл из Галереи (папка Недавние или Альбомы).'
      )
    }
    
    throw new Error(err.message || 'Файл пустой или недоступен. Выберите файл снова.')
  }
}

export function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Не удалось создать превью изображения.'))
    reader.readAsDataURL(blob)
  })
}

function buildJpegFileName(fileName) {
  const base = String(fileName || 'photo').replace(/\.[^.]+$/, '') || 'photo'
  return `${base}.jpg`
}

function canvasToJpegBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Не удалось сжать изображение.'))),
      'image/jpeg',
      quality
    )
  })
}

async function loadDrawableSource(blob) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(blob)
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => bitmap.close?.()
      }
    } catch {
      // На Android createImageBitmap часто падает на больших фото с камеры
    }
  }

  const url = URL.createObjectURL(blob)
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Не удалось декодировать изображение.'))
      img.src = url
    })
    return {
      source: image,
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
      cleanup: () => URL.revokeObjectURL(url)
    }
  } catch (error) {
    URL.revokeObjectURL(url)
    throw error
  }
}

async function compressDrawableToJpeg(drawable, { maxSide, quality }) {
  const scale = Math.min(1, maxSide / Math.max(drawable.width, drawable.height, 1))
  const width = Math.max(1, Math.round(drawable.width * scale))
  const height = Math.max(1, Math.round(drawable.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas недоступен')

  ctx.drawImage(drawable.source, 0, 0, width, height)
  return canvasToJpegBlob(canvas, quality)
}

export function isPreparedPhotoFile(file) {
  if (!(file instanceof File) || !file.size) return false
  if (file.type !== 'image/jpeg') return false
  return file.size <= 3 * LARGE_FILE_BYTES
}

export async function compressPhotoForUpload(file, {
  maxSide = PHOTO_COMPRESS_MAX_SIDE,
  quality = PHOTO_COMPRESS_QUALITY
} = {}) {
  if (isPreparedPhotoFile(file)) return file

  const materialized = file instanceof File && file.size > 0
    ? file
    : await materializeUploadFile(file, { retryForCamera: true })

  if (typeof document === 'undefined') return materialized

  const delays = isLikelyCameraPhoto(materialized) ? READ_RETRY_DELAYS_MS : [0]

  for (const delayMs of delays) {
    if (delayMs > 0) await sleep(delayMs)

    let drawable = null
    try {
      drawable = await loadDrawableSource(materialized)
      const jpegBlob = await compressDrawableToJpeg(drawable, { maxSide, quality })
      return new File([jpegBlob], buildJpegFileName(materialized.name), { type: 'image/jpeg' })
    } catch {
      // Повторяем — на Android фото с камеры часто готово только со 2–3 попытки
    } finally {
      drawable?.cleanup?.()
    }
  }

  return materialized
}

export async function preparePhotoFile(source) {
  const materialized = await materializeUploadFile(source, { retryForCamera: true })
  return compressPhotoForUpload(materialized)
}

export async function resolveUploadFile(file, label = 'файл', { forceMaterialize = true } = {}) {
  const blob = extractUploadBlob(file)
  if (!blob) {
    const error = new Error(`«${label}»: не удалось подготовить файл. Выберите файл снова.`)
    error.code = 'UPLOAD_FILE_INVALID'
    throw error
  }

  if (!forceMaterialize && blob instanceof File && blob.size > 0) return blob

  const name = blob.name || 'upload'
  const type = blob.type || inferMimeFromExtension(blob) || 'application/octet-stream'
  const buffer = await readBlobBuffer(blob, { retryForCamera: isLikelyCameraPhoto(blob) })

  if (!buffer) {
    const error = new Error(`«${label}»: файл недоступен на устройстве. Выберите фото снова и повторите отправку.`)
    error.code = 'UPLOAD_FILE_INVALID'
    throw error
  }

  return new File([buffer], name, { type })
}
