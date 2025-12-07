---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-links/no-dead-urls"
description: "disallow dead external link urls"
since: "v0.1.0"
---

# markdown-links/no-dead-urls

> disallow dead external link urls

## 📖 Rule Details

This rule checks external HTTP/HTTPS links in Markdown files and reports any that are dead or return error responses.

This rule is heavily inspired by [remark-lint-no-dead-urls], and many of its options are based on that library.

<!-- eslint-skip -->

```md
<!-- eslint markdown-links/no-dead-urls: 'error' -->

<!-- ✓ GOOD -->

[Working link](https://www.google.com)

[GitHub][github]

[github]: https://github.com

<!-- ✗ BAD -->

[Dead link](https://this-domain-does-not-exist-12345.com)

[404 link](https://httpstat.us/404)

[broken]: https://non-existent-domain.example
```

## 🔧 Options

```json
{
  "markdown-links/no-dead-urls": [
    "error",
    {
      "ignoreLocalhost": true,
      "ignoreUrls": [],
      "checkAnchor": true,
      "allowedAnchors": { "/./": "/^:~:/" },
      "maxRedirects": 5,
      "maxRetries": 1,
      "timeout": 3000,
      "rateLimitPerDomain": 0,
      "allowStatusCodes": {}
    }
  ]
}
```

- `ignoreLocalhost` (type: `boolean`, default: `true`): Ignore links to localhost/127.0.0.1/0.0.0.0/::1.
- `ignoreUrls` (type: `string[]`, default: `[]`): List of URL patterns (string or RegExp) to ignore. When specifying a regular expression, use a string that looks like a regular expression literal, e.g., `"/\\/foo/u"`. Note that since it is a string, you need to double-escape backslashes. To avoid this, it is recommended to use `` String.raw`/\foo/u` ``.
- `checkAnchor` (type: `boolean`, default: `true`): Also check anchor fragments (the part after `#`) in URLs.
- `allowedAnchors` (type: `Record<string, string>`, default: `{ "/./u": "/^:~:/u" }`): A mapping of URL patterns to anchor fragment patterns (both as strings or regular expressions). Any anchor fragment matching the pattern for the given URL will always be considered valid, even if not present on the target page. You can also use regular expression strings for both URL and fragment.
- `maxRedirects` (type: `integer`, default: `5`): Maximum number of redirects to follow when checking a link.
- `maxRetries` (type: `integer`, default: `1`): Maximum number of retry attempts for each link check.
- `timeout` (type: `integer`, default: `3000`): Timeout in milliseconds for each link check.
- `rateLimitPerDomain` (type: `integer`, default: `0`): Minimum time in milliseconds to wait between requests to the same domain. Set to 0 to disable rate limiting. This helps avoid triggering rate limits or bot protection (e.g., Cloudflare) on domains like npmjs.com. A value of 1000-2000ms is recommended when checking many links to the same domain.
- `allowStatusCodes` (type: `Record<string, number[]>`, default: `{}`): A mapping of domain patterns (as regular expressions) to arrays of HTTP status codes that should be considered successful for those domains. For example, `{ "npmjs\\.com": [403] }` would treat 403 responses from npmjs.com as successful. This is useful when certain domains return non-success status codes for bot-like requests but the links are actually valid.

### Example: Handling rate-limited domains

If you're checking many links to npmjs.com and getting 403 errors due to Cloudflare protection:

```js
{
  "markdown-links/no-dead-urls": [
    "error",
    {
      "rateLimitPerDomain": 1500,
      "allowStatusCodes": {
        "npmjs\\.com": [403]
      }
    }
  ]
}
```

This configuration:
- Waits at least 1.5 seconds between requests to the same domain
- Treats 403 responses from npmjs.com as successful (link is valid)

## 📚 Further Reading

- [remark-lint-no-dead-urls] - A similar rule for Remark, which inspired this rule's implementation.

[remark-lint-no-dead-urls]: https://github.com/remarkjs/remark-lint-no-dead-urls

## 👫 Related Rules

- [markdown-links/no-missing-path](./no-missing-path.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-links v0.1.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-links/blob/main/src/rules/no-dead-urls.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-links/blob/main/tests/src/rules/no-dead-urls.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-links/tree/main/tests/fixtures/rules/no-dead-urls)
