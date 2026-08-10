/**
  * Utility formatters for Souq El Aouinet Giant platform.
  */

/**
 * Converts Arabic/Eastern digits (٠١٢٣٤٥٦٧٨٩) to standard ASCII digits (0123456789)
 */
export function convertArabicToAsciiDigits(str: string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[٠-٩]/g, (w) => String(arabicDigits.indexOf(w)));
}

/**
 * Parses user input price string into a valid integer number.
 * Examples accepted:
 * "28000" -> 28000
 * "28 000" -> 28000
 * "28,000" -> 28000
 * "٢٨٠٠٠" -> 28000
 * "28000 دج" -> 28000
 * "28.000" -> 28000
 */
export function parsePriceInput(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input === 'number') return isNaN(input) ? null : Math.round(input);

  const raw = String(input).trim();
  if (!raw) return null;

  // Convert eastern digits
  let converted = convertArabicToAsciiDigits(raw);

  // Remove currency signs, letters, and non-numeric characters except digits, dots and commas
  // First, if there's a dot or comma used as thousands separator e.g. "28.000" or "28,000"
  // If the string contains e.g. "28.000", remove dots/commas if they represent thousand separators
  // Remove non-digit characters
  const digitsOnly = converted.replace(/[^\d]/g, '');

  if (!digitsOnly) return null;

  const parsed = parseInt(digitsOnly, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Formats numeric price into localized Arabic display: e.g. "28,000 دج"
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || isNaN(price) || price === 0) {
    return 'السعر عند الاتصال / حسب الاتفاق';
  }

  try {
    const formatted = new Intl.NumberFormat('ar-DZ').format(price);
    return `${formatted} دج`;
  } catch {
    return `${price.toLocaleString()} دج`;
  }
}

/**
 * Deeply cleans object payloads before sending to Firestore.
 * Removes any property whose value is `undefined`.
 * Converts `undefined` in objects or arrays to null or omits keys.
 */
export function cleanForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => cleanForFirestore(item)) as unknown as T;
  }

  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      }
    }
    return cleaned as T;
  }

  return data;
}

/**
 * Formats dates nicely in Arabic
 */
export function formatDate(dateString?: string | number | Date): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('ar-DZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return String(dateString);
  }
}
