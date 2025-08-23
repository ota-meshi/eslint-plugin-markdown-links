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
   * ...
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/no-missing-path.html
   */
  'markdown-links/no-missing-path'?: Linter.RuleEntry<[]>
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