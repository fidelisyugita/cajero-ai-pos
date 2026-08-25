import { isSensitiveKey, sanitizeString, sanitizeTelemetry } from "../sanitizeTelemetry";

describe("sanitizeTelemetry", () => {
  describe("sanitizeString", () => {
    it("masks 16-digit credit card numbers preserving last 4 digits", () => {
      const input = "Card payment processed: 4111 2222 3333 4567 approved";
      const result = sanitizeString(input);
      expect(result).toContain("[CARD_REDACTED_...4567]");
      expect(result).not.toContain("4111");
    });

    it("redacts bearer tokens", () => {
      const input = "Authorization failed for Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
      const result = sanitizeString(input);
      expect(result).toContain("Bearer [REDACTED]");
    });

    it("redacts raw JWT strings", () => {
      const input =
        "JWT token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgN passed";
      const result = sanitizeString(input);
      expect(result).toContain("[JWT_REDACTED]");
      expect(result).not.toContain("eyJzdWIiOiIxMjM0NTY3ODkwIn0");
    });
  });

  describe("isSensitiveKey", () => {
    it("identifies sensitive keys accurately", () => {
      expect(isSensitiveKey("password")).toBe(true);
      expect(isSensitiveKey("user_password")).toBe(true);
      expect(isSensitiveKey("accessToken")).toBe(true);
      expect(isSensitiveKey("authorization")).toBe(true);
      expect(isSensitiveKey("card_number")).toBe(true);
      expect(isSensitiveKey("pin")).toBe(true);
      expect(isSensitiveKey("cvv")).toBe(true);
      expect(isSensitiveKey("qris_raw")).toBe(true);
      expect(isSensitiveKey("orderId")).toBe(false);
      expect(isSensitiveKey("storeName")).toBe(false);
    });
  });

  describe("deep sanitization", () => {
    it("redacts sensitive fields in nested objects", () => {
      const payload = {
        orderId: "ORD-999",
        amount: 50000,
        customer: {
          name: "Budi Santoso",
          pin: "123456",
          cardNumber: "5500 0000 1111 9876",
        },
        credentials: {
          password: "SuperSecretPassword123",
          token: "secret-token-xyz",
        },
      };

      const sanitized = sanitizeTelemetry(payload);

      expect(sanitized.orderId).toBe("ORD-999");
      expect(sanitized.amount).toBe(50000);
      expect(sanitized.customer.name).toBe("Budi Santoso");
      expect(sanitized.customer.pin).toBe("[REDACTED]");
      expect(sanitized.customer.cardNumber).toBe("[REDACTED]");
      expect(sanitized.credentials.password).toBe("[REDACTED]");
      expect(sanitized.credentials.token).toBe("[REDACTED]");
    });

    it("sanitizes arrays and Error objects", () => {
      const error = new Error("Payment error with card 4111222233334444");
      const sanitizedError = sanitizeTelemetry(error);

      expect(sanitizedError.message).toContain("[CARD_REDACTED_...4444]");

      const list = [{ pin: "9999", itemName: "Espresso" }, "Credit card 4111-2222-3333-5555"];
      const sanitizedList = sanitizeTelemetry(list);

      expect((sanitizedList[0] as any).pin).toBe("[REDACTED]");
      expect((sanitizedList[0] as any).itemName).toBe("Espresso");
      expect(sanitizedList[1]).toContain("[CARD_REDACTED_...5555]");
    });

    it("handles circular references gracefully without crashing", () => {
      const obj: Record<string, any> = { name: "POS Transaction" };
      obj.self = obj;

      const result = sanitizeTelemetry(obj);
      expect(result.name).toBe("POS Transaction");
      expect(result.self).toBe("[CIRCULAR/MAX_DEPTH]");
    });
  });
});
