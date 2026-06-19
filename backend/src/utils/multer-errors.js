const {
  MAX_APPLICATION_FILE_MB,
  MAX_APPLICATION_SUBMIT_TOTAL_MB,
  MAX_APPLICATION_SUBMIT_FILES
} = require('../config/upload-limits');

function formatMulterError(err) {
  if (!err) return 'Ошибка загрузки файлов';

  if (err.code === 'LIMIT_FILE_SIZE') {
    return `Один из файлов превышает лимит ${MAX_APPLICATION_FILE_MB} МБ. Уменьшите размер файлов и попробуйте снова.`;
  }

  if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
    return `Можно загрузить не более ${MAX_APPLICATION_SUBMIT_FILES} файлов за один раз.`;
  }

  if (err.code === 'LIMIT_FIELD_KEY' || err.code === 'LIMIT_FIELD_VALUE' || err.code === 'LIMIT_FIELD_COUNT') {
    return 'Слишком большой объём данных формы. Попробуйте снова или обратитесь в поддержку.';
  }

  if (err.message?.includes('Multipart')) {
    return `Не удалось принять файлы. Суммарный размер не должен превышать ${MAX_APPLICATION_SUBMIT_TOTAL_MB} МБ.`;
  }

  return err.message || 'Ошибка загрузки файлов';
}

module.exports = { formatMulterError };
