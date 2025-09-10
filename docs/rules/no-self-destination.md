---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-links/no-self-destination"
description: "disallow redundant self-destination links"
since: "v0.5.0"
---

# markdown-links/no-self-destination

> disallow redundant self-destination links

- ⚙️ This rule is included in `plugin.configs.recommended`.

## 📖 Rule Details

This rule reports redundant self-destination links. When a file links to itself using its own filename, a simple fragment should be used instead.

<!-- eslint-skip -->

```md
<!-- eslint markdown-links/no-self-destination: 'error' -->

<!-- ✓ GOOD -->

[link](#fragment)
[link](./other.md#fragment)

<!-- ✗ BAD -->

[link](./self.md#fragment)
[link](self.md#fragment)
```

## 🔧 Options

This rule has no options.

## 👫 Related Rules

- [markdown-links/no-missing-path](./no-missing-path.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-links v0.5.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-links/blob/main/src/rules/no-self-destination.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-links/blob/main/tests/src/rules/no-self-destination.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-links/tree/main/tests/fixtures/rules/no-self-destination)
