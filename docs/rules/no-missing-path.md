---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-links/no-missing-path"
description: "disallow missing local file paths in Markdown links and images"
since: "v0.2.0"
---

# markdown-links/no-missing-path

> disallow missing local file paths in Markdown links and images

- ⚙️ This rule is included in `plugin.configs.recommended`.

## 📖 Rule Details

This rule reports an error when a link or image path in Markdown does not exist in the file system.
Additionally, when a link contains an anchor fragment (the part after `#`), this rule verifies that the target heading or anchor exists in the referenced file.

For example:

- `[Link](./not-found.md)` will be reported if the file does not actually exist.
- `[Link](./existing-file.md#non-existent-heading)` will be reported if the file exists but the specified heading is not found.

<!-- eslint-skip -->

```md
<!-- eslint markdown-links/no-missing-path: 'error' -->

<!-- ✓ GOOD -->

[markdown-links/no-dead-urls](./no-dead-urls.md)
[Link to existing heading](./no-dead-urls.md#-rule-details)

<!-- ✗ BAD -->

[markdown-links/unknown-rule](./unknown-rule.md)
[Link to non-existent heading](./no-dead-urls.md#non-existent-heading)
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
        "ignoreCase": true,
        "slugify": "github"
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
  - `slugify` (type: `"github" | "mdit-vue"`, default: `"github"`): Specifies which logic to use for slugifying Markdown anchor fragments.
    - `"github"`: Uses [github-slugger] for slugification. This is the same method used by GitHub.
    - `"mdit-vue"`: Uses the slugification logic provided by [mdit-vue]. This is the same method used by VitePress and VuePress.

[github-slugger]: https://www.npmjs.com/package/github-slugger
[mdit-vue]: https://github.com/mdit-vue/mdit-vue

### `anchorOption.slugify`

#### Example for `{ anchorOption: { slugify: "github" } }` (Default)

<!-- eslint-skip -->

```md
<!-- eslint markdown-links/no-missing-path: ["error", { anchorOption: { slugify: "github" } }] -->

<!-- ✓ GOOD -->

[markdown-links/no-dead-urls: Rule Details](./no-dead-urls.md#-rule-details)

<!-- ✗ BAD -->

[markdown-links/no-dead-urls: Rule Details](./no-dead-urls.md#📖-rule-details)
```

#### Example for `{ anchorOption: { slugify: "mdit-vue" } }`

<!-- eslint-skip -->

```md
<!-- eslint markdown-links/no-missing-path: ["error", { anchorOption: { slugify: "mdit-vue" } }] -->

<!-- ✓ GOOD -->

[markdown-links/no-dead-urls: Rule Details](./no-dead-urls.md#📖-rule-details)

<!-- ✗ BAD -->

[markdown-links/no-dead-urls: Rule Details](./no-dead-urls.md#-rule-details)
```

## 📚 Further Reading

None.

## 👫 Related Rules

- [markdown-links/no-dead-urls](./no-dead-urls.md)
- [markdown/no-missing-link-fragments](https://github.com/eslint/markdown/blob/main/docs/rules/no-missing-link-fragments.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-links v0.2.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-links/blob/main/src/rules/no-missing-path.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-links/blob/main/tests/src/rules/no-missing-path.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-links/tree/main/tests/fixtures/rules/no-missing-path)
