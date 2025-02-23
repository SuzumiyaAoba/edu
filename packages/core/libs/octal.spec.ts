import { describe, expect, it } from "bun:test";

import * as sut from "./octal";

describe("isOctalDigit", () => {
  it.each(["0", "1", "2", "3", "4", "5", "6", "7"])(
    "は 8 進数 '%s' を受け取ったとき true を返す",
    (char) => {
      expect(sut.isOctalDigit(char)).toBe(true);
    },
  );

  it.each(["8", "9", "10"])(
    "は非 8 進数 '%s' を受け取ったとき false を返す",
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
  ])("は 8 進数 '%s' を受け取ったとき true を返す", (str) => {
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
  ])("は非 8 進数 '%s' を受け取ったとき false を返す", (str) => {
    expect(sut.isOctalAscii(str)).toBe(false);
  });
});

describe("octalDigitToChar", () => {
  it.each([
    ["60", "0"],
    ["61", "1"],
    ["62", "2"],
    ["63", "3"],
    ["64", "4"],
    ["65", "5"],
    ["66", "6"],
    ["67", "7"],
    ["70", "8"],
    ["71", "9"],
  ])("は 8 進数 '%s' を文字 '%s' に変換する", (octal, char) => {
    expect(sut.octalDigitToChar(octal)).toBe(char);
  });
});
