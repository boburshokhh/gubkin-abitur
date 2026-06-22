function hasCyrillic(value) {
  return /[а-яА-ЯёЁ]/.test(value);
}

function looksLikeMojibake(value) {
  return /[ÐÑÃÂ]/.test(value);
}

function decodeUploadedFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') return fileName;

  if (hasCyrillic(fileName) && !looksLikeMojibake(fileName)) {
    return fileName;
  }

  if (!looksLikeMojibake(fileName)) {
    return fileName;
  }

  const decoded = Buffer.from(fileName, 'latin1').toString('utf8');
  if (decoded.includes('\uFFFD')) return fileName;
  if (hasCyrillic(decoded) || /^[\x20-\x7E._\-()]+$/.test(decoded)) return decoded;

  return fileName;
}

function inferExtensionFromMime(mimeType) {
  const type = String(mimeType || '').toLowerCase();
  const map = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/pjpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/heic': 'heic',
    'image/heif': 'heif',
    'application/pdf': 'pdf'
  };
  return map[type] || '';
}

function getFileExtension(fileName, mimeType) {
  const decodedName = decodeUploadedFileName(fileName);
  const parts = decodedName.split('.');
  const ext = parts.length > 1 ? parts.pop() : '';
  if (ext) return ext;
  return inferExtensionFromMime(mimeType);
}

function decodeFileRecord(record = {}) {
  if (!record || typeof record !== 'object') return record;

  return {
    ...record,
    file_name: decodeUploadedFileName(record.file_name),
    name: record.name ? decodeUploadedFileName(record.name) : record.name
  };
}

function decodeApplicationFileNames(details = {}) {
  return {
    ...details,
    documents: (details.documents || []).map(decodeFileRecord),
    application_files: (details.application_files || []).map(decodeFileRecord),
    olympiad_certificates: (details.olympiad_certificates || []).map(decodeFileRecord)
  };
}

module.exports = {
  decodeUploadedFileName,
  inferExtensionFromMime,
  getFileExtension,
  decodeFileRecord,
  decodeApplicationFileNames
};
