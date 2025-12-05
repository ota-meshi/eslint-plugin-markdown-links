/**
 * This file is implemented with reference to `dead-or-alive`.
 * Portions of the code are licensed under MIT (Titus Wormer <tituswormer@gmail.com>).
 * <https://github.com/wooorm/dead-or-alive/blob/main/license>
 */
import { parse as contentTypeParse } from "fast-content-type-parse";
import { ProxyAgent } from "undici";
import type { OpeningTag } from "../../utils/html.ts";
import { iterateAttrs, iterateHTMLTokens } from "../../utils/html.ts";
import { sharedDeclarativeRefresh } from "./shared-declarative-refresh.ts";

export type Options = {
  checkAnchor: boolean;
  maxRedirects: number;
  maxRetries: number;
  timeout: number;
  NODE_TLS_REJECT_UNAUTHORIZED?: string;
};
type States = {
  messages: never[];
  redirects: number;
  retries: number;
};

export type FetchError = {
  type: "fetch";
  message: string;
};
export type ResponseError = {
  type: "response";
  status: number;
};
export type MaxRedirectError = {
  type: "max-redirect";
  redirects: number;
  maxRedirects: number;
};
export type SharedDeclarativeRefreshError = {
  type: "shared-declarative-refresh";
  url: string;
  from: string;
};
export type MissingAnchorError = {
  type: "missing-anchor";
  url: string;
  fragment: string;
};
export type ErrorResult = {
  type: "error";
  url: string;
  error:
    | FetchError
    | ResponseError
    | MaxRedirectError
    | SharedDeclarativeRefreshError
    | MissingAnchorError;
};
export type SuccessResult = {
  type: "success";
  url: string;
};
export type Result = ErrorResult | SuccessResult;

/**
 * Get the amount of time to sleep for a certain number of retries.
 */
function getSleepMs(retries: number) {
  return retries ** 3 * 1000;
}

/**
 * Check if a URL is valid.
 */
export async function checkUrlResourceStatus(
  url: URL,
  headers: Record<string, string> | null | undefined,
  options: Options,
): Promise<Result> {
  const state: States = {
    messages: [],
    redirects: 0,
    retries: 0,
  };

  return checkUrlResourceStatusInternal(state, url, headers, options);
}

/**
 * Internal method.
 */
async function checkUrlResourceStatusInternal(
  state: States,
  url: URL,
  headers: Record<string, string> | null | undefined,
  options: Options,
): Promise<Result> {
  if (state.redirects > options.maxRedirects) {
    return {
      type: "error",
      error: {
        type: "max-redirect",
        redirects: state.redirects,
        maxRedirects: options.maxRedirects,
      },
      url: url.href,
    };
  }

  let response: Response;

  try {
    // Create a manually abortable fetch,
    // instead of `AbortSignal.timeout(state.timeout)`.
    // This way we only abort slow requests; not the other work.
    const controller = new AbortController();
    const timeoutTimeoutId = setTimeout(() => {
      controller.abort();
    }, options.timeout);

    const agent = autoProxyAgent();
    // eslint-disable-next-line no-process-env -- Apply environment variables.
    process.env.NODE_TLS_REJECT_UNAUTHORIZED =
      options.NODE_TLS_REJECT_UNAUTHORIZED;
    response = await fetch(url, {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        ...headers,
      },
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      ...(agent ? { dispatcher: agent } : {}),
    });

    clearTimeout(timeoutTimeoutId);
  } catch (error) {
    if (state.retries < options.maxRetries)
      return retry(state, url, headers, options);

    return {
      type: "error",
      error: {
        type: "fetch",
        message: (error as Error)?.message,
      },
      url: url.href,
    };
  }

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");

    if (location) {
      const redirect = new URL(location, url);
      state.redirects++;
      return checkUrlResourceStatusInternal(
        {
          ...state,
          // Reset retries if successful.
          retries: 0,
        },
        redirect,
        null,
        options,
      );
    }
  }

  if (!response.ok) {
    if (
      state.retries < options.maxRetries &&
      // When the server says the client is wrong, we don’t try again.
      (response.status < 400 || response.status >= 500)
    ) {
      return retry(
        {
          ...state,
          // Reset retries if successful.
          retries: 0,
        },
        url,
        headers,
        options,
      );
    }
    return {
      type: "error",
      error: {
        type: "response",
        status: response.status,
      },
      url: url.href,
    };
  }

  // Note: defaulting to HTML might not be great?
  const contentType = response.headers.get("content-type") || undefined;

  if (contentType) {
    const type = contentTypeParse(contentType);

    if (type.type === "text/html") {
      return handleTextHtml(state, url, response, options);
    }
  }

  return {
    type: "success",
    url: url.href,
  };
}

