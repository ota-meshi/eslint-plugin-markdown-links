---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-links/no-missing-path"
description: "..."
---

# markdown-links/no-missing-path

> ...

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- ⚙️ This rule is included in `plugin.configs.recommended`.

## 📖 Rule Details

This rule reports an error when a link or image path in Markdown does not exist in the file system.
For example, `[Link](./not-found.md)` will be reported if the file does not actually exist.

<!-- eslint-skip -->

```md
<!-- eslint markdown-links/no-missing-path: 'error' -->

<!-- ✓ GOOD -->

[markdown-links/no-dead-urls](./no-dead-urls.md)

<!-- ✗ BAD -->

[markdown-links/unknown-rule](./unknown-rule.md)
```

## 🔧 Options

```json
{
  "markdown-links/no-missing-path": [
    "error",
    {
      "basePath": null,
      "ignorePaths": [],
      "checkAnchor": true,
      "allowedAnchors": { "/./": "/^:~:/" },
      "anchorOption": {
        "ignoreCase": true
      }
    }
  ]
}
```

- `basePath` (type: `string`, default: current working directory): The base path to use for resolving absolute paths (paths starting with `/`). If not set, the current working directory will be used.
- `ignorePaths` (type: `string[]`, default: `[]`): List of file path patterns (string or RegExp) to ignore. When specifying a regular expression, use a string that looks like a regular expression literal, e.g., `"/\\/foo/u"`. Note that since it is a string, you need to double-escape backslashes. To avoid this, it is recommended to use `` String.raw`/\foo/u` ``.
- `checkAnchor` (type: `boolean`, default: `true`): Also check anchor fragments (the part after `#`) in file paths.
- `allowedAnchors` (type: `Record<string, string>`, default: `{ "/./u": "/^:~:/u" }`): A mapping of file path patterns to anchor fragment patterns (both as strings or regular expressions). Any anchor fragment matching the pattern for the given file path will always be considered valid, even if not present on the target page. You can also use regular expression strings for both file path and fragment.
- `anchorOption`: Options for anchor fragment matching.
  - `ignoreCase` (type: `boolean`, default: `true`): Whether to ignore case when matching anchor fragments.

## 📚 Further Reading

None.

## 👫 Related Rules

- [markdown-links/no-dead-urls](./no-dead-urls.md)
- [markdown/no-missing-link-fragments](https://github.com/eslint/markdown/blob/main/docs/rules/no-missing-link-fragments.md)

## 🔍 Implementation

<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-links/blob/main/src/rules/no-missing-path.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-links/blob/main/tests/src/rules/no-missing-path.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-links/tree/main/tests/fixtures/rules/no-missing-path)

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
