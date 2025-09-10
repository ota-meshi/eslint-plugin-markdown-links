# Introduction

`eslint-plugin-markdown-links` is an ESLint plugin that provides rules for checking the validity of links and URLs in Markdown files. It helps you:

- Detect and report dead or unreachable URLs in Markdown documents
- Customize rule behavior via flexible configuration

This plugin is designed to work alongside [@eslint/markdown] and is especially useful for documentation, wikis, and codebases that rely on Markdown files.

[![NPM license](https://img.shields.io/npm/l/eslint-plugin-markdown-links.svg)][npm-package]
[![NPM version](https://img.shields.io/npm/v/eslint-plugin-markdown-links.svg)][npm-package]
[![NPM downloads](https://img.shields.io/badge/dynamic/json.svg?label=downloads&colorB=green&suffix=/day&query=$.downloads&uri=https://api.npmjs.org//downloads/point/last-day/eslint-plugin-markdown-links&maxAge=3600)][npmtrends]
[![NPM downloads](https://img.shields.io/npm/dw/eslint-plugin-markdown-links.svg)][npmtrends]
[![NPM downloads](https://img.shields.io/npm/dm/eslint-plugin-markdown-links.svg)][npmtrends]
[![NPM downloads](https://img.shields.io/npm/dy/eslint-plugin-markdown-links.svg)][npmtrends]
[![NPM downloads](https://img.shields.io/npm/dt/eslint-plugin-markdown-links.svg)][npmtrends]

## 📛 Features

- Reports dead or unreachable external URLs in Markdown files
- Supports flexible configuration for rule behavior
- Integrates with ESLint and works alongside [@eslint/markdown]
- Provides recommended config for easy setup

**Try it live:** Check out the [Online Demo](https://eslint-online-playground.netlify.app/#eslint-plugin-markdown-links) to see the plugin in action!

## 📖 Usage

See [User Guide](./user-guide/index.md).

## ✅ Rules

See [Available Rules](./rules/index.md).

## 👫 Related Packages

- [eslint-plugin-markdown-preferences](https://github.com/ota-meshi/eslint-plugin-markdown-preferences) ... ESLint plugin that enforces our markdown preferences.

<!--DOCS_IGNORE_START-->

## 🍻 Contributing

Welcome contributing!

Please use GitHub's Issues/PRs.

### Development Tools

- `npm test` runs tests and measures coverage.
- `npm run update` runs in order to update readme and recommended configuration.

## 🔒 License

See the [LICENSE](https://github.com/ota-meshi/eslint-plugin-markdown-links/blob/main/LICENSE) file for license rights and limitations (MIT).

[@eslint/markdown]: https://github.com/eslint/markdown
[npm-package]: https://www.npmjs.com/package/eslint-plugin-markdown-links
[npmtrends]: http://www.npmtrends.com/eslint-plugin-markdown-links
