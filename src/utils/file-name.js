function hasCyrillic(value) {
  return /[а-яА-ЯёЁ]/.test(value);
}

function looksLikeMojibake(value) {
  return /[ÐÑÃÂ]/.test(value);
}

export function decodeFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') return fileName;

  if (hasCyrillic(fileName) && !looksLikeMojibake(fileName)) {
    return fileName;
  }

  if (!looksLikeMojibake(fileName)) {
    return fileName;
  }

  try {
    const bytes = Uint8Array.from(fileName, char => char.charCodeAt(0) & 0xff);
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);

    if (decoded.includes('\uFFFD')) return fileName;
    if (hasCyrillic(decoded) || /^[\x20-\x7E._\-()]+$/.test(decoded)) return decoded;
  } catch {
    return fileName;
  }

  return fileName;
}
