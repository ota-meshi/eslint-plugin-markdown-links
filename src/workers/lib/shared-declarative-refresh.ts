/**
 * This file is implemented with reference to `dead-or-alive`.
 * Portions of the code are licensed under MIT (Titus Wormer <tituswormer@gmail.com>).
 * <https://github.com/wooorm/dead-or-alive/blob/main/license>
 */

/**
 * Implementation of <https://html.spec.whatwg.org/multipage/semantics.html#shared-declarative-refresh-steps>.
 */
export function sharedDeclarativeRefresh(
  input: string,
  from: URL,
):
  | { type: "success"; url: URL }
  | { type: "error"; url: string; from: URL }
  | null {
  const urlString = sharedDeclarativeRefreshInternal(input);
  if (urlString == null) return null;
  try {
    return {
      type: "success",
      url: new URL(urlString, from),
    };
  } catch {
    return {
      type: "error",
      url: urlString,
      from,
    };
  }
}

/**
 * Implementation of <https://html.spec.whatwg.org/multipage/semantics.html#shared-declarative-refresh-steps>.
 */
function sharedDeclarativeRefreshInternal(input: string): string | null {
  // 2.
  let position = 0;
  // 3.
  skipAsciiWhitespace();
  // 4.
  let before = position;

  // 5. Skip time.
  while (position < input.length && asciiDigit(input.charCodeAt(position))) {
    position++;
  }

  // 6. and 6.1
  if (position === before && !dot(input.charCodeAt(position))) {
    return null;
  }

  // 7. (unneeded).

  // 8. Discard more digits and dots.
  while (
    position < input.length &&
    asciiDigitOrDot(input.charCodeAt(position))
  ) {
    position++;
  }

  // 9. (unneeded).
  // 10.
  before = position;

  if (position < input.length) {
    // 10.2.
    skipAsciiWhitespace();

    // 10.3.
    if (commaOrSemicolon(input.charCodeAt(position))) {
      position++;
    }

    // 10.4.
    skipAsciiWhitespace();
  }

  // 10.1: if no `,` or `;` was found, exit; or: 11.0.
  if (before === position || position === input.length) return null;

  // 11.1.
  const urlString = input.slice(position);

  // 11.2.
  let code = input.charCodeAt(position);
  if (code !== 85 /* `U` */ && code !== 117 /* `u` */)
    return skipQuotes(input, position);
  position++;

  // 11.3.
  code = input.charCodeAt(position);
  if (code !== 82 /* `R` */ && code !== 114 /* `r` */) return urlString;
  position++;

  // 11.4.
  code = input.charCodeAt(position);
  if (code !== 76 /* `L` */ && code !== 108 /* `l` */) return urlString;
  position++;

  // 11.5.
  skipAsciiWhitespace();

  // 11.6.
  if (input.charCodeAt(position) !== 61 /* `=` */) return urlString;
  position++;

  // 11.7.
  skipAsciiWhitespace();
  // 11.8.
  return skipQuotes(input, position);

  /**
   * Skip ASCII whitespace.
   */
  function skipAsciiWhitespace() {
    while (
      position < input.length &&
      asciiWhitespace(input.charCodeAt(position))
    ) {
      position++;
    }
  }
}

/**
 * Skip quotes in the input string.
 * 11.8.
 */
function skipQuotes(input: string, startPosition: number): string {
  let position = startPosition;
  const code = input.charCodeAt(position);

  let quote: number | null = null;
  if (code === 34 /* `"` */ || code === 39 /* `'` */) {
    quote = code;
    position++;
  }

  // 11.9.
  let urlString = input.slice(position);

  // 11.10.
  if (quote != null) {
    const index = urlString.indexOf(String.fromCharCode(quote));

    if (index !== -1) urlString = urlString.slice(0, index);
  }

  return urlString;
}

/**
 * @param {number} code
 * @returns {boolean}
 */
function asciiDigit(code: number) {
  return code >= 48 /* `0` */ && code <= 57;
}

/**
 * @param {number} code
 * @returns {boolean}
 */
function asciiDigitOrDot(code: number) {
  return asciiDigit(code) || dot(code);
}

/**
 * @param {number} code
 * @returns {boolean}
 */
function asciiWhitespace(code: number) {
  return (
    code === 9 /* `\t` */ ||
    code === 10 /* `\n` */ ||
    code === 12 /* `\f` */ ||
    code === 13 /* `\r` */ ||
    code === 32 /* ` ` */
  );
}

/**
 * @param {number} code
 * @returns {boolean}
 */
function dot(code: number) {
  return code === 46; /* `.` */
}

/**
 * @param {number} code
 * @returns {boolean}
 */
function commaOrSemicolon(code: number) {
  return code === 44 /* `,` */ || code === 59; /* `;` */
}
