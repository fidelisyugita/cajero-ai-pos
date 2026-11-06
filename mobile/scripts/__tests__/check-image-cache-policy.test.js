const { checkImageStandards } = require("../check-image-cache-policy");

describe("check-image-cache-policy script", () => {
  it("succeeds when all image components comply with cachePolicy and expo-image rules", () => {
    const result = checkImageStandards();
    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.checkedCount).toBeGreaterThan(0);
  });
});
