// Moderation & Word Sanitization Engine

const BLOCKED_WORDS = new Set([
  // Core slurs, hate speech, and destructive terms
  'nigger', 'nigga', 'faggot', 'kike', 'chink', 'spic', 'retard',
  'hitler', 'nazi', 'pedophile', 'pedo', 'childporn', 'cp',
]);

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  cleanedWord?: string;
}

export function validateWordInput(
  rawInput: string,
  modifierType: string
): ValidationResult {
  if (modifierType === 'period') {
    return { isValid: true, cleanedWord: '.' };
  }

  if (!rawInput || typeof rawInput !== 'string') {
    return { isValid: false, error: 'Word cannot be empty.' };
  }

  const trimmed = rawInput.trim();

  // Ensure it's strictly ONE word (no spaces inside)
  if (/\s+/.test(trimmed)) {
    return { isValid: false, error: 'Strictly ONE word allowed per transaction.' };
  }

  // Length constraint: max 28 characters
  if (trimmed.length > 28) {
    return { isValid: false, error: 'Word exceeds the 28-character limit.' };
  }

  // Ensure word contains at least one letter, number, or Unicode emoji
  const hasValidCharacter = /[\p{L}\p{N}\p{Extended_Pictographic}]/u.test(trimmed);
  if (!hasValidCharacter) {
    return { isValid: false, error: 'Word must contain letters, numbers, or emojis.' };
  }

  // Clean and check against blocked list
  const normalized = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normalized && BLOCKED_WORDS.has(normalized)) {
    return { isValid: false, error: 'This word violates community guidelines.' };
  }

  // Escape HTML characters for safety
  const safeWord = trimmed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  return { isValid: true, cleanedWord: safeWord };
}

export function sanitizeHandle(rawHandle: string): string {
  if (!rawHandle) return 'anonymous';
  // Strip leading @, keep alphanumeric and underscores, max 15 chars (X username rules)
  let clean = rawHandle.trim().replace(/^@/, '').replace(/[^a-zA-Z0-9_]/g, '');
  if (!clean) clean = 'anonymous';
  return clean.slice(0, 15);
}
