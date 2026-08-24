const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function normalizeRoomCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function generateRoomCode(length = 5, random = Math.random) {
  if (!Number.isInteger(length) || length < 4 || length > 8) {
    throw new Error('Room code length must be between 4 and 8 characters.');
  }

  let code = '';
  for (let index = 0; index < length; index += 1) {
    code += ROOM_CODE_ALPHABET[Math.floor(random() * ROOM_CODE_ALPHABET.length)];
  }
  return code;
}
