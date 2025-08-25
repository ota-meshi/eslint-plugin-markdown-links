# Playground

## Check local file paths and fragments

- [Existing File Path](./example2.md)
- [Existing File Path With Existing Fragment](./example2.md#section-1)
- [Non-existent File Path](./missing-file.md)
- [Existing File Path With Non-existent Fragment](./example2.md#missing-section)

## Check external URLs and fragments

- [Existing URL Link](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/)
- [Existing URL Link With Existing Fragment](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/#📛-features)
- [Non-existent URL Link](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/dead)
- [Existing URL Link With Non-existent Fragment](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/#unknown-fragment)

> Note: The `markdown-links/no-dead-urls` rule may report errors in the [ESLint Online Playground] for external links
> to sites that do not support CORS. This can cause some valid URLs to be incorrectly flagged as unreachable.

[ESLint Online Playground]: https://eslint-online-playground.netlify.app/
