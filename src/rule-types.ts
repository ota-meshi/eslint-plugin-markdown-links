// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "npm run update"

/* eslint-disable */
/* prettier-ignore */
import type { Linter } from 'eslint'

declare module 'eslint' {
  namespace Linter {
    interface RulesRecord extends RuleOptions {}
  }
}

export interface RuleOptions {
  /**
   * disallow dead external link urls
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/no-dead-urls.html
   */
  'markdown-links/no-dead-urls'?: Linter.RuleEntry<MarkdownLinksNoDeadUrls>
  /**
   * disallow missing fragment identifiers in same-file Markdown links
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/no-missing-fragments.html
   */
  'markdown-links/no-missing-fragments'?: Linter.RuleEntry<MarkdownLinksNoMissingFragments>
  /**
   * disallow missing local file paths in Markdown links and images
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/no-missing-path.html
   */
  'markdown-links/no-missing-path'?: Linter.RuleEntry<MarkdownLinksNoMissingPath>
  /**
   * disallow redundant self-destination links
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/no-self-destination.html
   */
  'markdown-links/no-self-destination'?: Linter.RuleEntry<[]>
}

/* ======= Declarations ======= */
// ----- markdown-links/no-dead-urls -----
type MarkdownLinksNoDeadUrls = []|[{
  ignoreLocalhost?: boolean
  ignoreUrls?: string[]
  allowedAnchors?: {
    [k: string]: string
  }
  checkAnchor?: boolean
  maxRedirects?: number
  maxRetries?: number
  timeout?: number
}]
// ----- markdown-links/no-missing-fragments -----
type MarkdownLinksNoMissingFragments = []|[{
  ignoreCase?: boolean
  slugify?: ("github" | "mdit-vue")
  [k: string]: unknown | undefined
}]
// ----- markdown-links/no-missing-path -----
type MarkdownLinksNoMissingPath = []|[{
  basePath?: string
  ignorePaths?: string[]
  checkAnchor?: boolean
  allowedAnchors?: {
    [k: string]: string
  }
  anchorOption?: {
    ignoreCase?: boolean
    slugify?: ("github" | "mdit-vue")
    [k: string]: unknown | undefined
  }
  [k: string]: unknown | undefined
}]