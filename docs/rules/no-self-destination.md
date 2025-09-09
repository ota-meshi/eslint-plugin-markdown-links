---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-links/no-self-destination"
description: "disallow redundant self-destination links"
---

# markdown-links/no-self-destination

> disallow redundant self-destination links

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
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

## 🔍 Implementation

<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-links/blob/main/src/rules/no-self-destination.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-links/blob/main/tests/src/rules/no-self-destination.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-links/tree/main/tests/fixtures/rules/no-self-destination)

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
