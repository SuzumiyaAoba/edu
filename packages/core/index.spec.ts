import { describe, expect, it } from "bun:test";
import { choice, literal, optional, sequence } from "./parser";

describe("literal", () => {
  it("should parse a literal string correctly", () => {
    const parser = literal("hello");
    const result = parser("hello world", 0);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe("hello");
      expect(result.next).toBe(5);
    }
  });

  it("should fail to parse if the input does not start with the literal", () => {
    const parser = literal("hello");
    const result = parser("world", 0);
    expect(result.success).toBe(false);
  });
});

describe("sequence", () => {
  it("should parse a sequence of literals correctly", () => {
    const parser = sequence(literal("hello"), literal(" "), literal("world"));
    const result = parser("hello world", 0);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual(["hello", " ", "world"]);
      expect(result.next).toBe(11);
    }
  });

  it("should fail to parse if the input does not match the sequence", () => {
    const parser = sequence(literal("hello"), literal("world"));
    const result = parser("hello there", 0);
    expect(result.success).toBe(false);
  });
});

describe("choice", () => {
  it("should parse the first matching choice correctly", () => {
    const parser = choice(literal("hello"), literal("world"));
    const result = parser("hello world", 0);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe("hello");
      expect(result.next).toBe(5);
    }
  });

  it("should parse the second matching choice correctly", () => {
    const parser = choice(literal("hello"), literal("world"));
    const result = parser("world hello", 0);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe("world");
      expect(result.next).toBe(5);
    }
  });

  it("should fail to parse if none of the choices match", () => {
    const parser = choice(literal("hello"), literal("world"));
    const result = parser("there", 0);
    expect(result.success).toBe(false);
  });
});

describe("optional", () => {
  it("should parse the optional parser correctly if it matches", () => {
    const parser = optional(literal("hello"));
    const result = parser("hello world", 0);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual(["hello"]);
      expect(result.next).toBe(5);
    }
  });

  it("should return an empty array if the optional parser does not match", () => {
    const parser = optional(literal("hello"));
    const result = parser("world", 0);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual([]);
      expect(result.next).toBe(0);
    }
  });
});
