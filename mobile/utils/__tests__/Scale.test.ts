import {
  moderateScale,
  moderateVerticalScale,
  ms,
  mvs,
  s,
  scale,
  verticalScale,
  vs,
} from "../Scale";

describe("Scale Utils", () => {
  it("should provide consistent scaling for scale and s alias", () => {
    const scaledValue = scale(20);
    expect(typeof scaledValue).toBe("number");
    expect(s(20)).toBe(scaledValue);
  });

  it("should provide consistent scaling for verticalScale and vs alias", () => {
    const scaledValue = verticalScale(40);
    expect(typeof scaledValue).toBe("number");
    expect(vs(40)).toBe(scaledValue);
  });

  it("should calculate moderateScale with default and custom factor", () => {
    const defaultModerate = moderateScale(100);
    const customFactorModerate = moderateScale(100, 0.25);
    const baseScale = scale(100);

    // Formula: size + (scale(size) - size) * factor
    const expectedDefault = 100 + (baseScale - 100) * 0.5;
    const expectedCustom = 100 + (baseScale - 100) * 0.25;

    expect(defaultModerate).toBeCloseTo(expectedDefault, 5);
    expect(customFactorModerate).toBeCloseTo(expectedCustom, 5);
    expect(ms(100)).toBe(defaultModerate);
  });

  it("should calculate moderateVerticalScale with default and custom factor", () => {
    const defaultModerate = moderateVerticalScale(100);
    const customFactorModerate = moderateVerticalScale(100, 0.8);
    const baseVerticalScale = verticalScale(100);

    const expectedDefault = 100 + (baseVerticalScale - 100) * 0.5;
    const expectedCustom = 100 + (baseVerticalScale - 100) * 0.8;

    expect(defaultModerate).toBeCloseTo(expectedDefault, 5);
    expect(customFactorModerate).toBeCloseTo(expectedCustom, 5);
    expect(mvs(100)).toBe(defaultModerate);
  });

  it("should return 0 when scaling 0", () => {
    expect(scale(0)).toBe(0);
    expect(verticalScale(0)).toBe(0);
    expect(moderateScale(0)).toBe(0);
    expect(moderateVerticalScale(0)).toBe(0);
  });

  it("should handle negative sizes consistently", () => {
    const positive = scale(50);
    const negative = scale(-50);
    expect(negative).toBeCloseTo(-positive, 5);
  });
});
