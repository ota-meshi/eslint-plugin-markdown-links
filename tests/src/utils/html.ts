import assert from "node:assert";
import { iterateTagAndText, iterateAttrs } from "../../../src/utils/html.ts";

describe("iterateTagAndText", () => {
  it("should yield tags and text for simple HTML", () => {
    const html = "<p>Hello <b>world</b>!</p>";
    const result = Array.from(iterateTagAndText(html));
    assert.deepStrictEqual(result, [
      { type: "opening-tag", tagName: "p", value: "<p>" },
      { type: "text", value: "Hello " },
      { type: "opening-tag", tagName: "b", value: "<b>" },
      { type: "text", value: "world" },
      { type: "closing-tag", tagName: "b", value: "</b>" },
      { type: "text", value: "!" },
      { type: "closing-tag", tagName: "p", value: "</p>" },
    ]);
  });

  it("should handle comments and self-closing tags", () => {
    const html = '<img src="a.png"/> <!-- comment -->text';
    const result = Array.from(iterateTagAndText(html));
    assert.deepStrictEqual(result, [
      { type: "opening-tag", tagName: "img", value: '<img src="a.png"/>' },
      { type: "text", value: " " },
      { type: "text", value: "text" },
    ]);
  });

  it("should handle script and style blocks", () => {
    const html = "<style>.a{}</style><script>var a=1;</script>text";
    const result = Array.from(iterateTagAndText(html));
    assert.deepStrictEqual(result, [
      { type: "opening-tag", tagName: "style", value: "<style>" },
      { type: "raw", value: ".a{}" },
      { type: "closing-tag", tagName: "style", value: "</style>" },
      { type: "opening-tag", tagName: "script", value: "<script>" },
      { type: "raw", value: "var a=1;" },
      { type: "closing-tag", tagName: "script", value: "</script>" },
      { type: "text", value: "text" },
    ]);
  });
  it("should yield only text for plain text", () => {
    const html = "plain text";
    const result = Array.from(iterateTagAndText(html));
    assert.deepStrictEqual(result, [{ type: "text", value: "plain text" }]);
  });
  it("should handle various attribute quoting styles", () => {
    const html = "<input a b=\"B\" c=123 d='D' e f=\"\" g= h='' />";
    const result = Array.from(iterateTagAndText(html));
    assert.deepStrictEqual(result, [
      {
        type: "opening-tag",
        tagName: "input",
        value: "<input a b=\"B\" c=123 d='D' e f=\"\" g= h='' />",
      },
    ]);
  });
  it("should handle <br/> self-closing tag", () => {
    const html = "foo<br/>bar<br>";
    const result = Array.from(iterateTagAndText(html));
    assert.deepStrictEqual(result, [
      { type: "text", value: "foo" },
      { type: "opening-tag", tagName: "br", value: "<br/>" },
      { type: "text", value: "bar" },
      { type: "opening-tag", tagName: "br", value: "<br>" },
    ]);
  });
  it("should handle attribute value containing >", () => {
    const html = '<a href="foo>bar">baz</a>';
    const result = Array.from(iterateTagAndText(html));
    assert.deepStrictEqual(result, [
      { type: "opening-tag", tagName: "a", value: '<a href="foo>bar">' },
      { type: "text", value: "baz" },
      { type: "closing-tag", tagName: "a", value: "</a>" },
    ]);
  });
  it("should handle <!-- comment --> inside <script>", () => {
    const html = "<script>var a = `<!-- comment -->`; var b = 2;</script>after";
    const result = Array.from(iterateTagAndText(html));
    assert.deepStrictEqual(result, [
      { type: "opening-tag", tagName: "script", value: "<script>" },
      { type: "raw", value: "var a = `<!-- comment -->`; var b = 2;" },
      { type: "closing-tag", tagName: "script", value: "</script>" },
      { type: "text", value: "after" },
    ]);
  });

  // --- Edge cases ---
  it("should handle tag/attr name case variations", () => {
    const html = '<DIV ID="X">text</DIV>';
    const result = Array.from(iterateTagAndText(html));
    assert.deepStrictEqual(result, [
      { type: "opening-tag", tagName: "div", value: '<DIV ID="X">' },
      { type: "text", value: "text" },
      { type: "closing-tag", tagName: "div", value: "</DIV>" },
    ]);
  });

  it("should handle attribute value with quotes and escapes", () => {
    const html = "<a href='foo\"bar'>baz</a>";
    const result = Array.from(iterateTagAndText(html));
    assert.deepStrictEqual(result, [
      { type: "opening-tag", tagName: "a", value: "<a href='foo\"bar'>" },
      { type: "text", value: "baz" },
      { type: "closing-tag", tagName: "a", value: "</a>" },
    ]);
  });

  it("should handle broken or unclosed tags", () => {
    const html = "<div><span>text";
    const result = Array.from(iterateTagAndText(html));
    assert.deepStrictEqual(result, [
      { type: "opening-tag", tagName: "div", value: "<div>" },
      { type: "opening-tag", tagName: "span", value: "<span>" },
      { type: "text", value: "text" },
    ]);
  });

  it("should handle comments before/after tags", () => {
    const html = "<!--a--><b>text</b><!--b-->";
    const result = Array.from(iterateTagAndText(html));
    assert.deepStrictEqual(result, [
      { type: "opening-tag", tagName: "b", value: "<b>" },
      { type: "text", value: "text" },
      { type: "closing-tag", tagName: "b", value: "</b>" },
    ]);
  });

  it("should handle doctype and cdata", () => {
    const html = "<!DOCTYPE html><![CDATA[foo <bar>]]>";
    const result = Array.from(iterateTagAndText(html));
    assert.deepStrictEqual(result, [
      { type: "cdata", value: "<![CDATA[foo <bar>]]>" },
    ]);
  });

  it("should handle empty tag and empty attribute", () => {
    const html = "<input disabled><img src>";
    const result = Array.from(iterateTagAndText(html));
    assert.deepStrictEqual(result, [
      { type: "opening-tag", tagName: "input", value: "<input disabled>" },
      { type: "opening-tag", tagName: "img", value: "<img src>" },
    ]);
  });

  it("should handle attribute value with = and <,>", () => {
    const html = "<a data='1=2>3'>x</a>";
    const result = Array.from(iterateTagAndText(html));
    assert.deepStrictEqual(result, [
      { type: "opening-tag", tagName: "a", value: "<a data='1=2>3'>" },
      { type: "text", value: "x" },
      { type: "closing-tag", tagName: "a", value: "</a>" },
    ]);
  });

  it("should handle script with tag-like string", () => {
    const html = '<script>var s = "<div>";</script>';
    const result = Array.from(iterateTagAndText(html));
    assert.deepStrictEqual(result, [
      { type: "opening-tag", tagName: "script", value: "<script>" },
      { type: "raw", value: 'var s = "<div>";' },
      { type: "closing-tag", tagName: "script", value: "</script>" },
    ]);
  });

  it("should handle multi-line tag and attribute", () => {
    const html = `<a\nhref="foo"\n>bar</a>`;
    const result = Array.from(iterateTagAndText(html));
    assert.deepStrictEqual(result, [
      { type: "opening-tag", tagName: "a", value: `<a\nhref="foo"\n>` },
      { type: "text", value: "bar" },
      { type: "closing-tag", tagName: "a", value: "</a>" },
    ]);
  });
});

