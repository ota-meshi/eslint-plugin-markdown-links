import { EntityDecoder } from "entities";
import { DecodingMode, htmlDecodeTree } from "entities/decode";

export type OpeningTag = {
  type: "opening-tag";
  tagName: string;
  value: string;
};
export type ClosingTag = {
  type: "closing-tag";
  tagName: string;
  value: string;
};
export type Text = {
  type: "text";
  value: string;
};
export type RawText = {
  type: "raw";
  value: string;
};
export type CData = {
  type: "cdata";
  value: string;
};
export type Comment = {
  type: "comment";
  value: string;
};
export type Doctype = {
  type: "doctype";
  value: string;
};
export type HTMLToken =
  | OpeningTag
  | ClosingTag
  | Text
  | RawText
  | CData
  | Comment
  | Doctype;
export type Attr = {
  name: string;
  value?: {
    value: string;
    raw: string;
  };
};
/**
 * Iterates over the tokens in a HTML string.
 */
export function* iterateHTMLTokens(code: string): Iterable<HTMLToken> {
  let start = 0;
  const tagRe =
    /<!(?:--[\s\S]*?-->|DOCTYPE[^>]*>|\[CDATA\[[^\]]*\]\]>)|<\/(?<closingTagName>[^\s/>]+)(?:\s[^>]+|\s*)>|<(?<openingTagName>[^\s!/>][^\s/>]*)(?:\s+[^\s/=>]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^"'][^\s/>]+))?)*\s*\/?>/gu;
  const endScriptTagRe = /<\/script(?:\s[^>]+|\s*)>/giu;
  const endStyleTagRe = /<\/style(?:\s[^>]+|\s*)>/giu;
  let match;
  while ((match = tagRe.exec(code))) {
    const value = code.slice(start, match.index);
    if (value) {
      yield { type: "text", value };
    }

    const openingTagName = match.groups?.openingTagName?.toLowerCase();
    if (!openingTagName) {
      // comment or closing tag
      const closingTagName = match.groups?.closingTagName?.toLowerCase();
      if (closingTagName) {
        yield { type: "closing-tag", tagName: closingTagName, value: match[0] };
      } else if (match[0].startsWith("<![CDATA[")) {
        yield { type: "cdata", value: match[0] };
      } else if (match[0].startsWith("<!DOCTYPE")) {
        yield { type: "doctype", value: match[0] };
      } else {
        yield { type: "comment", value: match[0] };
      }
      start = tagRe.lastIndex;
      continue;
    }
    yield { type: "opening-tag", tagName: openingTagName, value: match[0] };

    if (
      (openingTagName === "script" || openingTagName === "style") &&
      !match[0].endsWith("/>")
    ) {
      const endTagRe =
        openingTagName === "script" ? endScriptTagRe : endStyleTagRe;
      endTagRe.lastIndex = tagRe.lastIndex;
      const endTagMatch = endTagRe.exec(code);
      if (endTagMatch) {
        const raw = code.slice(tagRe.lastIndex, endTagMatch.index);
        if (raw) {
          yield { type: "raw", value: raw };
        }
        yield {
          type: "closing-tag",
          tagName: openingTagName,
          value: endTagMatch[0],
        };
        tagRe.lastIndex = endTagRe.lastIndex;
      }
    }
    start = tagRe.lastIndex;
  }
  const value = code.slice(start);
  if (value) {
    yield { type: "text", value };
  }
}

/**
 * Iterates over the attributes of a HTML tag.
 */
export function* iterateAttrs(tag: string): Iterable<Attr> {
  let str = tag;
  if (str.startsWith("<")) {
    str = str.replace(/^<[^\s!/>][^\s/>]*/g, "");
  }
  if (str.endsWith("/>")) {
    str = str.slice(0, -2);
  } else if (str.endsWith(">")) {
    str = str.slice(0, -1);
  }
  const attrNameRe = /[^\s/=>]+\s*/gu;
  let match;
  while ((match = attrNameRe.exec(str))) {
    const attrName = match[0].trim().toLowerCase();
    if (!str.startsWith("=", attrNameRe.lastIndex)) {
      yield { name: attrName };
      continue;
    }
    attrNameRe.lastIndex++;

    // parse value
    let valueStart = attrNameRe.lastIndex;
    for (; valueStart < str.length; valueStart++) {
      const ch = str[valueStart];
      if (!ch.trim()) continue;
      if (ch === "/" || ch === ">") return;
      break;
    }
    const ch = str[valueStart];
    if (ch === '"' || ch === "'") {
      // Maybe quoted
      const endIndex = str.indexOf(ch, valueStart + 1);
      if (endIndex >= 0) {
        // Quoted
        yield {
          name: attrName,
          value: parseAttrValue(str.slice(valueStart + 1, endIndex)),
        };
        attrNameRe.lastIndex = endIndex + 1;
        continue;
      }
    }
    const endIndex = findCharIndex(
      str,
      (c) => !c.trim() || c === "/" || c === ">",
      valueStart,
    );
    if (endIndex >= 0) {
      yield {
        name: attrName,
        value: parseAttrValue(str.slice(valueStart, endIndex)),
      };
      attrNameRe.lastIndex = endIndex + 1;
      continue;
    } else {
      yield {
        name: attrName,
        value: parseAttrValue(str.slice(valueStart)),
      };
      return;
    }
  }
}

/**
 * Finds the index of the first character in `str` (starting from `start`) for which the `hit` function returns true.
 * Returns -1 if no such character is found.
 */
function findCharIndex(
  str: string,
  hit: (c: string) => boolean,
  start: number,
): number {
  for (let i = start; i < str.length; i++) {
    const c = str[i];
    if (hit(c)) {
      return i;
    }
  }
  return -1;
}

/**
 *
 */
function parseAttrValue(raw: string): { value: string; raw: string } {
  let result = "";
  let index = 0;
  while (index < raw.length) {
    const entity = getHTMLEntity(index);
    if (entity) {
      result += entity.entity;
      index += entity.length;
      continue;
    }
    const ch = raw[index++];
    result += ch;
  }
  return {
    value: result,
    raw,
  };

  /**
   * Get HTML entity from the given position
   */
  function getHTMLEntity(position: number) {
    let codeOffset = position;
    if (raw[codeOffset++] !== "&") return null;

    let entity = "";
    const entityDecoder = new EntityDecoder(
      htmlDecodeTree,
      (cp) => (entity += String.fromCodePoint(cp)),
    );
    entityDecoder.startEntity(DecodingMode.Attribute);
    const length = entityDecoder.write(raw, codeOffset);

    if (length < 0) {
      return null;
    }
    if (length === 0) {
      return null;
    }
    return {
      entity,
      length,
    };
  }
}
