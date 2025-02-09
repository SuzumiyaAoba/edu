import { describe, expect, it } from "bun:test";

import * as sut from "./octal";

describe("isOctalDigit", () => {
  it.each(["0", "1", "2", "3", "4", "5", "6", "7"])(
    "should return true for octal digits",
    (char) => {
      expect(sut.isOctalDigit(char)).toBe(true);
    },
  );

  it.each(["8", "9"])("should return false for non octal digits", (char) => {
    expect(sut.isOctalDigit(char)).toBe(false);
  });
});

describe("octalDigitToChar", () => {
  it.each([
    { octal: "61", char: "0" },
    { octal: "62", char: "1" },
    { octal: "63", char: "2" },
    { octal: "64", char: "3" },
    { octal: "65", char: "4" },
    { octal: "66", char: "5" },
    { octal: "67", char: "6" },
    { octal: "68", char: "7" },
    { octal: "69", char: "8" },
    { octal: "70", char: "9" },
  ])("should convert octal digit to character", ({ octal, char }) => {
    it(`should convert ${octal} to ${char}`, () => {
      expect(sut.octalDigitToChar(octal)).toBe(char);
    });
  });
});
