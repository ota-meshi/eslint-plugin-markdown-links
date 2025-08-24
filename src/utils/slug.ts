import GithubSlugger from "github-slugger";
import { slugify as mditVueSlugify } from "@mdit-vue/shared";

export type SlugifyKind = "github" | "mdit-vue";
export type Slugify = (text: string) => string;

/**
 * Create a slugify function based on the specified slugify kind.
 */
export function createSlugify(slugify: SlugifyKind): Slugify {
  if (slugify === "mdit-vue") {
    return createUniqueSlugify(mditVueSlugify);
  }
  const slugger = new GithubSlugger();
  return createUniqueSlugify((s) => slugger.slug(s));
}

/**
 * Create a slugify function that ensures unique slugs.
 */
function createUniqueSlugify(
  slugify: (text: string) => string,
): (text: string) => string {
  const slugs = Object.create(null);
  return (text) => {
    const originalSlug = slugify(text);
    return unique(originalSlug);
  };

  /**
   * Create a unique slug by appending a number to the original slug.
   */
  function unique(slug: string) {
    let uniq = slug;
    let i = 1;

    while (slugs[uniq]) {
      uniq = `${slug}-${i}`;
      i += 1;
    }

    slugs[uniq] = true;

    return uniq;
  }
}