describe("iterateAttrs", () => {
  it("should yield attribute names and values for various quoting styles", () => {
    const tag = "<input a b=\"B\" c=123 d='D' e f=\"\" g= h='' />";
    const result = Array.from(iterateAttrs(tag));
    assert.deepStrictEqual(result, [
      { name: "a" },
      { name: "b", value: "B" },
      { name: "c", value: "123" },
      { name: "d", value: "D" },
      { name: "e" },
      { name: "f", value: "" },
      { name: "g", value: "h=''" },
    ]);
  });

  it("should handle tag with no attributes", () => {
    const tag = "<br>";
    const result = Array.from(iterateAttrs(tag));
    assert.deepStrictEqual(result, []);
  });

  it("should handle attributes with = and <,>", () => {
    const tag = "<a data='1=2>3'>";
    const result = Array.from(iterateAttrs(tag));
    assert.deepStrictEqual(result, [{ name: "data", value: "1=2>3" }]);
  });

  it("should handle attribute value with quotes and escapes", () => {
    const tag = "<a href='foo\"bar'>";
    const result = Array.from(iterateAttrs(tag));
    assert.deepStrictEqual(result, [{ name: "href", value: 'foo"bar' }]);
  });

  it("should handle empty tag and empty attribute", () => {
    const tag = "<input disabled>";
    const result = Array.from(iterateAttrs(tag));
    assert.deepStrictEqual(result, [{ name: "disabled" }]);
  });

  it("should handle multi-line tag and attribute", () => {
    const tag = `<a\nhref="foo"\n>`;
    const result = Array.from(iterateAttrs(tag));
    assert.deepStrictEqual(result, [{ name: "href", value: "foo" }]);
  });
});
