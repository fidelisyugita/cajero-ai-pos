const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /authorization/i,
  /bearer/i,
  /cvv/i,
  /cvc/i,
  /pin/i,
  /card_?number/i,
  /credit_?card/i,
  /account_?number/i,
  /qris_?raw/i,
  /private_?key/i,
];

const CARD_NUMBER_REGEX = /\b(?:\d[ -]?){13,19}\b/g;
const BEARER_TOKEN_REGEX = /Bearer\s+[a-z0-9-_=.]+/gi;
const JWT_TOKEN_REGEX = /eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g;

/**
 * Sanitizes a string by masking card numbers, bearer tokens, and JWT strings.
 */
export const sanitizeString = (value: string): string => {
  if (!value || typeof value !== "string") return value;

  return value
    .replace(JWT_TOKEN_REGEX, "[JWT_REDACTED]")
    .replace(BEARER_TOKEN_REGEX, "Bearer [REDACTED]")
    .replace(CARD_NUMBER_REGEX, (match) => {
      // Clean digits only
      const digits = match.replace(/\D/g, "");
      if (digits.length >= 13 && digits.length <= 19) {
        return `[CARD_REDACTED_...${digits.slice(-4)}]`;
      }
      return match;
    });
};

/**
 * Checks whether an object key name indicates sensitive data.
 */
export const isSensitiveKey = (key: string): boolean => {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
};

function sanitizeError(error: Error): Error {
  const sanitizedError = new Error(sanitizeString(error.message));
  sanitizedError.name = error.name;
  if (error.stack) {
    sanitizedError.stack = sanitizeString(error.stack);
  }
  return sanitizedError;
}

function sanitizeObject(
  record: Record<string, unknown>,
  seen: WeakSet<object>,
  depth: number,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    if (isSensitiveKey(key)) {
      result[key] = "[REDACTED]";
    } else {
      result[key] = sanitizeTelemetry(value, seen, depth + 1);
    }
  }

  return result;
}

/**
 * Deeply sanitizes any telemetry payload (object, array, primitive) before transmitting.
 */
export const sanitizeTelemetry = <T>(
  data: T,
  seen: WeakSet<object> = new WeakSet(),
  depth = 0,
): T => {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    return sanitizeString(data) as unknown as T;
  }

  if (typeof data !== "object") {
    return data;
  }

  // Prevent infinite loops on circular structures and cap recursion depth
  if (seen.has(data as object) || depth > 8) {
    return "[CIRCULAR/MAX_DEPTH]" as unknown as T;
  }

  seen.add(data as object);

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeTelemetry(item, seen, depth + 1)) as unknown as T;
  }

  if (data instanceof Error) {
    return sanitizeError(data) as unknown as T;
  }

  return sanitizeObject(data as Record<string, unknown>, seen, depth) as T;
};