/**
 * Retry the request.
 */
async function retry(
  state: States,
  url: URL,
  headers: Record<string, string> | null | undefined,
  options: Options,
) {
  state.retries++;

  await new Promise(function (resolve) {
    setTimeout(resolve, getSleepMs(state.retries));
  });

  return checkUrlResourceStatusInternal(state, url, headers, options);
}

/**
 * @param {State} state
 * @param {Readonly<URL>} url
 * @param {Response} response
 * @returns {Promise<URL>}
 */

/**
 * Handle a text/html response.
 */
async function handleTextHtml(
  state: States,
  url: URL,
  response: Response,
  options: Options,
): Promise<Result> {
  const text = await response.text();
  const openingTags: OpeningTag[] = [];

  for (const token of iterateHTMLTokens(text)) {
    if (token.type !== "opening-tag") continue;
    const tag = token;
    openingTags.push(tag);

    if (tag.tagName !== "meta") continue;

    const attrs = [...iterateAttrs(tag.value)];
    if (
      !attrs.some(
        (attr) =>
          attr.name === "http-equiv" && attr.value?.toLowerCase() === "refresh",
      )
    )
      continue;

    const content = attrs.find((attr) => attr.name.toLowerCase() === "content");

    // Note: this also throws a proper `VFileMessage` when an invalid URL
    // is defined in the HTML.
    const redirect = content?.value
      ? sharedDeclarativeRefresh(String(content?.value), new URL(response.url))
      : undefined;
    if (redirect) {
      if (redirect.type === "error") {
        return {
          type: "error",
          error: {
            type: "shared-declarative-refresh",
            url: redirect.url,
            from: redirect.from.href,
          },
          url: url.href,
        };
      }
      return checkUrlResourceStatusInternal(state, redirect.url, null, options);
    }
  }

  if (!options.checkAnchor || !url.hash) {
    return {
      type: "success",
      url: url.href,
    };
  }

  const fragment = url.hash.slice(1);

  for (const id of extractIdValues(openingTags)) {
    if (encodeURI(id) === fragment) {
      return {
        type: "success",
        url: url.href,
      };
    }
  }

  const responseUrl = new URL(response.url);
  return {
    type: "error",
    error: {
      type: "missing-anchor",
      url: responseUrl.href,
      fragment,
    },
    url: url.href,
  };
}

/**
 * Extract IDs.
 */
function* extractIdValues(openingTags: OpeningTag[]): Iterable<string> {
  for (const openingTag of openingTags) {
    for (const attr of iterateAttrs(openingTag.value)) {
      if (attr.name === "id" && attr.value) {
        yield attr.value;
      }
    }
  }
}

/**
 * Create a proxy agent.
 */
function autoProxyAgent() {
  const PROXY_ENV = [
    "https_proxy",
    "HTTPS_PROXY",
    "http_proxy",
    "HTTP_PROXY",
    "npm_config_https_proxy",
    "npm_config_http_proxy",
  ];

  const proxyStr = PROXY_ENV.map(
    // eslint-disable-next-line no-process-env -- ok
    (k) => process.env[k],
  ).find(Boolean);
  if (!proxyStr) {
    return null;
  }
  const proxyUrl = new URL(proxyStr);

  const encoder = new TextEncoder();
  const encoded = encoder.encode(
    `${proxyUrl.username}:${decodeURIComponent(proxyUrl.password)}`,
  );
  let binary = "";
  for (let i = 0; i < encoded.length; i++) {
    binary += String.fromCharCode(encoded[i]);
  }
  return new ProxyAgent({
    uri: proxyUrl.protocol + proxyUrl.host,
    token:
      proxyUrl.username || proxyUrl.password
        ? `Basic ${btoa(binary)}`
        : undefined,
  });
}
