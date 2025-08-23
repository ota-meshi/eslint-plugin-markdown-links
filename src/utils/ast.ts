import type { Json, Toml } from "@eslint/markdown/types";
import type {
  Blockquote,
  Break,
  Code,
  Definition,
  Delete,
  Emphasis,
  FootnoteDefinition,
  FootnoteReference,
  Heading,
  Html,
  Image,
  ImageReference,
  InlineCode,
  Link,
  LinkReference,
  List,
  ListItem,
  Paragraph,
  Root,
  Strong,
  Table,
  TableCell,
  TableRow,
  Text,
  ThematicBreak,
  Yaml,
} from "mdast";
export type MDNode =
  | Root
  | Blockquote
  | Break
  | Code
  | Definition
  | Emphasis
  | Heading
  | Html
  | Image
  | ImageReference
  | InlineCode
  | Link
  | LinkReference
  | List
  | ListItem
  | Paragraph
  | Strong
  | Text
  | ThematicBreak
  | Delete
  | FootnoteDefinition
  | FootnoteReference
  | Table
  | TableCell
  | TableRow
  | Yaml
  | Toml
  | Json;

/**
 * Traverse the AST and apply the callback to each node.
 */
export function* traverse<R>(
  rootNode: MDNode,
  visitor: {
    enter: (node: MDNode) => Iterable<R>;
    exit: (node: MDNode) => Iterable<R>;
  },
): Iterable<R> {
  const enum Kind {
    enter = 0,
    exit = 1,
  }
  const buffer: [Kind, MDNode][] = [
    [Kind.enter, rootNode],
    [Kind.exit, rootNode],
  ];
  let target: [Kind, MDNode] | undefined;
  while ((target = buffer.shift())) {
    const [kind, node] = target;
    if (kind === Kind.enter) {
      yield* visitor.enter(node);
    } else {
      yield* visitor.exit(node);
      continue;
    }
    if (
      node.type === "blockquote" ||
      node.type === "emphasis" ||
      node.type === "heading" ||
      node.type === "link" ||
      node.type === "linkReference" ||
      node.type === "list" ||
      node.type === "listItem" ||
      node.type === "paragraph" ||
      node.type === "strong" ||
      node.type === "delete" ||
      node.type === "footnoteDefinition" ||
      node.type === "table" ||
      node.type === "tableCell" ||
      node.type === "tableRow" ||
      node.type === "root"
    ) {
      for (let index = node.children.length - 1; index >= 0; index--) {
        const child = node.children[index];
        buffer.unshift([Kind.enter, child], [Kind.exit, child]);
      }
    }
  }
}
