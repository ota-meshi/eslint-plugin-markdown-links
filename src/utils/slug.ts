import GithubSlugger from "github-slugger";
import { slugify as mditVueSlugify } from "@mdit-vue/shared";

export type SlugifyKind = "github" | "mdit-vue";
export type Slugify = (text: string) => string;

/**
 * Create a slugify function based on the specified slugify kind.
 */
export function createSlugify(slugify: SlugifyKind): Slugify {
  if (slugify === "mdit-vue") {
    return mditVueSlugify;
  }
  const slugger = new GithubSlugger();
  return (s) => slugger.slug(s);
}
