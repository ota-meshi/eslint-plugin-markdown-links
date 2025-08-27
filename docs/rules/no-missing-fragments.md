---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-links/no-missing-fragments"
description: "disallow missing fragment identifiers in same-file Markdown links"
---

# markdown-links/no-missing-fragments

> disallow missing fragment identifiers in same-file Markdown links

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- ⚙️ This rule is included in `plugin.configs.recommended`.

## 📖 Rule Details

This rule reports fragments (anchors) in same-file links that don't exist as headings or HTML element IDs in the current Markdown file.

Fragment identifiers in Markdown links allow you to navigate to specific sections within the same document. This rule helps ensure that all fragment references are valid.

<!-- eslint-skip -->

```md
<!-- eslint markdown-links/no-missing-fragments: 'error' -->

<!-- ✓ GOOD -->

# Section One

Link to [Section Two](#section-two).

## Section Two

<div id="custom-section">Custom Section</div>

Link to [custom section](#custom-section).

<!-- ✗ BAD -->

# Section One

Link to [non-existent section](#non-existent).
```

## 🔧 Options

```json
{
  "markdown-links/no-missing-fragments": [
    "error",
    {
      "ignoreCase": true,
      "slugify": "github"
    }
  ]
}
```

- `ignoreCase` (type: `boolean`, default: `true`): Whether to ignore case when matching anchor fragments.
- `slugify` (type: `"github" | "mdit-vue"`, default: `"github"`): Specifies which logic to use for slugifying Markdown anchor fragments.
  - `"github"`: Uses [github-slugger] for slugification. This is the same method used by GitHub.
  - `"mdit-vue"`: Uses the slugification logic provided by [mdit-vue]. This is the same method used by VitePress and VuePress.

[github-slugger]: https://www.npmjs.com/package/github-slugger
[mdit-vue]: https://github.com/mdit-vue/mdit-vue

## 🔄 Differences From Eslint's `markdown/no-missing-link-fragments`

This rule serves a similar purpose to ESLint's official [markdown/no-missing-link-fragments] rule but focuses specifically on **slugification flexibility**:

- **Slugification**: This rule supports configurable slugification methods (`github` | `mdit-vue`), while the official rule uses GitHub's slugger only

**When to use which:**

- Use `markdown-links/no-missing-fragments` if you need flexible slugification options (e.g., for Vue.js projects using `mdit-vue`)
- **Use the official [@eslint/markdown][@eslint/markdown] rule in most cases** - it provides comprehensive fragment validation with GitHub's standard slugification, which works well for most projects

## 👫 Related Rules

- [markdown/no-missing-link-fragments] - Similar rule from [@eslint/markdown][@eslint/markdown] plugin
- [markdown-links/no-missing-path](./no-missing-path.md)

[@eslint/markdown]: https://www.npmjs.com/package/@eslint/markdown
[markdown/no-missing-link-fragments]: https://github.com/eslint/markdown/blob/main/docs/rules/no-missing-link-fragments.md

## 🔍 Implementation

<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-links/blob/main/src/rules/no-missing-fragments.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-links/blob/main/tests/src/rules/no-missing-fragments.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-links/tree/main/tests/fixtures/rules/no-missing-fragments)

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
