import { t } from "@/services/i18n";
import en from "@/services/locales/en";
import id from "@/services/locales/id";
import { useLanguageStore } from "@/store/useLanguageStore";

describe("i18n Service", () => {
  beforeEach(() => {
    useLanguageStore.setState({ language: "en" });
  });

  describe("Dictionary Parity", () => {
    it("has identical keys in English (en) and Indonesian (id) locale files", () => {
      const enKeys = Object.keys(en).sort();
      const idKeys = Object.keys(id).sort();

      const missingInId = enKeys.filter((key) => !(key in id));
      const missingInEn = idKeys.filter((key) => !(key in en));

      expect(missingInId).toEqual([]);
      expect(missingInEn).toEqual([]);
      expect(enKeys).toEqual(idKeys);
    });

    it("has non-empty string values for all keys across both dictionaries", () => {
      for (const [_key, value] of Object.entries(en)) {
        expect(typeof value).toBe("string");
        expect(value.trim().length).toBeGreaterThan(0);
      }

      for (const [_key, value] of Object.entries(id)) {
        expect(typeof value).toBe("string");
        expect(value.trim().length).toBeGreaterThan(0);
      }
    });
  });

  describe("Translation Retrieval (t)", () => {
    it("returns English translations when language is set to 'en'", () => {
      useLanguageStore.setState({ language: "en" });

      expect(t("settings")).toBe(en.settings);
      expect(t("sign_in")).toBe("Sign In");
      expect(t("transaction")).toBe("Transaction");
    });

    it("returns Indonesian translations when language is set to 'id'", () => {
      useLanguageStore.setState({ language: "id" });

      expect(t("settings")).toBe(id.settings);
      expect(t("sign_in")).toBe("Masuk");
      expect(t("transaction")).toBe("Transaksi");
    });

    it("dynamically reflects language changes from useLanguageStore", () => {
      useLanguageStore.getState().setLanguage("en");
      expect(t("add_product")).toBe("Add Product");

      useLanguageStore.getState().setLanguage("id");
      expect(t("add_product")).toBe("Tambah Produk");

      useLanguageStore.getState().setLanguage("en");
      expect(t("add_product")).toBe("Add Product");
    });

    it("falls back to returning the key if key is not found in dictionary", () => {
      // Cast to any to test runtime fallback safety
      const unknownKey = "non_existent_translation_key" as keyof typeof en;
      expect(t(unknownKey)).toBe("non_existent_translation_key");
    });
  });
});
