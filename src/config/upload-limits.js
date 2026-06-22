import { extractUploadBlob } from '@/utils/upload-file'

/** Лимиты загрузки файлов заявления (синхронизировать с backend/src/config/upload-limits.js) */
const MB = 1024 * 1024;

export const MAX_APPLICATION_FILE_BYTES = 50 * MB;
export const MAX_APPLICATION_SUBMIT_TOTAL_BYTES = 400 * MB;
export const MAX_APPLICATION_FILE_MB = 50;
export const MAX_APPLICATION_SUBMIT_TOTAL_MB = 400;

export function formatFileSize(bytes) {
  if (!bytes || bytes < 0) return '0 Б';
  if (bytes < MB) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / MB).toFixed(1)} МБ`;
}

export function getTotalFilesSize(files = {}) {
  return Object.values(files).reduce((sum, file) => {
    const blob = extractUploadBlob(file)
    return sum + (blob?.size || 0)
  }, 0);
}

export function validateApplicationFiles(files = {}) {
  const entries = Object.entries(files).filter(([, file]) => Boolean(file));

  for (const [field, file] of entries) {
    const blob = extractUploadBlob(file)
    if (!blob || !blob.size) {
      return {
        isValid: false,
        error: `Файл «${field}» не выбран или пустой. Загрузите его снова перед отправкой.`
      };
    }

    if (blob.size > MAX_APPLICATION_FILE_BYTES) {
      return {
        isValid: false,
        error: `Файл «${field}» (${formatFileSize(blob.size)}) превышает лимит ${MAX_APPLICATION_FILE_MB} МБ на один файл.`
      };
    }
  }

  const totalSize = getTotalFilesSize(files);
  if (totalSize > MAX_APPLICATION_SUBMIT_TOTAL_BYTES) {
    return {
      isValid: false,
      error: `Суммарный размер всех файлов (${formatFileSize(totalSize)}) превышает лимит ${MAX_APPLICATION_SUBMIT_TOTAL_MB} МБ.`
    };
  }

  return { isValid: true, totalSize };
}
