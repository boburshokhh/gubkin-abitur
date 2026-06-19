/** Лимиты загрузки файлов заявления (синхронизировать с src/config/upload-limits.js) */
const MB = 1024 * 1024;

const MAX_APPLICATION_FILE_BYTES = 50 * MB;
const MAX_APPLICATION_SUBMIT_TOTAL_BYTES = 400 * MB;
const MAX_APPLICATION_SUBMIT_FILES = 5;
/** Запас поверх суммарного лимита для multipart-накладных расходов */
const RECOMMENDED_NGINX_BODY_BYTES = 420 * MB;

module.exports = {
  MB,
  MAX_APPLICATION_FILE_BYTES,
  MAX_APPLICATION_SUBMIT_TOTAL_BYTES,
  MAX_APPLICATION_SUBMIT_FILES,
  RECOMMENDED_NGINX_BODY_BYTES,
  MAX_APPLICATION_FILE_MB: 50,
  MAX_APPLICATION_SUBMIT_TOTAL_MB: 400,
};
