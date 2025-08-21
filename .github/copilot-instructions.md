# Copilot Instructions for `eslint-plugin-markdown-links`

This document provides guidelines for AI coding agents to work efficiently in this repository.

Refer to [`CONTRIBUTING.md`] for additional details.

## Communication Guidelines

The maintainer is Japanese and may communicate with you in Japanese, but source code and documentation should be written in **English**.
If you are addressed in Japanese, please conduct the conversation in Japanese.

## Project Overview

`eslint-plugin-markdown-links` is an ESLint plugin that provides rules for checking the validity of links and URLs in Markdown files. Key features include:

- Detecting and reporting dead or unreachable URLs in Markdown documents
- Flexible configuration options for rule behavior
- Designed to work alongside [`@eslint/markdown`](https://github.com/eslint/markdown)

## Development Workflow

### Adding a New Rule

1. Use `npm run new -- <rule-name>` to generate a template for the new rule.
2. Edit the following files to implement the rule:
   - Implementation: `src/rules/<rule-name>.ts`
   - Tests: `tests/src/rules/<rule-name>.ts`
   - Test fixtures: `tests/fixtures/rules/<rule-name>/`
   - Documentation: `docs/rules/<rule-name>.md`

When editing files, please note the following:

- Do not use the `any` type when implementing rules.
- Please use the provided utilities as much as possible when implementing rules.
- Respect the format of the initially generated documentation.
  - In particular, ensure that sample code and the order of sections are consistent with other documents.

### Rule Testing

#### Creating Test Fixtures

Test fixtures for rules should be organized as follows:

```plaintext
tests/fixtures/rules/<rule-name>/
├── invalid/             # Invalid cases
│   ├── xxx-input.md
│   ├── yyy-input.md
│   └── ...
└── valid/               # Valid cases
    ├── xxx-input.md
    ├── yyy-input.md
    └── ...
```

- Name input files descriptively, e.g., `multiple-heading-input.md`, `setext-heading-input.md`, etc.
- Place configuration files as `_config.json` in the same directory. You may also use `xxx-config.json` for input-specific (`xxx-input.md`) configs.
- You may create subdirectories such as `multiline/` or `spaces/` for different test cases.

  **Example:**

  ```plaintext
  tests/fixtures/rules/<rule-name>/
  ├── invalid/
  │   ├── multiline/
  │   │   ├── _config.json
  │   │   ├── xxx-input.md
  │   │   └── ...
  │   ├── yyy-input.md
  │   └── ...
  └── valid/
      ├── spaces/
      │   ├── _config.json
      │   ├── xxx-input.md
      │   └── ...
      ├── yyy-input.md
      └── ...
  ```

- If possible, it is recommended to add a level 1 heading at the beginning of each test case to describe the fixture.

#### Running Tests

Run tests with:

```sh
npm test
```

To update snapshot files, run:

```sh
npm run test:update
```

Ensure that snapshot files reflect the correct results.

#### Updating Rule Lists and Metadata

The rule list, metadata, and type definition files can be automatically generated. After adding or modifying rules, always run:

```sh
npm run update
```

This command will automatically update the rule list, metadata, and type definitions.

### Modifying Existing Rules

- When modifying existing rules, always update tests and documentation as needed.
- For rule testing, see the `Rule Testing` section.
- If you change rule metadata, be sure to run `npm run update` to update the lists and type definitions.

## Important Scripts

Below are the main npm scripts useful for development:

| Script Name           | Description                    |
| :-------------------- | :----------------------------- |
| `npm run new`         | Generate a new rule template   |
| `npm run test`        | Run tests                      |
| `npm run test:update` | Update snapshot tests          |
| `npm run update`      | Update metadata and rule lists |

Refer to [`CONTRIBUTING.md`] for more details.

[`CONTRIBUTING.md`]: ../CONTRIBUTING.md
