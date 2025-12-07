# eslint-plugin-markdown-links

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
- Rate limiting per domain to avoid triggering bot protection (Cloudflare, etc.)
- Configurable status code allowlist for domains that return false positives

**Try it live:** Check out the [Online Demo](https://eslint-online-playground.netlify.app/#eslint-plugin-markdown-links) to see the plugin in action!

<!--DOCS_IGNORE_START-->

## 📖 Documentation

For detailed usage instructions, rule configurations, and examples, visit our comprehensive [documentation site](https://ota-meshi.github.io/eslint-plugin-markdown-links/).

## 💿 Installation

```sh
npm install --save-dev eslint @eslint/markdown eslint-plugin-markdown-links
```

<!--DOCS_IGNORE_END-->

## 📖 Usage

<!--USAGE_SECTION_START-->

<!--USAGE_GUIDE_START-->

### Configuration

#### New Config (`eslint.config.js`)

Use `eslint.config.js` file to configure rules. See also: <https://eslint.org/docs/latest/use/configure/configuration-files-new>.

Example **eslint.config.js**:

```js
import { defineConfig } from "eslint/config";
// import markdown from "@eslint/markdown";
import markdownLinks from "eslint-plugin-markdown-links";
export default [
  // add more generic rule sets here, such as:
  // markdown.configs.recommended,
  markdownLinks.configs.recommended,
  {
    rules: {
      // override/add rules settings here, such as:
      // 'markdown-links/no-dead-urls': 'error'
    },
  },
];
```

This plugin provides configs:

- `*.configs.recommended` ... Recommended config provided by the plugin.

See [the rule list](https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/) to get the `rules` that this plugin provides.

#### Legacy Config (`.eslintrc`)

Is not supported.

<!--USAGE_GUIDE_END-->

<!--USAGE_SECTION_END-->

## ✅ Rules

<!--RULES_SECTION_START-->

The `--fix` option on the [command line](https://eslint.org/docs/latest/use/command-line-interface#fix-problems) automatically fixes problems reported by rules which have a wrench 🔧 below.\
The rules with the following star ⭐ are included in the configs.

<!--RULES_TABLE_START-->

### Markdown Link Rules

<!-- prettier-ignore-start -->

| Rule ID                                                                                                                         | Description                                                       | Fixable | RECOMMENDED |
| :------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------- | :-----: | :---------: |
| [markdown-links/no-dead-urls](https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/no-dead-urls.html)                 | disallow dead external link urls                                  |         |             |
| [markdown-links/no-missing-fragments](https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/no-missing-fragments.html) | disallow missing fragment identifiers in same-file Markdown links |         |             |
| [markdown-links/no-missing-path](https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/no-missing-path.html)           | disallow missing local file paths in Markdown links and images    |         |     ⭐      |
| [markdown-links/no-self-destination](https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/no-self-destination.html)   | disallow redundant self-destination links                         |         |     ⭐      |

<!-- prettier-ignore-end -->

<!--RULES_TABLE_END-->

<!--RULES_SECTION_END-->

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

See the [LICENSE](./LICENSE) file for license rights and limitations (MIT).

[@eslint/markdown]: https://github.com/eslint/markdown
[npm-package]: https://www.npmjs.com/package/eslint-plugin-markdown-links
[npmtrends]: http://www.npmtrends.com/eslint-plugin-markdown-links
