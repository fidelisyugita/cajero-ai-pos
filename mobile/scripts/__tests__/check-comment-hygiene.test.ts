const {
  isBannedSyntaxNarration,
  validateSuppressionComment,
  analyzeSource,
  fixSource,
} = require("../check-comment-hygiene");

describe("check-comment-hygiene", () => {
  describe("isBannedSyntaxNarration", () => {
    it("should flag AI syntax narration comments", () => {
      const banned = [
        "// set state",
        "// update state",
        "// reset state",
        "// handle click",
        "// handle submit",
        "// handle press",
        "// return JSX",
        "// render component",
        "// render UI",
        "// fetch data",
        "// call api",
        "// useEffect hook",
        "// import components",
        "// helper function",
        "// Step 1: initialize variables",
        "// destructure props",
        "// check if user exists",
        "// navigate to screen",
      ];

      for (const comment of banned) {
        expect({ comment, isBanned: isBannedSyntaxNarration(comment) }).toEqual({
          comment,
          isBanned: true,
        });
      }
    });

    it("should allow architectural rationale, hardware protocols, and issue links", () => {
      const allowed = [
        "// Workaround for React Native scroll bug on Android (see #1234)",
        "// BLE hardware protocol requires 50ms interval between chunk transmissions",
        "// SQLite database connection lock to prevent concurrency conflicts",
        "// esc-pos printer raster bit-image payload generation",
        "// https://github.com/facebook/react-native/issues/9999",
        "// TODO: Refactor into dedicated payment gateway service in v2",
        "// NOTE: Zustand store subscription selector optimization",
      ];

      for (const comment of allowed) {
        expect(isBannedSyntaxNarration(comment)).toBe(false);
      }
    });
  });

  describe("validateSuppressionComment", () => {
    it("should reject biome-ignore without rationale or with rationale < 15 chars", () => {
      expect(
        validateSuppressionComment("// biome-ignore lint/suspicious/noExplicitAny:").isValid,
      ).toBe(false);
      expect(
        validateSuppressionComment("// biome-ignore lint/suspicious/noExplicitAny: fix").isValid,
      ).toBe(false);
      expect(
        validateSuppressionComment("// biome-ignore lint/suspicious/noExplicitAny: todo later")
          .isValid,
      ).toBe(false);
    });

    it("should accept biome-ignore with descriptive rationale >= 15 chars", () => {
      const validComment =
        "// biome-ignore lint/suspicious/noExplicitAny: Generic payload buffer for BLE transport";
      expect(validateSuppressionComment(validComment).isValid).toBe(true);
    });

    it("should reject @ts-ignore without rationale < 15 chars", () => {
      expect(validateSuppressionComment("// @ts-ignore").isValid).toBe(false);
      expect(validateSuppressionComment("// @ts-ignore fix types").isValid).toBe(false);
    });

    it("should accept @ts-ignore with descriptive rationale >= 15 chars", () => {
      const valid =
        "// @ts-ignore: Legacy module lacking upstream TypeScript declaration definitions";
      expect(validateSuppressionComment(valid).isValid).toBe(true);
    });
  });

  describe("analyzeSource", () => {
    it("should detect narration violations with exact lines and columns", () => {
      const code = `
export function Button() {
  // set state
  const [count, setCount] = useState(0);

  // handle click
  const handleClick = () => setCount((c) => c + 1);

  // return JSX
  return <button onClick={handleClick}>{count}</button>;
}
      `.trim();

      const { violations } = analyzeSource(code, "Button.tsx");
      const narrationViolations = violations.filter(
        (v: any) => v.rule === "HYGIENE_SYNTAX_NARRATION",
      );
      expect(narrationViolations.length).toBe(3);
      expect(narrationViolations[0].line).toBe(2);
      expect(narrationViolations[1].line).toBe(5);
      expect(narrationViolations[2].line).toBe(8);
    });

    it("should flag trivial functions with excessive comment bloat", () => {
      const code = `
export function add(a: number, b: number) {
  // calculate first part
  const x = a;
  // calculate second part
  const y = b;
  // compute final sum
  return x + y;
}
      `.trim();

      const { violations } = analyzeSource(code, "add.ts");
      const trivialFnViolations = violations.filter(
        (v: any) => v.rule === "HYGIENE_TRIVIAL_FUNCTION",
      );
      expect(trivialFnViolations.length).toBe(1);
      expect(trivialFnViolations[0].line).toBe(1);
    });

    it("should detect invalid suppressions", () => {
      const code = `
// biome-ignore lint/suspicious/noExplicitAny: fix
const data: any = {};
      `.trim();

      const { violations } = analyzeSource(code, "test.ts");
      expect(violations.length).toBe(1);
      expect(violations[0].rule === "HYGIENE_SUPPRESSION_RATIONALE").toBe(true);
    });

    it("should pass for clean, architectural code", () => {
      const code = `
/**
 * Printer service helper for ESC/POS baud rate negotiation.
 */
export class PrinterHelper {
  // Workaround: ESC/POS hardware handshakes fail if buffer size exceeds 1024 bytes
  private bufferSize = 1024;

  public send(bytes: Uint8Array) {
    if (!bytes.length) return false;
    return true;
  }
}
      `.trim();

      const { violations } = analyzeSource(code, "PrinterHelper.ts");
      expect(violations.length).toBe(0);
    });
  });

  describe("fixSource", () => {
    it("should strip syntax narration comments and keep architectural comments", () => {
      const input = `
import React, { useState } from "react";

export function Counter() {
  // set state
  const [count, setCount] = useState(0);

  // Workaround for hardware counter debounce delay
  const handleClick = () => setCount((c) => c + 1);

  // return JSX
  return <button onClick={handleClick}>{count}</button>;
}
      `.trim();

      const { fixedText, fixedCount } = fixSource(input, "Counter.tsx");
      expect(fixedCount).toBe(2);
      expect(fixedText).not.toContain("// set state");
      expect(fixedText).not.toContain("// return JSX");
      expect(fixedText).toContain("// Workaround for hardware counter debounce delay");
      expect(fixedText).toContain("const [count, setCount] = useState(0);");
    });
  });
});
