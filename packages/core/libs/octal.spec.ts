import { describe, expect, it } from "bun:test";

import * as sut from "./octal";

describe("isOctalDigit", () => {
  it.each(["0", "1", "2", "3", "4", "5", "6", "7"])(
    "should return true for octal digits '%s'",
    (char) => {
      expect(sut.isOctalDigit(char)).toBe(true);
    },
  );

  it.each(["8", "9", "10"])(
    "should return false for non octal digits '%s'",
    (char) => {
      expect(sut.isOctalDigit(char)).toBe(false);
    },
  );
});

describe("isOcalAscii", () => {
  it.each([
    ["0"],
    ["1"],
    ["2"],
    ["3"],
    ["4"],
    ["5"],
    ["6"],
    ["7"],
    ["10"],
    ["77"],
    ["100"],
    ["200"],
    ["207"],
    ["270"],
    ["277"],
  ])("should return true for octal ascii characters '%s'", (str) => {
    expect(sut.isOctalAscii(str)).toBe(true);
  });

  it.each([
    ["8"],
    ["9"],
    ["78"],
    ["87"],
    ["108"],
    ["180"],
    ["208"],
    ["278"],
    ["300"],
  ])("should return false for non octal ascii characters '%s'", (str) => {
    expect(sut.isOctalAscii(str)).toBe(false);
  });
});

describe("octalDigitToChar", () => {
  it.each([
    ["61", "0"],
    ["62", "1"],
    ["63", "2"],
    ["64", "3"],
    ["65", "4"],
    ["66", "5"],
    ["67", "6"],
    ["68", "7"],
    ["69", "8"],
    ["70", "9"],
  ])("should convert octal digit '%s' to character '%s'", (octal, char) => {
    it(`should convert ${octal} to ${char}`, () => {
      expect(sut.octalDigitToChar(octal)).toBe(char);
    });
  });
});
