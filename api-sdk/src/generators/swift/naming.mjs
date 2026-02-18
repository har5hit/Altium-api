export function toPascalCase(input) {
  const normalized = String(input)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim();

  return normalized
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

export function toCamelCase(input) {
  const pascal = toPascalCase(input);
  if (!pascal) return 'value';
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function toUpperSnakeCase(input) {
  return String(input)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

export function sanitizeSwiftIdentifier(name, fallback = 'value') {
  const cleaned = String(name).replace(/[^A-Za-z0-9_]/g, '');
  if (!cleaned) return fallback;

  const reserved = new Set([
    'class',
    'struct',
    'enum',
    'protocol',
    'func',
    'var',
    'let',
    'import',
    'switch',
    'case',
    'default',
    'if',
    'else',
    'for',
    'while',
    'return',
    'public',
    'private',
    'internal',
    'extension',
    'operator',
    'throw',
    'throws',
    'try',
    'catch',
  ]);

  if (reserved.has(cleaned)) return `_${cleaned}`;
  if (/^[0-9]/.test(cleaned)) return `_${cleaned}`;
  return cleaned;
}

export function extractRefName(ref) {
  if (!ref) return '';
  const parts = String(ref).split('/');
  return parts[parts.length - 1] || '';
}
