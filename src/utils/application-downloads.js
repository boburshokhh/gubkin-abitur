import JSZip from 'jszip'
import { decodeFileName } from './file-name'

const invalidFileNameChars = /[<>:"/\\|?*\u0000-\u001F]/g
const whitespaceChars = /\s+/g

const fileCategoryNames = {
  passport_scan: 'паспорт',
  passportScan: 'паспорт',
  passport_translation: 'перевод_паспорта',
  passportTranslation: 'перевод_паспорта',
  photo: '3_4_фото',
  photoFile: '3_4_фото',
  education_scan: 'документ_об_образовании',
  educationScan: 'документ_об_образовании',
  general: 'файл'
}

export function sanitizeFileNamePart(value, fallback = 'файл') {
  const sanitized = String(value || '')
    .trim()
    .replace(invalidFileNameChars, '_')
    .replace(whitespaceChars, '_')
    .replace(/_+/g, '_')
    .replace(/^[._-]+|[._-]+$/g, '')

  return sanitized || fallback
}

export function getApplicantFilePrefix({ application, applicant } = {}) {
  const fullName = [
    application?.last_name || applicant?.last_name,
    application?.first_name || applicant?.first_name,
    application?.middle_name || applicant?.middle_name
  ].filter(Boolean).join(' ')

  return sanitizeFileNamePart(fullName, 'Абитуриент')
}

export function getArchiveFileName({ application, applicant } = {}) {
  return `${getApplicantFilePrefix({ application, applicant })}.zip`
}

export function getExtensionFromFileName(fileName = '') {
  const cleanName = String(fileName).split(/[\\/]/).pop() || ''
  const lastDotIndex = cleanName.lastIndexOf('.')

  if (lastDotIndex <= 0 || lastDotIndex === cleanName.length - 1) return ''
  return cleanName.substring(lastDotIndex)
}

export function getApplicationFileLabel(file = {}) {
  return fileCategoryNames[file.file_category] || file.file_name || 'файл'
}

export function getDocumentFileLabel(document = {}) {
  return document.document_type?.name
    || document.document_types?.name
    || document.title
    || document.file_name
    || 'документ'
}

export function getOlympiadCertificateLabel(certificate = {}) {
  return certificate.name || 'сертификат_олимпиады'
}

export function getDownloadFileName({ prefix, label, originalFileName }) {
  const safePrefix = sanitizeFileNamePart(prefix, 'Абитуриент')
  const extension = getExtensionFromFileName(decodeFileName(originalFileName))
  const rawLabel = String(label || '')
  const labelExtension = getExtensionFromFileName(rawLabel)
  const labelWithoutExtension = labelExtension ? rawLabel.slice(0, -labelExtension.length) : rawLabel
  const safeLabel = sanitizeFileNamePart(labelWithoutExtension, 'файл')

  return `${safePrefix}_${safeLabel}${extension}`
}

export function getUniqueFileName(fileName, usedNames) {
  const names = usedNames || new Set()
  const extension = getExtensionFromFileName(fileName)
  const baseName = extension ? fileName.slice(0, -extension.length) : fileName
  let nextName = fileName
  let index = 2

  while (names.has(nextName)) {
    nextName = `${baseName}_${index}${extension}`
    index += 1
  }

  names.add(nextName)
  return nextName
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function createZipBlob(files) {
  const zip = new JSZip()

  files.forEach(file => {
    zip.file(file.fileName, file.blob)
  })

  return zip.generateAsync({ type: 'blob' })
}
