import { describe, it, expect } from "vitest";
import { Fraction } from "./Fraction";

describe("Fraction", () => {
  it("constructs and stringifies", () => {
    expect(new Fraction(1, 2).toString()).toBe("1/2");
    expect(new Fraction(3, 4).toString()).toBe("3/4");
  });

  it("normalizes the sign onto the numerator", () => {
    const f = new Fraction(1, -2);
    expect(f.numerator).toBe(-1);
    expect(f.denominator).toBe(2);
  });

  it("rejects non-integer inputs with a useful message", () => {
    expect(() => new Fraction(1.5, 2)).toThrow(/integer/);
  });

  it("rejects zero denominator with a useful message", () => {
    expect(() => new Fraction(1, 0)).toThrow(/denominator cannot be zero/);
  });

  it("simplifies fractions", () => {
    expect(new Fraction(2, 4).simplified().toString()).toBe("1/2");
    expect(new Fraction(6, 9).simplified().toString()).toBe("2/3");
    expect(new Fraction(4, 2).simplified().toString()).toBe("2/1");
    expect(new Fraction(0, 5).simplified().toString()).toBe("0/1");
  });

  it("reports equivalence via cross-product", () => {
    expect(new Fraction(1, 2).equivalentTo(new Fraction(2, 4))).toBe(true);
    expect(new Fraction(1, 2).equivalentTo(new Fraction(3, 6))).toBe(true);
    expect(new Fraction(1, 2).equivalentTo(new Fraction(1, 3))).toBe(false);
    // The pedagogical heart of the lesson:
    expect(new Fraction(2, 4).equivalentTo(new Fraction(3, 6))).toBe(true);
  });

  it("converts to decimal", () => {
    expect(new Fraction(1, 2).valueAsDecimal()).toBe(0.5);
    expect(new Fraction(1, 4).valueAsDecimal()).toBe(0.25);
  });
});
