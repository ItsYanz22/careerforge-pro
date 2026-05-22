import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes all string fields in an object recursively.
 * Strips <script>, <iframe>, <object>, and event handler attributes.
 * Logs a warning when content is removed.
 */
export function sanitizeResumeData<T>(
  data: T,
  userId: string,
  fieldPath = 'root'
): T {
  if (typeof data === 'string') {
    const clean = DOMPurify.sanitize(data, {
      ALLOWED_TAGS: [],       // strip all HTML tags — resume data is plain text
      ALLOWED_ATTR: [],
    });

    if (clean !== data) {
      console.warn(
        `[sanitize] Removed potentially unsafe content from field "${fieldPath}" for user ${userId}`
      );
    }

    return clean as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item, i) =>
      sanitizeResumeData(item, userId, `${fieldPath}[${i}]`)
    ) as unknown as T;
  }

  if (data !== null && typeof data === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      result[key] = sanitizeResumeData(value, userId, `${fieldPath}.${key}`);
    }
    return result as T;
  }

  return data;
}
