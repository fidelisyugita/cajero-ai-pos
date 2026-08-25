import { rgbaStringToHex6 } from "../Convert";

describe("Convert Utils", () => {
  describe("rgbaStringToHex6", () => {
    it("should convert standard rgb string to 6-character hex", () => {
      expect(rgbaStringToHex6("rgb(255, 0, 128)")).toBe("#ff0080");
    });

    it("should convert rgba string with alpha channel to 6-character hex (ignoring alpha)", () => {
      expect(rgbaStringToHex6("rgba(0, 255, 0, 0.5)")).toBe("#00ff00");
      expect(rgbaStringToHex6("rgba(128, 64, 32, 1.0)")).toBe("#804020");
    });

    it("should pad single digit hex values with leading zero", () => {
      expect(rgbaStringToHex6("rgb(5, 10, 15)")).toBe("#050a0f");
      expect(rgbaStringToHex6("rgba(1, 2, 3, 0.8)")).toBe("#010203");
    });

    it("should handle boundary values for pure black and pure white", () => {
      expect(rgbaStringToHex6("rgb(0, 0, 0)")).toBe("#000000");
      expect(rgbaStringToHex6("rgb(255, 255, 255)")).toBe("#ffffff");
    });

    it("should handle varying whitespace within rgb string", () => {
      expect(rgbaStringToHex6("rgb(  255 ,  128 ,  0 )")).toBe("#ff8000");
      expect(rgbaStringToHex6("rgba(255,128,0,0.5)")).toBe("#ff8000");
    });

    it("should throw an error for invalid RGBA string format", () => {
      expect(() => rgbaStringToHex6("invalid-string")).toThrow("Invalid RGBA string format");
      expect(() => rgbaStringToHex6("#ff0000")).toThrow("Invalid RGBA string format");
      expect(() => rgbaStringToHex6("rgb(255, 255)")).toThrow("Invalid RGBA string format");
      expect(() => rgbaStringToHex6("")).toThrow("Invalid RGBA string format");
    });

    it("should throw an error if RGB values exceed 255", () => {
      expect(() => rgbaStringToHex6("rgb(256, 0, 0)")).toThrow(
        "Invalid RGB values. Values must be between 0-255",
      );
      expect(() => rgbaStringToHex6("rgb(0, 300, 0)")).toThrow(
        "Invalid RGB values. Values must be between 0-255",
      );
    });
  });
});
