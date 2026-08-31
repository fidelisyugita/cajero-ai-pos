const {
  isExemptString,
  hasI18nIgnoreDirective,
  extractLocaleKeys,
  checkLocaleParity,
  findUnusedKeys,
  analyzeSource,
} = require("../check-i18n");

describe("check-i18n validator", () => {
  describe("isExemptString", () => {
    it("should exempt numbers, currency symbols, and basic punctuation", () => {
      const exempt = [
        "123",
        "0",
        "10.000",
        "+",
        "-",
        ":",
        ": ",
        "/",
        "•",
        "...",
        "*",
        "100%",
        "+ 10.000",
        "IDR",
        "Rp",
        "$",
        "",
        "   ",
      ];

      for (const item of exempt) {
        expect(isExemptString(item)).toBe(true);
      }
    });

    it("should exempt URLs, file extensions, and technical route paths", () => {
      const exempt = [
        "https://example.com/api",
        "http://localhost:8080",
        "/dashboard/stock",
        "icon.svg",
        "avatar.png",
        "#179139",
        "rgba(0,0,0,0.5)",
      ];

      for (const item of exempt) {
        expect(isExemptString(item)).toBe(true);
      }
    });

    it("should not exempt user-facing natural language text", () => {
      const nonExempt = [
        "Add Product",
        "Expense Details",
        "No Image Proof",
        "Submit Order",
        "Please enter your email",
      ];

      for (const item of nonExempt) {
        expect(isExemptString(item)).toBe(false);
      }
    });
  });

  describe("hasI18nIgnoreDirective", () => {
    it("should detect suppression on current or preceding line", () => {
      const lines = [
        "const title = 'Static Title'; // i18n-ignore",
        "// i18n-ignore: Brand identifier",
        "<Text>Cajero POS</Text>",
        "<Text>Normal Text</Text>",
      ];

      expect(hasI18nIgnoreDirective(lines, 0)).toBe(true);
      expect(hasI18nIgnoreDirective(lines, 2)).toBe(true);
      expect(hasI18nIgnoreDirective(lines, 3)).toBe(false);
    });
  });

  describe("extractLocaleKeys", () => {
    it("should extract all property keys from export default object", () => {
      const sampleLocale = `
export default {
  settings: "Settings",
  save_changes: "Save Changes",
  "app_version": "App Version",
};
      `.trim();

      const keys = extractLocaleKeys(sampleLocale, "en.ts");
      expect(keys.has("settings")).toBe(true);
      expect(keys.has("save_changes")).toBe(true);
      expect(keys.has("app_version")).toBe(true);
      expect(keys.size).toBe(3);
    });
  });

  describe("checkLocaleParity", () => {
    it("should identify missing keys in either locale", () => {
      const enKeys = new Set(["settings", "save_changes", "only_in_en"]);
      const idKeys = new Set(["settings", "save_changes", "only_in_id"]);

      const violations = checkLocaleParity(enKeys, idKeys);
      expect(violations.length).toBe(2);

      const missingInId = violations.find((v: any) => v.missingIn === "id.ts");
      expect(missingInId?.key).toBe("only_in_en");

      const missingInEn = violations.find((v: any) => v.missingIn === "en.ts");
      expect(missingInEn?.key).toBe("only_in_id");
    });

    it("should return empty array when locales are in full parity", () => {
      const enKeys = new Set(["settings", "save"]);
      const idKeys = new Set(["settings", "save"]);

      const violations = checkLocaleParity(enKeys, idKeys);
      expect(violations.length).toBe(0);
    });
  });

  describe("findUnusedKeys", () => {
    it("should find keys defined in locale dictionaries that are never referenced", () => {
      const allLocaleKeys = new Set(["used_key_1", "used_key_2", "unused_legacy_key"]);
      const usedKeys = new Set(["used_key_1", "used_key_2"]);

      const unused = findUnusedKeys(allLocaleKeys, usedKeys);
      expect(unused.length).toBe(1);
      expect(unused[0].key).toBe("unused_legacy_key");
    });
  });

  describe("analyzeSource", () => {
    const validKeys = new Set(["settings", "save", "search_placeholder"]);

    it("should detect hardcoded JSX text children", () => {
      const code = `
import React from "react";
import { Text, View } from "react-native";

export const Component = () => (
  <View>
    <Text>Unlocalized Text</Text>
  </View>
);
      `.trim();

      const { violations } = analyzeSource(code, "Component.tsx", validKeys);
      expect(violations.length).toBe(1);
      expect(violations[0].rule).toBe("I18N_HARDCODED_JSX_TEXT");
      expect(violations[0].line).toBe(6);
    });

    it("should detect hardcoded user-facing JSX props", () => {
      const code = `
import React from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export const Form = () => (
  <>
    <Input placeholder="Enter username" label="Username" />
    <Button title="Submit Order" />
  </>
);
      `.trim();

      const { violations } = analyzeSource(code, "Form.tsx", validKeys);
      expect(violations.length).toBe(3);
      expect(violations[0].rule).toBe("I18N_HARDCODED_PROP");
      expect(violations[1].rule).toBe("I18N_HARDCODED_PROP");
      expect(violations[2].rule).toBe("I18N_HARDCODED_PROP");
    });

    it("should detect hardcoded Alert.alert strings", () => {
      const code = `
import { Alert } from "react-native";

export const triggerAlert = () => {
  Alert.alert("Operation Failed", "Could not complete the action");
};
      `.trim();

      const { violations } = analyzeSource(code, "triggerAlert.ts", validKeys);
      expect(violations.length).toBe(2);
      expect(violations[0].rule).toBe("I18N_HARDCODED_ALERT");
      expect(violations[1].rule).toBe("I18N_HARDCODED_ALERT");
    });

    it("should detect invalid key references in t() calls", () => {
      const code = `
import { t } from "@/services/i18n";

export const getTitle = () => {
  return t("non_existent_key");
};
      `.trim();

      const { violations, usedKeys } = analyzeSource(code, "getTitle.ts", validKeys);
      expect(usedKeys.has("non_existent_key")).toBe(true);
      expect(violations.length).toBe(1);
      expect(violations[0].rule).toBe("I18N_INVALID_KEY_REFERENCE");
    });

    it("should pass for properly localized components using t()", () => {
      const code = `
import React from "react";
import { Text } from "react-native";
import { t } from "@/services/i18n";
import Input from "@/components/ui/Input";

export const CleanComponent = () => (
  <>
    <Text>{t("settings")}</Text>
    <Input placeholder={t("search_placeholder")} />
  </>
);
      `.trim();

      const { violations, usedKeys } = analyzeSource(code, "CleanComponent.tsx", validKeys);
      expect(violations.length).toBe(0);
      expect(usedKeys.has("settings")).toBe(true);
      expect(usedKeys.has("search_placeholder")).toBe(true);
    });

    it("should respect i18n-ignore suppression comments", () => {
      const code = `
import React from "react";
import { Text } from "react-native";

export const SuppressedComponent = () => (
  <>
    {/* i18n-ignore */}
    <Text>Cajero AI POS</Text>
    <Text>Brand // i18n-ignore</Text>
  </>
);
      `.trim();

      const { violations } = analyzeSource(code, "SuppressedComponent.tsx", validKeys);
      expect(violations.length).toBe(0);
    });
  });
});
