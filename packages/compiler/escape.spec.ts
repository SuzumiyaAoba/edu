import { describe, expect, it } from "bun:test";

import * as sut from "./escape";

describe("isEscapableChar", () => {
  it.each(["n", "r", "t", "'", "[", "]", "\\"])(
    "should return true if the character is escapable",
    (char) => {
      expect(sut.isEscapableChar(char)).toBe(true);
    },
  );

  it("should return false if the character is not escapable", () => {
    expect(sut.isEscapableChar("x")).toBe(false);
  });
});

describe("unscapeChar", () => {
  it.each([
    ["n", "\n"],
    ["r", "\r"],
    ["t", "\t"],
    ["'", "'"],
    ["\\", "\\"],
  ] as const)("should return the unescaped character", (char, expected) => {
    expect(sut.unescapeChar(char)).toBe(expected);
  });
});
