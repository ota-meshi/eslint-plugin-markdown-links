#  no-self-destination (markdown-links/no-self-destination)

> disallow redundant self-destination links

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

