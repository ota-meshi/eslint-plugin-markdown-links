/**
 * Decode a percent-encoded URI component without throwing on malformed input.
 */
export function decodeURIComponentSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
